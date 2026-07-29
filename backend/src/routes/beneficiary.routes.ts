import { Router } from "express";
import { validate } from "../middleware/validate";
import { vaultBeneficiaryParamsSchema } from "../schemas/common";
import {
  addBeneficiaryHandler,
  addBeneficiarySchema,
  listBeneficiariesHandler,
  removeBeneficiaryHandler,
} from "../controllers/beneficiary.controller";

// mergeParams: true — mounted at /vaults/:id/beneficiaries, needs the
// parent router's :id param.
const router = Router({ mergeParams: true });

router.post("/", validate(addBeneficiarySchema), addBeneficiaryHandler);
router.get("/", listBeneficiariesHandler);
router.delete(
  "/:beneficiaryId",
  validate(vaultBeneficiaryParamsSchema, "params"),
  removeBeneficiaryHandler
);

export default router;
