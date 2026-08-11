import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_API_KEY: z.string().min(1),
  VERIFICATION_INTERVAL_SECONDS: z.coerce.number().int().positive().default(30),
  MATCHING_INTERVAL_SECONDS: z.coerce.number().int().positive().default(15),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),

  // Chain integration (contracts/ — LegacyVault). Optional: vaults without a
  // linked contractAddress keep using the pure off-chain simulation in
  // mockChain.ts. OPERATOR_PRIVATE_KEY signs only the actions the contract
  // itself allows a third party to submit (sweeping an elapsed inactivity
  // window, relaying a beneficiary's/approver's own signature, and — for
  // TRUSTED_VERIFIER_PRIVATE_KEY — attesting a manually-verified condition);
  // it is never used for owner-only actions like deposit/withdraw/claim.
  // JSON object mapping chainId -> RPC URL, e.g. {"114": "https://coston2-api.flare.network/ext/C/rpc"}
  RPC_URL_BY_CHAIN_ID: z.string().optional(),
  OPERATOR_PRIVATE_KEY: z.string().optional(),
  TRUSTED_VERIFIER_PRIVATE_KEY: z.string().optional(),

  // Public Marketplace (frontend/API_CONTRACT.md) matching simulation —
  // simulated delay before a pending order "finds a buyer", and before a
  // matched order "settles on-chain". Lower these for faster demos. Separate
  // from MATCHING_INTERVAL_SECONDS above, which is the sweep's cadence and
  // is shared with the older /api/otc engine.
  MARKETPLACE_MATCH_DELAY_MS: z.coerce.number().int().nonnegative().default(20_000),
  MARKETPLACE_SETTLE_DELAY_MS: z.coerce.number().int().nonnegative().default(20_000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration. Check .env against .env.example.");
}

export const env = parsed.data;
