import type { MarketplaceOrder, MarketplaceSettlement } from "@prisma/client";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/ApiError";
import { bucketAmount, isPositiveDecimalString } from "../utils/decimal";
import { isEvmAddress } from "../utils/mockChain";
import { toPublicOrderId } from "../utils/publicId";

export const SUPPORTED_ASSETS = ["FXRP", "FLR", "C2FLR"] as const;
export type Asset = (typeof SUPPORTED_ASSETS)[number];

export interface CreateOrderInput {
  asset: unknown;
  amount: unknown;
  minPrice: unknown;
  sellerAddress: unknown;
}

// Validates and normalizes a POST /api/orders body. Throws ApiError.badRequest
// with a short, human-readable message — the frontend surfaces it directly
// in a toast (see frontend/API_CONTRACT.md), so messages stay terse.
export function parseCreateOrderInput(body: CreateOrderInput): {
  asset: Asset;
  amount: string;
  minPrice: string;
  sellerAddress: string;
} {
  if (typeof body.asset !== "string" || !SUPPORTED_ASSETS.includes(body.asset as Asset)) {
    throw ApiError.badRequest(`asset must be one of ${SUPPORTED_ASSETS.join(", ")}`);
  }
  if (!isPositiveDecimalString(body.amount)) {
    throw ApiError.badRequest("amount must be greater than 0");
  }
  if (!isPositiveDecimalString(body.minPrice)) {
    throw ApiError.badRequest("minPrice must be greater than 0");
  }
  if (typeof body.sellerAddress !== "string" || !isEvmAddress(body.sellerAddress)) {
    throw ApiError.badRequest("sellerAddress must be a valid wallet address");
  }

  return {
    asset: body.asset as Asset,
    amount: body.amount,
    minPrice: body.minPrice,
    // Normalized to lowercase so later case-insensitive lookups (My Orders)
    // are a plain equality match — Postgres collation isn't relied on here.
    sellerAddress: body.sellerAddress.toLowerCase(),
  };
}

export async function createOrder(input: ReturnType<typeof parseCreateOrderInput>) {
  return prisma.marketplaceOrder.create({
    data: {
      asset: input.asset,
      amount: input.amount,
      minPrice: input.minPrice,
      sellerAddress: input.sellerAddress,
      status: "pending",
    },
  });
}

// GET /api/orders — public, redacted. Never includes an address, exact
// amount, or price (only a bucketed amount range) per the contract's core
// privacy rule.
export function serializeRedacted(order: MarketplaceOrder) {
  return {
    id: toPublicOrderId(order.seq),
    asset: order.asset,
    amountRange: bucketAmount(order.amount),
    status: order.status,
    createdAt: order.createdAt.getTime(),
  };
}

// GET /api/orders/mine — full detail, only ever returned to the address that
// owns the order (as seller or matched buyer).
export function serializeMine(order: MarketplaceOrder) {
  return {
    id: toPublicOrderId(order.seq),
    asset: order.asset,
    amount: order.amount,
    minPrice: order.minPrice,
    matchedPrice: order.matchedPrice,
    buyerAddress: order.buyerAddress,
    status: order.status,
    createdAt: order.createdAt.getTime(),
    updatedAt: order.updatedAt.getTime(),
  };
}

export async function listActiveOrders() {
  const orders = await prisma.marketplaceOrder.findMany({
    where: { status: { in: ["pending", "matched", "settled"] } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return orders.map(serializeRedacted);
}

export async function listMyOrders(address: string) {
  const orders = await prisma.marketplaceOrder.findMany({
    where: {
      OR: [{ sellerAddress: { equals: address } }, { buyerAddress: { equals: address } }],
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return orders.map(serializeMine);
}

export function serializeSettlement(settlement: MarketplaceSettlement) {
  return {
    hash: settlement.txHash,
    asset: settlement.asset,
    amountRange: bucketAmount(settlement.amount),
    settledAt: settlement.settledAt.getTime(),
  };
}

export async function listSettlements() {
  const settlements = await prisma.marketplaceSettlement.findMany({
    orderBy: { settledAt: "desc" },
    take: 100,
  });
  return settlements.map(serializeSettlement);
}
