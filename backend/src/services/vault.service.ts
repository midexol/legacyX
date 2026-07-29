import type { Vault } from "@prisma/client";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/ApiError";
import { mockTxHash } from "../utils/mockChain";

export interface CreateVaultInput {
  name: string;
  currency?: string;
  inactivityDays?: number;
}

export async function createVault(ownerId: string, input: CreateVaultInput) {
  return prisma.vault.create({
    data: {
      ownerId,
      name: input.name,
      currency: input.currency ?? "FXRP",
      inactivityDays: input.inactivityDays ?? 365,
    },
  });
}

export async function listVaultsForOwner(ownerId: string) {
  return prisma.vault.findMany({
    where: { ownerId },
    include: { beneficiaries: true, conditions: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOwnedVaultOrThrow(vaultId: string, ownerId: string) {
  const vault = await prisma.vault.findUnique({
    where: { id: vaultId },
    include: { beneficiaries: true, conditions: { include: { approvals: true } }, transactions: true },
  });
  if (!vault) throw ApiError.notFound("Vault not found");
  if (vault.ownerId !== ownerId) throw ApiError.forbidden("You do not own this vault");
  return vault;
}

async function assertMutableVault(vault: Vault) {
  if (vault.status === "UNLOCKED") {
    throw ApiError.conflict("Vault is unlocked and distributing to beneficiaries; balance is frozen");
  }
}

export async function deposit(vaultId: string, ownerId: string, amount: number) {
  const vault = await getOwnedVaultOrThrow(vaultId, ownerId);
  await assertMutableVault(vault);

  const txHash = mockTxHash();
  const [updated] = await prisma.$transaction([
    prisma.vault.update({
      where: { id: vaultId },
      data: { balance: { increment: amount } },
    }),
    prisma.vaultTransaction.create({
      data: { vaultId, type: "DEPOSIT", amount, txHash },
    }),
  ]);
  return { vault: updated, txHash };
}

export async function withdraw(vaultId: string, ownerId: string, amount: number) {
  const vault = await getOwnedVaultOrThrow(vaultId, ownerId);
  await assertMutableVault(vault);

  if (amount > vault.balance) {
    throw ApiError.badRequest(`Insufficient vault balance: requested ${amount}, available ${vault.balance}`);
  }

  const txHash = mockTxHash();
  const [updated] = await prisma.$transaction([
    prisma.vault.update({
      where: { id: vaultId },
      data: { balance: { decrement: amount } },
    }),
    prisma.vaultTransaction.create({
      data: { vaultId, type: "WITHDRAW", amount, txHash },
    }),
  ]);
  return { vault: updated, txHash };
}

// The on-chain equivalent of "proving you're still alive": resets the
// inactivity countdown so an INACTIVITY condition doesn't trigger.
export async function pingHeartbeat(vaultId: string, ownerId: string) {
  const vault = await getOwnedVaultOrThrow(vaultId, ownerId);
  await assertMutableVault(vault);

  return prisma.vault.update({
    where: { id: vaultId },
    data: { lastHeartbeatAt: new Date() },
  });
}

// Demo/QA helper: backdates the last heartbeat so the next verification
// sweep finds the inactivity window already elapsed, without needing to
// actually wait out `inactivityDays`. Mirrors the brief's note that
// inheritance conditions "can be simulated" for the hackathon.
export async function simulateInactivity(vaultId: string, ownerId: string) {
  const vault = await getOwnedVaultOrThrow(vaultId, ownerId);
  await assertMutableVault(vault);

  const backdated = new Date();
  backdated.setDate(backdated.getDate() - (vault.inactivityDays + 1));

  return prisma.vault.update({
    where: { id: vaultId },
    data: { lastHeartbeatAt: backdated, status: "PENDING_VERIFICATION" },
  });
}
