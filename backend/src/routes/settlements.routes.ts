import { Router } from "express";
import { listSettlementsHandler } from "../controllers/settlements.controller";

const router = Router();

router.get("/", listSettlementsHandler);

export default router;
