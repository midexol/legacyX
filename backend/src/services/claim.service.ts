import { prisma } from "../db/prisma";
import { ApiError } from "../utils/ApiError";
import { isEvmAddress, mockTxHash } from "../utils/mockChain";
import { verifySignedMessage } from "../utils/signature";
import { bpsToPercent } from "./beneficiary.service";

export interface ClaimableEntry {
  vaultId: string;
  vaultName: string;
  beneficiaryId: string;
  allocationPercent: number;
  claimableAmount: number;
  currency: string;
  unlockedAt: Date | null;
}

export async function getClaimableForAddress(address: string): Promise<ClaimableEntry[]> {
  if (!isEvmAddress(address)) {
    throw ApiError.badRequest("address must be a valid EVM address");
  }

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { vault: { status: "UNLOCKED" } },
    include: { vault: true, claims: true },
  });

  return beneficiaries
    .filter((b) => b.address.toLowerCase() === address.toLowerCase() && b.claims.length === 0)
    .map((b) => ({
      vaultId: b.vaultId,
      vaultName: b.vault.name,
      beneficiaryId: b.id,
      allocationPercent: bpsToPercent(b.allocationBps),
      claimableAmount: ((b.vault.unlockedBalance ?? b.vault.balance) * b.allocationBps) / 10_000,
      currency: b.vault.currency,
      unlockedAt: b.vault.unlockedAt,
    }));
}

export async function executeClaim(vaultId: string, beneficiaryId: string, signature: string) {
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: beneficiaryId },
    include: { vault: true, claims: true },
  });

  if (!beneficiary || beneficiary.vaultId !== vaultId) {
    throw ApiError.notFound("Beneficiary not found on this vault");
  }
  if (beneficiary.vault.status !== "UNLOCKED") {
    throw ApiError.badRequest("Vault has not unlocked — inheritance conditions are not yet satisfied");
  }
  if (beneficiary.claims.length > 0) {
    throw ApiError.conflict("This beneficiary has already claimed their inheritance from this vault");
  }

  const message = `Claim inheritance payout from vault ${vaultId} as beneficiary ${beneficiaryId}`;
  if (!verifySignedMessage(message, signature, beneficiary.address)) {
    throw ApiError.unauthorized("Signature does not match the claim message for this beneficiary address");
  }

  const amount = ((beneficiary.vault.unlockedBalance ?? beneficiary.vault.balance) * beneficiary.allocationBps) / 10_000;
  const txHash = mockTxHash();

  const [claim] = await prisma.$transaction([
    prisma.claim.create({
      data: { vaultId, beneficiaryId, amount, txHash },
    }),
    prisma.vault.update({
      where: { id: vaultId },
      data: { balance: { decrement: Math.min(amount, beneficiary.vault.balance) } },
    }),
    prisma.vaultTransaction.create({
      data: { vaultId, type: "CLAIM", amount, txHash },
    }),
  ]);

  return claim;
}
