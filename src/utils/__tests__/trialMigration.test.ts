import { describe, it, expect, vi, beforeEach } from "vitest";
import { trialMigration } from "../trialMigration.js";
import { createManagementClient } from "../createManagementClient.js";
import { migrateConfig } from "../migrateConfig.js";
import { loadModels } from "../loadModels.js";

// Mock dependencies
vi.mock("../createManagementClient.js");
vi.mock("../migrateConfig.js");
vi.mock("../loadModels.js");
vi.mock("timers/promises", () => ({
  setTimeout: vi.fn(),
}));

// Mock console methods to avoid cluttering test output
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

describe("trialMigration", () => {
  const mockClient = {
    environment: {
      create: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
    contentType: {
      getMany: vi.fn(),
    },
  } as any;

  const mockOptions = {
    options: {
      accessToken: "test-token",
      spaceId: "test-space",
      environmentId: "test-environment",
    },
    modelsPath: "/test/models",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createManagementClient as any).mockReturnValue(mockClient);
    (migrateConfig as any).mockResolvedValue({});

    // Mock loadModels to return test data
    (loadModels as any).mockResolvedValue({
      models: [
        { sys: { id: "model1" }, name: "Model 1" },
        { sys: { id: "model2" }, name: "Model 2" },
      ],
      locales: [{ code: "en-US" }],
      fileInfo: [
        { file: "model1.ts", path: "/test/models/model1.ts" },
        { file: "model2.ts", path: "/test/models/model2.ts" },
      ],
      count: 2,
    });
  });

  it("should successfully create trial environment and run migration", async () => {
    // Mock environment creation and readiness
    mockClient.environment.create.mockResolvedValue({
      sys: { id: "test-trial-env" },
    });

    mockClient.environment.get.mockResolvedValue({
      sys: { status: { sys: { id: "ready" } } },
    });

    // Mock content types after migration
    mockClient.contentType.getMany.mockResolvedValue({
      items: [
        { sys: { id: "model1" }, name: "Model 1" },
        { sys: { id: "model2" }, name: "Model 2" },
      ],
    });

    const result = await trialMigration(mockOptions);

    // Verify loadModels was called with correct options
    expect(loadModels).toHaveBeenCalledWith({ modelsPath: "/test/models" });

    // Verify migrateConfig was called with the loaded models
    expect(migrateConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        models: [
          { sys: { id: "model1" }, name: "Model 1" },
          { sys: { id: "model2" }, name: "Model 2" },
        ],
        locales: [{ code: "en-US" }],
      }),
    );

    // Verify environment creation was called correctly
    expect(mockClient.environment.create).toHaveBeenCalledWith(
      { spaceId: "test-space" },
      expect.objectContaining({
        name: expect.stringMatching(/^trial-\d+$/),
      }),
    );

    expect(result).toContain("Migration completed successfully");
    expect(result).toContain("Local Models: 2 files processed");
  });

  it("should handle environment creation failure", async () => {
    mockClient.environment.create.mockRejectedValue(
      new Error("Environment creation failed"),
    );

    await expect(trialMigration(mockOptions)).rejects.toThrow(
      "Trial migration failed: Failed to create trial environment: Environment creation failed",
    );
  });

  it("should wait for environment to be ready", async () => {
    mockClient.environment.create.mockResolvedValue({
      sys: { id: "test-trial-env" },
    });

    // First call returns not ready, second call returns ready
    mockClient.environment.get
      .mockResolvedValueOnce({
        sys: { status: { sys: { id: "processing" } } },
      })
      .mockResolvedValueOnce({
        sys: { status: { sys: { id: "ready" } } },
      });

    mockClient.contentType.getMany.mockResolvedValue({ items: [] });

    const result = await trialMigration(mockOptions);

    expect(mockClient.environment.get).toHaveBeenCalledTimes(2);
    expect(result).toContain("Migration completed successfully");
  });

  it("should timeout if environment doesn't become ready", async () => {
    mockClient.environment.create.mockResolvedValue({
      sys: { id: "test-trial-env" },
    });

    mockClient.environment.get.mockResolvedValue({
      sys: { status: { sys: { id: "processing" } } },
    });

    await expect(trialMigration(mockOptions)).rejects.toThrow(
      "Environment did not become ready within timeout period",
    );
  }, 70000); // 70 second timeout for this test

  it("should handle migration errors and attempt cleanup", async () => {
    mockClient.environment.create.mockResolvedValue({
      sys: { id: "test-trial-env" },
    });

    mockClient.environment.get.mockResolvedValue({
      sys: { status: { sys: { id: "ready" } } },
    });

    mockClient.environment.delete.mockResolvedValue({});

    // Mock migration failure
    (migrateConfig as any).mockRejectedValue(new Error("Migration failed"));

    await expect(trialMigration(mockOptions)).rejects.toThrow(
      "Trial migration failed: Migration failed",
    );

    // Verify cleanup was attempted
    expect(mockClient.environment.delete).toHaveBeenCalledWith({
      environmentId: expect.stringContaining("test-trial-env"),
    });
  });

  it("should handle missing local models gracefully", async () => {
    mockClient.environment.create.mockResolvedValue({
      sys: { id: "test-trial-env" },
    });

    mockClient.environment.get.mockResolvedValue({
      sys: { status: { sys: { id: "ready" } } },
    });

    mockClient.contentType.getMany.mockResolvedValue({
      items: [],
    });

    // Mock empty models for this test
    (loadModels as any).mockResolvedValue({
      models: [],
      locales: [],
      fileInfo: [],
      count: 0,
    });

    const result = await trialMigration(mockOptions);

    expect(result).toContain("Local Models: 0 files processed");
    expect(result).toContain("Migration completed successfully");
  });

  it("should handle verification errors and include them in report", async () => {
    mockClient.environment.create.mockResolvedValue({
      sys: { id: "test-trial-env" },
    });

    mockClient.environment.get.mockResolvedValue({
      sys: { status: { sys: { id: "ready" } } },
    });

    // Mock contentType.getMany to fail during verification
    mockClient.contentType.getMany.mockRejectedValue(
      new Error("API rate limit exceeded"),
    );

    mockClient.environment.delete.mockResolvedValue({});

    const result = await trialMigration(mockOptions);

    expect(result).toContain("Errors: 1");
    expect(result).toContain("API rate limit exceeded");
    expect(result).toContain("❌ Errors Encountered:");
    expect(result).toContain("Fix the errors above");
  });

  it("should handle cleanup failure gracefully", async () => {
    mockClient.environment.create.mockResolvedValue({
      sys: { id: "test-trial-env" },
    });

    mockClient.environment.get.mockResolvedValue({
      sys: { status: { sys: { id: "ready" } } },
    });

    mockClient.contentType.getMany.mockResolvedValue({
      items: [{ sys: { id: "model1" }, name: "Model 1" }],
    });

    // Mock cleanup failure
    mockClient.environment.delete.mockRejectedValue(
      new Error("Cleanup failed"),
    );

    const result = await trialMigration(mockOptions);

    expect(result).toContain("Migration completed successfully");
    expect(result).toContain("Content Types Created: 1");
  });
});
