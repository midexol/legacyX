import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { isEvmAddress } from "../utils/mockChain";
import * as otcService from "../services/otc.service";

export const listOrdersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await otcService.listActiveOrders();
  res.json(orders);
});

export const createOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = otcService.parseCreateOrderInput(req.body ?? {});
  const order = await otcService.createOrder(input);
  res.status(201).json(otcService.serializeRedacted(order));
});

// NOTE: `address` is trusted as-is, matching API_CONTRACT.md's explicit
// placeholder allowance ("that's fine as a placeholder for now, but flag it
// before this goes anywhere real"). Before production this must require
// proof of address ownership (e.g. a signed-message challenge) — right now
// anyone can read anyone's order history by guessing/knowing their address.
export const listMyOrdersHandler = asyncHandler(async (req: Request, res: Response) => {
  const address = req.query.address;
  if (typeof address !== "string" || !isEvmAddress(address)) {
    throw ApiError.badRequest("address query param must be a valid wallet address");
  }
  const orders = await otcService.listMyOrders(address.toLowerCase());
  res.json(orders);
});
