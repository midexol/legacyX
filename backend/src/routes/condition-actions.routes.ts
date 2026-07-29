import { Router } from "express";
import { requireAdminKey } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { conditionIdParamSchema } from "../schemas/common";
import {
  approveConditionHandler,
  approveConditionSchema,
  verifyConditionHandler,
} from "../controllers/condition.controller";

// Top-level (not vault-owner-scoped) actions on a condition: approvers
// proving control of their own address, and the trusted-verifier flow.
const router = Router();

router.post(
  "/:conditionId/approve",
  validate(conditionIdParamSchema, "params"),
  validate(approveConditionSchema),
  approveConditionHandler
);

router.post(
  "/:conditionId/verify",
  validate(conditionIdParamSchema, "params"),
  requireAdminKey,
  verifyConditionHandler
);

export default router;
