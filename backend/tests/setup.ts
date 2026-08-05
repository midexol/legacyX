// Runs before each test file's own imports are evaluated, so config/env.ts
// (loaded transitively via ../src/app) picks up the test database instead
// of whatever DATABASE_URL is in .env.
//
// Tests need a real, reachable Postgres database dedicated to testing (see
// tests/globalSetup.ts, which resets it before the suite runs) — set
// TEST_DATABASE_URL before running `npm test`. Never point this at your dev
// or production database: globalSetup wipes everything in it.
if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URL is not set. Point it at a dedicated Postgres database " +
      "(never your dev/production one — the test suite resets it on every run). " +
      "See backend/README.md for setup instructions."
  );
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = "test";
process.env.JWT_SECRET ||= "test-only-not-a-real-secret";
process.env.ADMIN_API_KEY ||= "test-only-not-a-real-secret";
// Zero delay so tests can call runMarketplaceMatchingSweep() and see
// immediate pending -> matched -> settled transitions instead of waiting
// real time.
process.env.MARKETPLACE_MATCH_DELAY_MS = "0";
process.env.MARKETPLACE_SETTLE_DELAY_MS = "0";
