import { Router } from "express";
import { validate } from "../middleware/validate";
import { vaultConditionParamsSchema } from "../schemas/common";
import {
  createConditionHandler,
  createConditionSchema,
  linkConditionChainHandler,
  linkConditionChainSchema,
  listConditionsHandler,
} from "../controllers/condition.controller";

// mergeParams: true — mounted at /vaults/:id/conditions under the
// vault owner's auth session.
const router = Router({ mergeParams: true });

router.post("/", validate(createConditionSchema), createConditionHandler);
router.get("/", listConditionsHandler);
router.post(
  "/:conditionId/link-chain",
  validate(vaultConditionParamsSchema, "params"),
  validate(linkConditionChainSchema),
  linkConditionChainHandler
);

export default router;
