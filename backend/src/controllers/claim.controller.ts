import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import * as claimService from "../services/claim.service";

export const addressParamSchema = z.object({ address: z.string() });

export const getClaimableHandler = asyncHandler(async (req: Request, res: Response) => {
  const claimable = await claimService.getClaimableForAddress(req.params.address);
  res.json(claimable);
});

export const executeClaimSchema = z.object({ signature: z.string() });

export const executeClaimHandler = asyncHandler(async (req: Request, res: Response) => {
  const { signature } = req.body as z.infer<typeof executeClaimSchema>;
  const claim = await claimService.executeClaim(req.params.vaultId, req.params.beneficiaryId, signature);
  res.status(201).json(claim);
});
