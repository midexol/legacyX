import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),

  // How often the background sweep runs (matching pending->matched and
  // matched->settled transitions, plus the simulated price tick).
  MATCHING_INTERVAL_SECONDS: z.coerce.number().int().positive().default(5),
  // How long a pending order waits before it "finds a buyer", and how long a
  // matched order waits before it "settles on-chain". Kept short by default
  // so a demo doesn't have to sit and wait.
  OTC_MATCH_DELAY_MS: z.coerce.number().int().nonnegative().default(20_000),
  OTC_SETTLE_DELAY_MS: z.coerce.number().int().nonnegative().default(20_000),

  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration. Check .env against .env.example.");
}

export const env = parsed.data;
