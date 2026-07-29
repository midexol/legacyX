import { Router } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../schemas/common";
import {
  cancelOrderHandler,
  createOrderHandler,
  createOrderSchema,
  listOrderBookHandler,
  listTradesHandler,
} from "../controllers/otc.controller";

const router = Router();

// optionalAuth: anonymous callers see a fully anonymized order book; an
// authenticated caller additionally sees which rows are their own orders.
router.get("/orders", optionalAuth, listOrderBookHandler);
router.get("/trades", listTradesHandler);

router.post("/orders", requireAuth, validate(createOrderSchema), createOrderHandler);
router.delete("/orders/:id", requireAuth, validate(idParamSchema, "params"), cancelOrderHandler);

export default router;
