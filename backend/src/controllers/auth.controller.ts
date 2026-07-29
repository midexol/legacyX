import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { requestNonce, verifyAndIssueSession } from "../services/auth.service";

export const nonceSchema = z.object({
  address: z.string(),
});

export const verifySchema = z.object({
  address: z.string(),
  signature: z.string(),
});

export const requestNonceHandler = asyncHandler(async (req: Request, res: Response) => {
  const { address } = req.body as z.infer<typeof nonceSchema>;
  const result = await requestNonce(address);
  res.json(result);
});

export const verifySignatureHandler = asyncHandler(async (req: Request, res: Response) => {
  const { address, signature } = req.body as z.infer<typeof verifySchema>;
  const result = await verifyAndIssueSession(address, signature);
  res.json(result);
});
