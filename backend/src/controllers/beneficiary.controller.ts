import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import * as beneficiaryService from "../services/beneficiary.service";

export const addBeneficiarySchema = z.object({
  name: z.string().min(1).max(120),
  address: z.string(),
  allocation: z.coerce.number().positive().max(100),
});

export const addBeneficiaryHandler = asyncHandler(async (req: Request, res: Response) => {
  const beneficiary = await beneficiaryService.addBeneficiary(req.params.id, req.user!.id, req.body);
  res.status(201).json(beneficiary);
});

export const listBeneficiariesHandler = asyncHandler(async (req: Request, res: Response) => {
  const beneficiaries = await beneficiaryService.listBeneficiaries(req.params.id, req.user!.id);
  res.json(beneficiaries);
});

export const removeBeneficiaryHandler = asyncHandler(async (req: Request, res: Response) => {
  await beneficiaryService.removeBeneficiary(req.params.id, req.user!.id, req.params.beneficiaryId);
  res.status(204).send();
});
