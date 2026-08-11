import { Router } from "express";
import { createOrderHandler, listMyOrdersHandler, listOrdersHandler } from "../controllers/orders.controller";

const router = Router();

router.get("/mine", listMyOrdersHandler);
router.get("/", listOrdersHandler);
router.post("/", createOrderHandler);

export default router;
