import { describe, it, expect, vi } from "vitest";

describe("CLI Tools", () => {
  it("should export CLI commands", async () => {
    // Import CLI modules to ensure they compile and export correctly
    const syncModule = await import("../../cli/sync.js");
    const migrateModule = await import("../../cli/migrate.js");
    const trialModule = await import("../../cli/trial.js");

    expect(syncModule.syncCommand).toBeDefined();
    expect(migrateModule.migrateCommand).toBeDefined();
    expect(trialModule.trialCommand).toBeDefined();

    // Check that commands have the expected structure
    expect(syncModule.syncCommand.name()).toBe("sync");
    expect(migrateModule.migrateCommand.name()).toBe("migrate");
    expect(trialModule.trialCommand.name()).toBe("trial");
  });

  it("should have correct command descriptions", async () => {
    const syncModule = await import("../../cli/sync.js");
    const migrateModule = await import("../../cli/migrate.js");
    const trialModule = await import("../../cli/trial.js");

    expect(syncModule.syncCommand.description()).toContain("FROM Contentful");
    expect(migrateModule.migrateCommand.description()).toContain(
      "TO Contentful",
    );
    expect(trialModule.trialCommand.description()).toContain(
      "Create a trial environment",
    );
  });
});
