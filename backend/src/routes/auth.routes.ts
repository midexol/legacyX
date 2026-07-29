import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  nonceSchema,
  requestNonceHandler,
  verifySchema,
  verifySignatureHandler,
} from "../controllers/auth.controller";

const router = Router();

// Step 1 of wallet sign-in: get a message to sign for this address.
router.post("/nonce", validate(nonceSchema), requestNonceHandler);

// Step 2: submit the signature over that message to receive a session JWT.
router.post("/verify", validate(verifySchema), verifySignatureHandler);

export default router;
