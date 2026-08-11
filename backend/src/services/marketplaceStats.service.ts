import { prisma } from "../db/prisma";
import { logger } from "../utils/logger";

const DEFAULT_PRICE_USD = 0.5214;
const PRICE_FLOOR = 0.44;
const PRICE_CEILING = 0.62;
const MAX_STEP = 0.004;

async function getOrCreateMarketStat() {
  return prisma.marketplaceStat.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, priceUsd: DEFAULT_PRICE_USD },
  });
}

// Nudges the simulated FXRP/USD price with a small bounded random walk —
// there's no real Flare/FTSO price feed integration for the hackathon (see
// backend/README.md), this just keeps GET /api/stats from looking static.
export async function tickMarketplacePrice() {
  const current = await getOrCreateMarketStat();
  const step = (Math.random() - 0.5) * 2 * MAX_STEP;
  const next = Math.min(PRICE_CEILING, Math.max(PRICE_FLOOR, current.priceUsd + step));
  await prisma.marketplaceStat.update({ where: { id: 1 }, data: { priceUsd: next } });
  logger.debug({ priceUsd: next }, "Marketplace price tick");
}

export async function getMarketplaceStats() {
  const stat = await getOrCreateMarketStat();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recentSettlements, tradesSettled] = await Promise.all([
    prisma.marketplaceSettlement.findMany({
      where: { settledAt: { gte: since24h } },
      select: { amount: true, price: true },
    }),
    prisma.marketplaceSettlement.count(),
  ]);

  // Display-only aggregate (not a ledger source of truth) — float precision
  // here is fine, unlike order amount/price which stay decimal-string-safe.
  const volume24hUsd = recentSettlements.reduce(
    (sum, s) => sum + Number(s.amount) * Number(s.price),
    0
  );

  return {
    priceUsd: stat.priceUsd,
    volume24hUsd,
    tradesSettled,
  };
}
