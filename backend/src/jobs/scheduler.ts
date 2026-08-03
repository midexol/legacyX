import cron, { type ScheduledTask } from "node-cron";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { runMatchingSweep } from "../services/matching.service";
import { tickPrice } from "../services/stats.service";

let tasks: ScheduledTask[] = [];

// Simulated OTC matching engine + market price ticker described in the
// contract ("matching logic isn't specified — that's your system's job").
// Both are idempotent sweeps over persisted state, safe to run on an
// interval.
export function startScheduler() {
  const expr = `*/${env.MATCHING_INTERVAL_SECONDS} * * * * *`;

  const task = cron.schedule(expr, async () => {
    try {
      await runMatchingSweep();
      await tickPrice();
    } catch (err) {
      logger.error({ err }, "Background sweep failed");
    }
  });

  tasks = [task];
  logger.info({ expr }, "OTC matching + price-tick scheduler started");
}

export function stopScheduler() {
  tasks.forEach((task) => task.stop());
  tasks = [];
}
