import { describe, it, expect } from "vitest";
import * as utilsIndex from "../index";
import { syncToLocal } from "../syncToLocal";
import { migrateConfig } from "../migrateConfig";

describe("Utils Index", () => {
  it("should export syncToLocal function", () => {
    expect(utilsIndex.syncToLocal).toBe(syncToLocal);
    expect(typeof utilsIndex.syncToLocal).toBe("function");
  });

  it("should export migrateConfig function", () => {
    expect(utilsIndex.migrateConfig).toBe(migrateConfig);
    expect(typeof utilsIndex.migrateConfig).toBe("function");
  });

  it("should export all expected functions and types", () => {
    expect(utilsIndex).toHaveProperty("syncToLocal");
    expect(utilsIndex).toHaveProperty("migrateConfig");

    // Verify the functions are actually functions
    expect(typeof utilsIndex.syncToLocal).toBe("function");
    expect(typeof utilsIndex.migrateConfig).toBe("function");
  });

  it("should have the correct number of exports", () => {
    const exports = Object.keys(utilsIndex);
    expect(exports).toHaveLength(2);
    expect(exports).toContain("syncToLocal");
    expect(exports).toContain("migrateConfig");
  });
});
