import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().min(1) });

export const vaultBeneficiaryParamsSchema = z.object({
  id: z.string().min(1),
  beneficiaryId: z.string().min(1),
});

export const conditionIdParamSchema = z.object({ conditionId: z.string().min(1) });

export const vaultConditionParamsSchema = z.object({
  id: z.string().min(1),
  conditionId: z.string().min(1),
});

export const vaultOrderParamsSchema = z.object({
  vaultId: z.string().min(1),
  beneficiaryId: z.string().min(1),
});

export const amountSchema = z.object({
  amount: z.coerce.number().positive(),
});
