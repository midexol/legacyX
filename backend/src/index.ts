import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./db/prisma";
import { logger } from "./utils/logger";
import { startScheduler, stopScheduler } from "./jobs/scheduler";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`LegacyX backend listening on port ${env.PORT} (${env.NODE_ENV})`);
  startScheduler();
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  stopScheduler();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
