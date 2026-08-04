import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { amountSchema, idParamSchema } from "../schemas/common";
import {
  createVaultHandler,
  createVaultSchema,
  depositHandler,
  getVaultHandler,
  heartbeatHandler,
  linkChainHandler,
  linkChainSchema,
  listVaultsHandler,
  simulateInactivityHandler,
  verifyVaultHandler,
  withdrawHandler,
} from "../controllers/vault.controller";
import beneficiaryRouter from "./beneficiary.routes";
import conditionRouter from "./condition.routes";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createVaultSchema), createVaultHandler);
router.get("/", listVaultsHandler);
router.get("/:id", validate(idParamSchema, "params"), getVaultHandler);

router.post("/:id/deposit", validate(idParamSchema, "params"), validate(amountSchema), depositHandler);
router.post("/:id/withdraw", validate(idParamSchema, "params"), validate(amountSchema), withdrawHandler);
router.post("/:id/heartbeat", validate(idParamSchema, "params"), heartbeatHandler);
router.post("/:id/verify", validate(idParamSchema, "params"), verifyVaultHandler);
router.post(
  "/:id/simulate-inactivity",
  validate(idParamSchema, "params"),
  simulateInactivityHandler
);
router.post("/:id/link-chain", validate(idParamSchema, "params"), validate(linkChainSchema), linkChainHandler);

// Nested resource routers (still under the vault-scoped auth above).
router.use("/:id/beneficiaries", beneficiaryRouter);
router.use("/:id/conditions", conditionRouter);

export default router;
