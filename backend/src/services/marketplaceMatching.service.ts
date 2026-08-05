import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { mockAddress, mockTxHash } from "../utils/mockChain";
import { toFixedPoint } from "../utils/decimal";

// frontend/API_CONTRACT.md deliberately leaves matching/settlement up to the
// backend ("that's your system's job, not the frontend's concern"). There's
// no real counterparty liquidity or on-chain settlement to integrate for the
// hackathon, so this simulates both: a pending order "finds a buyer" after
// a short delay (at or above the seller's minPrice), then "settles on-chain"
// after another delay, producing a mock tx hash. The frontend just polls
// GET /api/orders and sees status move pending -> matched -> settled.
//
// Separate from src/services/matching.service.ts, which crosses OtcOrder
// BUY/SELL pairs for the older authenticated /api/otc/* system.

function decimalToDisplayString(scaled: bigint, decimals = 6): string {
  const scale = 10n ** 18n;
  const whole = scaled / scale;
  const frac = scaled % scale;
  const fracStr = frac.toString().padStart(18, "0").slice(0, decimals).replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

// Buyer pays at or up to 8% above the seller's floor — never below it.
function simulateMatchedPrice(minPrice: string): string {
  const floor = toFixedPoint(minPrice);
  const premiumBps = BigInt(Math.floor(Math.random() * 800)); // 0.00%–8.00%
  const matched = floor + (floor * premiumBps) / 10_000n;
  return decimalToDisplayString(matched);
}

export async function runMarketplaceMatchingSweep() {
  const now = Date.now();
  let matched = 0;
  let settled = 0;

  const matchCutoff = new Date(now - env.MARKETPLACE_MATCH_DELAY_MS);
  const pending = await prisma.marketplaceOrder.findMany({
    where: { status: "pending", createdAt: { lte: matchCutoff } },
    take: 100,
  });
  for (const order of pending) {
    await prisma.marketplaceOrder.update({
      where: { seq: order.seq },
      data: {
        status: "matched",
        buyerAddress: mockAddress(),
        matchedPrice: simulateMatchedPrice(order.minPrice),
        matchedAt: new Date(),
      },
    });
    matched++;
  }

  const settleCutoff = new Date(now - env.MARKETPLACE_SETTLE_DELAY_MS);
  const readyToSettle = await prisma.marketplaceOrder.findMany({
    where: { status: "matched", matchedAt: { lte: settleCutoff } },
    take: 100,
  });
  for (const order of readyToSettle) {
    await prisma.$transaction([
      prisma.marketplaceSettlement.create({
        data: {
          orderSeq: order.seq,
          asset: order.asset,
          amount: order.amount,
          price: order.matchedPrice ?? order.minPrice,
          txHash: mockTxHash(),
        },
      }),
      prisma.marketplaceOrder.update({ where: { seq: order.seq }, data: { status: "settled" } }),
    ]);
    settled++;
  }

  if (matched > 0 || settled > 0) {
    logger.info({ matched, settled }, "Marketplace matching sweep");
  }
  return { matched, settled };
}
