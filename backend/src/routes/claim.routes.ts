import { Router } from "express";
import { validate } from "../middleware/validate";
import { addressParamSchema, executeClaimHandler, executeClaimSchema, getClaimableHandler } from "../controllers/claim.controller";
import { vaultOrderParamsSchema } from "../schemas/common";

const router = Router();

// Public lookup — mirrors the claim portal's "scan this address" flow.
router.get("/:address", validate(addressParamSchema, "params"), getClaimableHandler);

// Executing the claim proves address ownership via signature rather than a
// login session, since a beneficiary may never have signed in before.
router.post(
  "/:vaultId/:beneficiaryId",
  validate(vaultOrderParamsSchema, "params"),
  validate(executeClaimSchema),
  executeClaimHandler
);

export default router;
