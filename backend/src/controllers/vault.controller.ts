import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import * as vaultService from "../services/vault.service";
import { verifyVaultNow } from "../services/verification.service";

export const createVaultSchema = z.object({
  name: z.string().min(1).max(120),
  currency: z.string().min(1).max(20).optional(),
  inactivityDays: z.coerce.number().int().positive().max(3650).optional(),
});

export const createVaultHandler = asyncHandler(async (req: Request, res: Response) => {
  const vault = await vaultService.createVault(req.user!.id, req.body);
  res.status(201).json(vault);
});

export const listVaultsHandler = asyncHandler(async (req: Request, res: Response) => {
  const vaults = await vaultService.listVaultsForOwner(req.user!.id);
  res.json(vaults);
});

export const getVaultHandler = asyncHandler(async (req: Request, res: Response) => {
  const vault = await vaultService.getOwnedVaultOrThrow(req.params.id, req.user!.id);
  res.json(vault);
});

export const depositHandler = asyncHandler(async (req: Request, res: Response) => {
  const { amount } = req.body as { amount: number };
  const result = await vaultService.deposit(req.params.id, req.user!.id, amount);
  res.json(result);
});

export const withdrawHandler = asyncHandler(async (req: Request, res: Response) => {
  const { amount } = req.body as { amount: number };
  const result = await vaultService.withdraw(req.params.id, req.user!.id, amount);
  res.json(result);
});

export const heartbeatHandler = asyncHandler(async (req: Request, res: Response) => {
  const vault = await vaultService.pingHeartbeat(req.params.id, req.user!.id);
  res.json(vault);
});

export const simulateInactivityHandler = asyncHandler(async (req: Request, res: Response) => {
  const vault = await vaultService.simulateInactivity(req.params.id, req.user!.id);
  res.json(vault);
});

export const verifyVaultHandler = asyncHandler(async (req: Request, res: Response) => {
  const vault = await verifyVaultNow(req.params.id, req.user!.id);
  res.json(vault);
});
