import { prisma } from "../db/prisma";
import { logger } from "../utils/logger";
import { mockTxHash } from "../utils/mockChain";

const MAX_MATCHES_PER_SWEEP = 500;

function findBestSell() {
  return prisma.otcOrder.findFirst({
    where: { side: "SELL", status: "OPEN" },
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
  });
}

function findBestBuy() {
  return prisma.otcOrder.findFirst({
    where: { side: "BUY", status: "OPEN" },
    orderBy: [{ price: "desc" }, { createdAt: "asc" }],
  });
}

// Off-chain price-time-priority crossing engine: pairs the cheapest open
// sell against the richest open buy, fills whichever side is smaller, and
// settles the trade at the resting (earlier-placed) order's price. Runs
// after every order placement and on a cron tick so unattended orders still
// get matched. Only the resulting OtcTrade (amount/price/txHash) is ever
// exposed — never which two orders/owners produced it.
export async function runMatchingSweep() {
  let matches = 0;

  for (let i = 0; i < MAX_MATCHES_PER_SWEEP; i++) {
    const [sell, buy] = await Promise.all([findBestSell(), findBestBuy()]);
    if (!sell || !buy || buy.price < sell.price) break;

    const fillAmount = Math.min(sell.amount, buy.amount);
    const makerOrder = sell.createdAt <= buy.createdAt ? sell : buy;
    const txHash = mockTxHash();

    const trade = await prisma.otcTrade.create({
      data: { amount: fillAmount, price: makerOrder.price, txHash },
    });

    const sellRemaining = sell.amount - fillAmount;
    const buyRemaining = buy.amount - fillAmount;

    await prisma.otcOrder.update({
      where: { id: sell.id },
      data: {
        amount: Math.max(sellRemaining, 0),
        status: sellRemaining > 0 ? "OPEN" : "SETTLED",
        tradeId: trade.id,
      },
    });
    await prisma.otcOrder.update({
      where: { id: buy.id },
      data: {
        amount: Math.max(buyRemaining, 0),
        status: buyRemaining > 0 ? "OPEN" : "SETTLED",
        tradeId: trade.id,
      },
    });

    matches++;
  }

  if (matches > 0) logger.info({ matches }, "OTC matching sweep settled trades");
  return { matches };
}
