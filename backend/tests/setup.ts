import path from "node:path";

// Runs before each test file's own imports are evaluated, so config/env.ts
// (loaded transitively via ../src/app) picks up this DATABASE_URL instead
// of the one in .env — keeping tests off the dev database.
process.env.DATABASE_URL = `file:${path.join(__dirname, "..", "test.db")}`;
process.env.NODE_ENV = "test";
// Zero delay so tests can call runMatchingSweep() and see immediate
// pending -> matched -> settled transitions instead of waiting real time.
process.env.OTC_MATCH_DELAY_MS = "0";
process.env.OTC_SETTLE_DELAY_MS = "0";
