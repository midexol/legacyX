import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const backendRoot = path.join(__dirname, "..");
const dbPath = path.join(backendRoot, "test.db");

export default function setup() {
  for (const file of [dbPath, `${dbPath}-journal`]) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  execSync("npx prisma migrate deploy", {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
    stdio: "inherit",
  });
}

export function teardown() {
  for (const file of [dbPath, `${dbPath}-journal`]) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}
