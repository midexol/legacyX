import { prisma } from "../db/prisma";
import { ApiError } from "../utils/ApiError";
import { isEvmAddress } from "../utils/mockChain";
import { verifySignedMessage } from "../utils/signature";
import { getOwnedVaultOrThrow } from "./vault.service";
import { tryUnlockVault } from "./verification.service";

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

  const message = `Approve inheritance condition ${condition.id} for vault ${condition.vaultId}`;
  if (!verifySignedMessage(message, signature, address)) {
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

  const approvalCount = condition.approvals.length + 1;
  if (approvalCount >= cfg.requiredApprovals) {
    await prisma.inheritanceCondition.update({
      where: { id: conditionId },
      data: { status: "SATISFIED", satisfiedAt: new Date() },
    });
    await tryUnlockVault(condition.vaultId);
  }

  return getConditionOrThrow(conditionId);
}

// Stands in for a trusted-verifier integration (death certificate registry,
// legal document notarization, etc.) that's out of scope for the hackathon.
// Gated by the shared ADMIN_API_KEY rather than a vault-owner session,
// because the owner is — by definition — the person who may no longer be
// able to act.
export async function verifyConditionByAdmin(conditionId: string) {
  const condition = await getConditionOrThrow(conditionId);

  if (condition.type !== "MANUAL_APPROVAL" && condition.type !== "LEGAL_DOCUMENT") {
    throw ApiError.badRequest("This condition type is verified automatically, not by the trusted verifier");
  }
  if (condition.status === "SATISFIED") {
    throw ApiError.conflict("Condition is already satisfied");
  }

  const updated = await prisma.inheritanceCondition.update({
    where: { id: conditionId },
    data: { status: "SATISFIED", satisfiedAt: new Date() },
  });

  await tryUnlockVault(condition.vaultId);
  return updated;
}
