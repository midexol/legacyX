import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import * as conditionService from "../services/condition.service";

export const createConditionSchema = z.object({
  type: z.enum(["INACTIVITY", "MANUAL_APPROVAL", "MULTI_PARTY_APPROVAL", "LEGAL_DOCUMENT"]),
  config: z.unknown().optional(),
});

export const createConditionHandler = asyncHandler(async (req: Request, res: Response) => {
  const condition = await conditionService.createCondition(req.params.id, req.user!.id, req.body);
  res.status(201).json(condition);
});

export const listConditionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const conditions = await conditionService.listConditions(req.params.id, req.user!.id);
  res.json(conditions);
});

export const approveConditionSchema = z.object({
  address: z.string(),
  signature: z.string(),
});

export const approveConditionHandler = asyncHandler(async (req: Request, res: Response) => {
  const { address, signature } = req.body as z.infer<typeof approveConditionSchema>;
  const condition = await conditionService.approveCondition(req.params.conditionId, address, signature);
  res.json(condition);
});

export const verifyConditionHandler = asyncHandler(async (req: Request, res: Response) => {
  const condition = await conditionService.verifyConditionByAdmin(req.params.conditionId);
  res.json(condition);
});
