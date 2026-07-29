import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createConditionHandler,
  createConditionSchema,
  listConditionsHandler,
} from "../controllers/condition.controller";

// mergeParams: true — mounted at /vaults/:id/conditions under the
// vault owner's auth session.
const router = Router({ mergeParams: true });

router.post("/", validate(createConditionSchema), createConditionHandler);
router.get("/", listConditionsHandler);

export default router;
