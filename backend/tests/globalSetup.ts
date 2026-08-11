import { execSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";

const backendRoot = path.join(__dirname, "..");

// Convenience: load TEST_DATABASE_URL from backend/.env.test if present, so
// devs don't have to export it manually every time. CI can just set the env
// var directly and skip the file. Never falls back to .env / DATABASE_URL —
// that would risk resetting a real database (see the destructive step below).
dotenv.config({ path: path.join(backendRoot, ".env.test") });

export default function setup() {
  const testDbUrl = process.env.TEST_DATABASE_URL;
  if (!testDbUrl) {
    throw new Error(
      "TEST_DATABASE_URL is not set. Create backend/.env.test with a Postgres " +
        "URL for a database dedicated to testing (see backend/README.md) — " +
        "this suite resets it completely on every run."
    );
  }

  // Full reset (drop + reapply all migrations) so every test run starts from
  // a known-empty schema, regardless of what a previous run left behind.
  execSync("npx prisma migrate reset --force --skip-generate --skip-seed", {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "inherit",
  });
}
