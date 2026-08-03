import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getStats } from "../services/stats.service";

export const getStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getStats());
});
