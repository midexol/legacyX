import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getMarketplaceStats } from "../services/marketplaceStats.service";

export const getStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getMarketplaceStats());
});
