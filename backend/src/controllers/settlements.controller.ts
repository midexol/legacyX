import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { listSettlements } from "../services/marketplace.service";

export const listSettlementsHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await listSettlements());
});
