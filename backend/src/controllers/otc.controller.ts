import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import * as otcService from "../services/otc.service";
import { runMatchingSweep } from "../services/matching.service";

export const createOrderSchema = z.object({
  side: z.enum(["BUY", "SELL"]),
  amount: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  vaultId: z.string().optional(),
});

export const createOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const order = await otcService.createOrder(req.user!.address, req.body);
  // Try to match immediately so the demo doesn't have to wait for the cron tick.
  await runMatchingSweep();
  const current = await otcService.getOrderById(order.id);
  res.status(201).json(otcService.serializeOrder(current ?? order, req.user!.address));
});

export const listOrderBookHandler = asyncHandler(async (req: Request, res: Response) => {
  const orders = await otcService.listOrderBook(req.user?.address);
  res.json(orders);
});

export const cancelOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const order = await otcService.cancelOrder(req.params.id, req.user!.address);
  res.json(order);
});

export const listTradesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const trades = await otcService.listTrades();
  res.json(trades);
});
