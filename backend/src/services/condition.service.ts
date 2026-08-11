import { prisma } from "../db/prisma";
import { ApiError } from "../utils/ApiError";
import { isEvmAddress } from "../utils/mockChain";
import { verifyOnChainApprovalSignature, verifySignedMessage } from "../utils/signature";
import { getOwnedVaultOrThrow } from "./vault.service";
import { tryUnlockVault } from "./verification.service";
import { LegacyVaultClient } from "../chain/legacyVaultClient";

export type ConditionType = "INACTIVITY" | "MANUAL_APPROVAL" | "MULTI_PARTY_APPROVAL" | "LEGAL_DOCUMENT";

export interface MultiPartyConfig {
  requiredApprovals: number;
  approvers: string[];
}

export interface LegalDocumentConfig {
  documentRef: string;
}

export interface CreateConditionInput {
  type: ConditionType;
  config?: unknown;
}

function normalizeConfig(type: ConditionType, config: unknown): string {
  switch (type) {
    case "INACTIVITY":
    case "MANUAL_APPROVAL":
      return "{}";

    case "MULTI_PARTY_APPROVAL": {
      const cfg = config as Partial<MultiPartyConfig> | undefined;
      const approvers = cfg?.approvers ?? [];
      const requiredApprovals = cfg?.requiredApprovals;

      if (!Array.isArray(approvers) || approvers.length < 2) {
        throw ApiError.badRequest("MULTI_PARTY_APPROVAL requires at least 2 approver addresses");
      }
      if (!approvers.every((a) => typeof a === "string" && isEvmAddress(a))) {
        throw ApiError.badRequest("All approvers must be valid EVM addresses");
      }
      if (
        typeof requiredApprovals !== "number" ||
        requiredApprovals < 1 ||
        requiredApprovals > approvers.length
      ) {
        throw ApiError.badRequest("requiredApprovals must be between 1 and the number of approvers");
      }

      return JSON.stringify({
        approvers: approvers.map((a) => a.toLowerCase()),
        requiredApprovals,
      } satisfies MultiPartyConfig);
    }

    case "LEGAL_DOCUMENT": {
      const cfg = config as Partial<LegalDocumentConfig> | undefined;
      if (!cfg?.documentRef || typeof cfg.documentRef !== "string") {
        throw ApiError.badRequest("LEGAL_DOCUMENT requires a documentRef");
      }
      return JSON.stringify({ documentRef: cfg.documentRef } satisfies LegalDocumentConfig);
    }

    default:
      throw ApiError.badRequest(`Unknown condition type: ${type}`);
  }
}

export async function createCondition(vaultId: string, ownerId: string, input: CreateConditionInput) {
  await getOwnedVaultOrThrow(vaultId, ownerId);
  const config = normalizeConfig(input.type, input.config);

  return prisma.inheritanceCondition.create({
    data: { vaultId, type: input.type, config },
  });
}

export async function listConditions(vaultId: string, ownerId: string) {
  await getOwnedVaultOrThrow(vaultId, ownerId);
  return prisma.inheritanceCondition.findMany({
    where: { vaultId },
    include: { approvals: true },
    orderBy: { createdAt: "asc" },
  });
}

async function getConditionOrThrow(conditionId: string) {
  const condition = await prisma.inheritanceCondition.findUnique({
    where: { id: conditionId },
    include: { approvals: true, vault: true },
  });
  if (!condition) throw ApiError.notFound("Inheritance condition not found");
  return condition;
}

// Peer approval flow for MULTI_PARTY_APPROVAL: each approver proves control
// of their address with a signature rather than a login session, since
// beneficiaries/trustees calling this may never have an authenticated
// LegacyX account of their own.
//
// On a chain-linked vault (vault.contractAddress + condition.onChainId set),
// the approver must sign the on-chain digest (see
// verifyOnChainApprovalSignature) instead of the plain off-chain string,
// because the same signature is then relayed straight into
// LegacyVault.approveCondition — the contract independently re-verifies it,
// so the two verification paths must agree on the exact bytes that were
// signed.
export async function approveCondition(conditionId: string, address: string, signature: string) {
  const condition = await getConditionOrThrow(conditionId);

  if (condition.type !== "MULTI_PARTY_APPROVAL") {
    throw ApiError.badRequest("This condition does not use the multi-party approval flow");
  }
  if (condition.status === "SATISFIED") {
    throw ApiError.conflict("Condition is already satisfied");
  }

  const cfg = JSON.parse(condition.config) as MultiPartyConfig;
  if (!cfg.approvers.includes(address.toLowerCase())) {
    throw ApiError.forbidden("Address is not an approver for this condition");
  }

  const vault = condition.vault;
  const isChainLinked = vault.chainId != null && vault.contractAddress != null && condition.onChainId != null;

  const signatureValid = isChainLinked
    ? verifyOnChainApprovalSignature(condition.onChainId!, vault.contractAddress!, signature, address)
    : verifySignedMessage(`Approve inheritance condition ${condition.id} for vault ${condition.vaultId}`, signature, address);
  if (!signatureValid) {
    throw ApiError.unauthorized("Signature does not match the approval message for this address");
  }

  const alreadyApproved = condition.approvals.some(
    (a) => a.approverAddress.toLowerCase() === address.toLowerCase()
  );
  if (alreadyApproved) {
    throw ApiError.conflict("This address has already approved this condition");
  }

  await prisma.conditionApproval.create({
    data: { conditionId, approverAddress: address.toLowerCase() },
  });

  if (isChainLinked) {
    const client = new LegacyVaultClient(vault.chainId!, vault.contractAddress!);
    const { satisfied, unlocked } = await client.approveCondition(condition.onChainId!, address, signature);

    if (satisfied) {
      await prisma.inheritanceCondition.update({
        where: { id: conditionId },
        data: { status: "SATISFIED", satisfiedAt: new Date() },
      });
    }
    if (unlocked) {
      await tryUnlockVault(condition.vaultId);
    }
  } else {
    const approvalCount = condition.approvals.length + 1;
    if (approvalCount >= cfg.requiredApprovals) {
      await prisma.inheritanceCondition.update({
        where: { id: conditionId },
        data: { status: "SATISFIED", satisfiedAt: new Date() },
      });
      await tryUnlockVault(condition.vaultId);
    }
  }

  return getConditionOrThrow(conditionId);
}

// Stands in for a trusted-verifier integration (death certificate registry,
// legal document notarization, etc.) — gated by the shared ADMIN_API_KEY
// rather than a vault-owner session, because the owner is — by definition —
// the person who may no longer be able to act. On a chain-linked vault, this
// submits the attestation on-chain via the trusted-verifier key
// (contracts/src/LegacyVault.sol#verifyByTrustedVerifier) before mirroring
// the result into Prisma, so the two stay in sync instead of the DB
// unilaterally declaring the condition satisfied.
export async function verifyConditionByAdmin(conditionId: string) {
  const condition = await getConditionOrThrow(conditionId);

  if (condition.type !== "MANUAL_APPROVAL" && condition.type !== "LEGAL_DOCUMENT") {
    throw ApiError.badRequest("This condition type is verified automatically, not by the trusted verifier");
  }
  if (condition.status === "SATISFIED") {
    throw ApiError.conflict("Condition is already satisfied");
  }

  const vault = condition.vault;
  if (vault.chainId != null && vault.contractAddress != null && condition.onChainId != null) {
    const client = new LegacyVaultClient(vault.chainId, vault.contractAddress);
    await client.verifyByTrustedVerifier(condition.onChainId);
  }

  const updated = await prisma.inheritanceCondition.update({
    where: { id: conditionId },
    data: { status: "SATISFIED", satisfiedAt: new Date() },
  });

  await tryUnlockVault(condition.vaultId);
  return updated;
}
