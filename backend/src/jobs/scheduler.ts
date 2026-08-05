import cron, { type ScheduledTask } from "node-cron";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { runVerificationSweep } from "../services/verification.service";
import { runMatchingSweep } from "../services/matching.service";
import { runMarketplaceMatchingSweep } from "../services/marketplaceMatching.service";
import { tickMarketplacePrice } from "../services/marketplaceStats.service";

let tasks: ScheduledTask[] = [];

// Background "verification layer" + OTC matching engine described in the
// brief, plus the Public Marketplace's matching/settlement simulation and
// price tick (frontend/API_CONTRACT.md). All idempotent sweeps over
// already-persisted state, so running them on an interval (in addition to
// the on-demand endpoints, where applicable) is safe and just a matter of
// latency.
export function startScheduler() {
  const verificationExpr = `*/${env.VERIFICATION_INTERVAL_SECONDS} * * * * *`;
  const matchingExpr = `*/${env.MATCHING_INTERVAL_SECONDS} * * * * *`;

  const verificationTask = cron.schedule(verificationExpr, async () => {
    try {
      await runVerificationSweep();
    } catch (err) {
      logger.error({ err }, "Verification sweep failed");
    }
  });

  const matchingTask = cron.schedule(matchingExpr, async () => {
    try {
      await runMatchingSweep();
    } catch (err) {
      logger.error({ err }, "OTC matching sweep failed");
    }
  });

  const marketplaceTask = cron.schedule(matchingExpr, async () => {
    try {
      await runMarketplaceMatchingSweep();
      await tickMarketplacePrice();
    } catch (err) {
      logger.error({ err }, "Marketplace sweep failed");
    }
  });

  tasks = [verificationTask, matchingTask, marketplaceTask];
  logger.info(
    { verificationExpr, matchingExpr },
    "Background verification + OTC matching + marketplace scheduler started"
  );
}

export function stopScheduler() {
  tasks.forEach((task) => task.stop());
  tasks = [];
}
