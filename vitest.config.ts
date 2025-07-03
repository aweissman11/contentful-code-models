import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/utils/**/*.ts"],
      exclude: [
        "src/utils/**/*.test.ts",
        "src/utils/**/*.spec.ts",
        "src/utils/__tests__/**",
        "node_modules/**",
        "dist/**",
        "coverage/**",
      ],
      thresholds: {
        lines: 85,
        functions: 95,
        branches: 85,
        statements: 85,
      },
      // Only show coverage for the utils directory
      reportOnFailure: true,
      all: true,
    },
  },
});
