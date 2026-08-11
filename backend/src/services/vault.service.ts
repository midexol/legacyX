import type { Vault } from "@prisma/client";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/ApiError";
import { isEvmAddress, mockTxHash } from "../utils/mockChain";
import { LegacyVaultClient } from "../chain/legacyVaultClient";
import { onChainConditionTypeNames } from "../chain/legacyVaultAbi";

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

// Links this vault row to a real LegacyVault contract the owner already
// deployed (see contracts/README.md), so verification.service and
// condition.service switch from pure off-chain simulation to acting on the
// real chain for the backend-signable actions. Confirms the contract's
// on-chain owner() matches this user's wallet before trusting the link, so a
// vault can't be pointed at someone else's contract.
export async function linkVaultToChain(
  vaultId: string,
  ownerId: string,
  input: { chainId: number; contractAddress: string }
) {
  const vault = await getOwnedVaultOrThrow(vaultId, ownerId);

  if (!isEvmAddress(input.contractAddress)) {
    throw ApiError.badRequest("contractAddress must be a valid EVM address");
  }
  if (vault.chainId != null) {
    throw ApiError.conflict("Vault is already linked to a chain");
  }

  const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerId } });
  const client = new LegacyVaultClient(input.chainId, input.contractAddress);
  const onChainOwner = await client.getOwner();

  if (onChainOwner.toLowerCase() !== owner.address.toLowerCase()) {
    throw ApiError.badRequest("The deployed LegacyVault's owner() does not match your connected wallet address");
  }

  return prisma.vault.update({
    where: { id: vaultId },
    data: { chainId: input.chainId, contractAddress: input.contractAddress },
  });
}

// Links one DB condition to its counterpart in the contract's `conditions`
// array (the owner adds conditions on-chain themselves, via their own
// wallet, since LegacyVault gates addInactivityCondition/etc. to onlyOwner).
// Cross-checks the on-chain condition's type against the DB row so a
// mismatched index can't silently attach the wrong condition.
export async function linkConditionToChain(
  vaultId: string,
  conditionId: string,
  ownerId: string,
  onChainId: number
) {
  const vault = await getOwnedVaultOrThrow(vaultId, ownerId);
  if (vault.chainId == null || vault.contractAddress == null) {
    throw ApiError.badRequest("Link the vault to a chain before linking its conditions");
  }

  const condition = vault.conditions.find((c) => c.id === conditionId);
  if (!condition) throw ApiError.notFound("Condition not found on this vault");

  const client = new LegacyVaultClient(vault.chainId, vault.contractAddress);
  const length = await client.getConditionsLength();
  if (onChainId < 0 || onChainId >= length) {
    throw ApiError.badRequest(`onChainId ${onChainId} is out of range (contract has ${length} conditions)`);
  }

  const onChain = await client.getCondition(onChainId);
  const onChainType = onChainConditionTypeNames[onChain.conditionType];
  if (onChainType !== condition.type) {
    throw ApiError.badRequest(`On-chain condition ${onChainId} is type ${onChainType}, but this condition is ${condition.type}`);
  }

  return prisma.inheritanceCondition.update({
    where: { id: conditionId },
    data: { onChainId },
  });
}
