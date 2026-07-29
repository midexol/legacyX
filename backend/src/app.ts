import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import vaultRoutes from "./routes/vault.routes";
import claimRoutes from "./routes/claim.routes";
import otcRoutes from "./routes/otc.routes";
import conditionActionsRoutes from "./routes/condition-actions.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_ORIGIN }));
  app.use(express.json());
  app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== "test" }));

  app.use("/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/vaults", vaultRoutes);
  app.use("/api/claims", claimRoutes);
  app.use("/api/otc", otcRoutes);
  app.use("/api/conditions", conditionActionsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
