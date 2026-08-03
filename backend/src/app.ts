import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import healthRoutes from "./routes/health.routes";
import ordersRoutes from "./routes/orders.routes";
import statsRoutes from "./routes/stats.routes";
import settlementsRoutes from "./routes/settlements.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_ORIGIN }));
  app.use(express.json());
  app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== "test" }));

  app.use("/health", healthRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/settlements", settlementsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
