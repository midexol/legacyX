import { prisma } from "../db/prisma";
import { ApiError } from "../utils/ApiError";
import { isEvmAddress } from "../utils/mockChain";
import { getOwnedVaultOrThrow } from "./vault.service";

const BPS_TOTAL = 10_000;

export function percentToBps(percent: number): number {
  return Math.round(percent * 100);
}

export function bpsToPercent(bps: number): number {
  return bps / 100;
}

export interface AddBeneficiaryInput {
  name: string;
  address: string;
  allocation: number; // percent, e.g. 50 for 50%
}

export async function addBeneficiary(vaultId: string, ownerId: string, input: AddBeneficiaryInput) {
  const vault = await getOwnedVaultOrThrow(vaultId, ownerId);

  if (!isEvmAddress(input.address)) {
    throw ApiError.badRequest("Beneficiary address must be a valid EVM address");
  }
  if (input.allocation <= 0 || input.allocation > 100) {
    throw ApiError.badRequest("allocation must be between 0 and 100 (percent)");
  }

  const allocationBps = percentToBps(input.allocation);
  const existingTotal = vault.beneficiaries.reduce((sum, b) => sum + b.allocationBps, 0);

  if (existingTotal + allocationBps > BPS_TOTAL) {
    const remaining = bpsToPercent(BPS_TOTAL - existingTotal);
    throw ApiError.badRequest(
      `Adding ${input.allocation}% exceeds the 100% total allocation limit (${remaining}% remaining)`
    );
  }

  return prisma.beneficiary.create({
    data: {
      vaultId,
      name: input.name,
      address: input.address,
      allocationBps,
    },
  });
}

export async function listBeneficiaries(vaultId: string, ownerId: string) {
  await getOwnedVaultOrThrow(vaultId, ownerId);
  return prisma.beneficiary.findMany({ where: { vaultId }, orderBy: { createdAt: "asc" } });
}

export async function removeBeneficiary(vaultId: string, ownerId: string, beneficiaryId: string) {
  const vault = await getOwnedVaultOrThrow(vaultId, ownerId);
  if (vault.status === "UNLOCKED") {
    throw ApiError.conflict("Cannot modify beneficiaries after the vault has unlocked");
  }

  const beneficiary = vault.beneficiaries.find((b) => b.id === beneficiaryId);
  if (!beneficiary) throw ApiError.notFound("Beneficiary not found on this vault");

  await prisma.beneficiary.delete({ where: { id: beneficiaryId } });
}
