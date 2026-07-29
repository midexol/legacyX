import type { OtcOrder } from "@prisma/client";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/ApiError";

export interface CreateOtcOrderInput {
  side: "BUY" | "SELL";
  amount: number;
  price: number;
  vaultId?: string;
}

export async function createOrder(ownerAddress: string, input: CreateOtcOrderInput) {
  if (input.amount <= 0) throw ApiError.badRequest("amount must be greater than 0");
  if (input.price <= 0) throw ApiError.badRequest("price must be greater than 0");

  return prisma.otcOrder.create({
    data: {
      ownerAddress,
      side: input.side,
      amount: input.amount,
      price: input.price,
      vaultId: input.vaultId,
    },
  });
}

// The order book never reveals whose order is whose (matching the brief's
// "who the seller is / who the buyer is" confidentiality requirement) —
// unless the caller happens to be authenticated as that order's own owner.
export function serializeOrder(order: OtcOrder, viewerAddress?: string) {
  const mine = viewerAddress != null && order.ownerAddress.toLowerCase() === viewerAddress.toLowerCase();
  return {
    id: order.id,
    side: order.side,
    amount: order.amount,
    price: order.price,
    status: order.status,
    createdAt: order.createdAt,
    mine,
    ...(mine ? { ownerAddress: order.ownerAddress } : {}),
  };
}

export async function getOrderById(orderId: string) {
  return prisma.otcOrder.findUnique({ where: { id: orderId } });
}

export async function listOrderBook(viewerAddress?: string) {
  const orders = await prisma.otcOrder.findMany({
    where: { status: { in: ["OPEN", "MATCHED", "SETTLED"] } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return orders.map((o) => serializeOrder(o, viewerAddress));
}

export async function cancelOrder(orderId: string, ownerAddress: string) {
  const order = await prisma.otcOrder.findUnique({ where: { id: orderId } });
  if (!order) throw ApiError.notFound("Order not found");
  if (order.ownerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw ApiError.forbidden("You do not own this order");
  }
  if (order.status !== "OPEN") {
    throw ApiError.conflict("Only open orders can be cancelled");
  }

  return prisma.otcOrder.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
}

export async function listTrades() {
  return prisma.otcTrade.findMany({
    orderBy: { settledAt: "desc" },
    take: 200,
    select: { id: true, amount: true, price: true, txHash: true, settledAt: true },
  });
}
