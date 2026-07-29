import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    globalSetup: ["./tests/globalSetup.ts"],
    setupFiles: ["./tests/setup.ts"],
    // Every test file shares one sqlite file (see tests/setup.ts) — keep
    // execution sequential so files don't race on writes to it.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
