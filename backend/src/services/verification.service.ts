import { prisma } from "../db/prisma";
import { logger } from "../utils/logger";
import { getOwnedVaultOrThrow } from "./vault.service";
import { LegacyVaultClient } from "../chain/legacyVaultClient";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// A vault unlocks the moment ANY one of its configured conditions is
// satisfied (inactivity timeout OR manual/legal verification OR multi-party
// approval quorum) — mirroring the brief's list of alternative release
// triggers. Snapshotting `balance` into `unlockedBalance` here means each
// beneficiary's payout is fixed at unlock time, independent of the order in
// which they later claim.
export async function tryUnlockVault(vaultId: string) {
  const vault = await prisma.vault.findUnique({
    where: { id: vaultId },
    include: { conditions: true },
  });
  if (!vault || vault.status === "UNLOCKED") return;

  const hasSatisfiedCondition = vault.conditions.some((c) => c.status === "SATISFIED");
  if (!hasSatisfiedCondition) return;

  await prisma.vault.update({
    where: { id: vaultId },
    data: {
      status: "UNLOCKED",
      unlockedAt: new Date(),
      unlockedBalance: vault.balance,
    },
  });
  logger.info({ vaultId }, "Vault unlocked — inheritance condition satisfied");
}

async function evaluateInactivityCondition(condition: { id: string; vaultId: string; onChainId: number | null }) {
  const vault = await prisma.vault.findUnique({ where: { id: condition.vaultId } });
  if (!vault) return;

  if (vault.chainId != null && vault.contractAddress != null && condition.onChainId != null) {
    await evaluateInactivityConditionOnChain(vault.chainId, vault.contractAddress, condition.id, condition.onChainId, vault.id);
    return;
  }

  const elapsedMs = Date.now() - vault.lastHeartbeatAt.getTime();
  const elapsedDays = elapsedMs / MS_PER_DAY;

  if (elapsedDays >= vault.inactivityDays) {
    await prisma.inheritanceCondition.update({
      where: { id: condition.id },
      data: { status: "SATISFIED", satisfiedAt: new Date() },
    });
    await tryUnlockVault(vault.id);
  } else if (vault.status === "ACTIVE") {
    await prisma.vault.update({ where: { id: vault.id }, data: { status: "PENDING_VERIFICATION" } });
  }
}

// Chain-linked equivalent of the off-chain math above: submits the sweep to
// the real LegacyVault contract (permissionless there, so signed by the
// backend's operator key) and mirrors whatever it decided back into Prisma,
// rather than re-deriving the elapsed-time decision locally.
async function evaluateInactivityConditionOnChain(
  chainId: number,
  contractAddress: string,
  conditionId: string,
  onChainConditionId: number,
  vaultId: string
) {
  const client = new LegacyVaultClient(chainId, contractAddress);
  const { unlocked } = await client.checkInactivity(onChainConditionId);

  if (unlocked) {
    await prisma.inheritanceCondition.update({
      where: { id: conditionId },
      data: { status: "SATISFIED", satisfiedAt: new Date() },
    });
    await tryUnlockVault(vaultId);
    logger.info({ vaultId, conditionId }, "Vault unlocked on-chain — inactivity condition satisfied");
  } else {
    await prisma.vault.update({ where: { id: vaultId }, data: { status: "PENDING_VERIFICATION" } });
  }
}

// The background "verification layer" described in the brief: periodically
// checks every pending INACTIVITY condition against its vault's heartbeat
// window. Multi-party/manual/legal-document conditions are event-driven
// (see condition.service) and don't need sweeping.
export async function runVerificationSweep() {
  const pendingInactivity = await prisma.inheritanceCondition.findMany({
    where: { type: "INACTIVITY", status: "PENDING" },
    select: { id: true, vaultId: true, onChainId: true },
  });

  for (const condition of pendingInactivity) {
    await evaluateInactivityCondition(condition);
  }

  return { checked: pendingInactivity.length };
}

// Owner-triggered on-demand check, useful for a deterministic hackathon demo
// instead of waiting for the next cron tick.
export async function verifyVaultNow(vaultId: string, ownerId: string) {
  await getOwnedVaultOrThrow(vaultId, ownerId);

  const conditions = await prisma.inheritanceCondition.findMany({
    where: { vaultId, type: "INACTIVITY", status: "PENDING" },
    select: { id: true, vaultId: true, onChainId: true },
  });
  for (const condition of conditions) {
    await evaluateInactivityCondition(condition);
  }

  return getOwnedVaultOrThrow(vaultId, ownerId);
}
