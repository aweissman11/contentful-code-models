import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PlainClientAPI } from "contentful-management";
import { syncToLocal } from "../syncToLocal";
import { createManagementClient } from "../createManagementClient";
import { syncModels } from "../syncFunctions/syncModels";
import { createModelsIndexFile } from "../syncFunctions/createModelsIndexFile";
import path from "path";

// Mock dependencies
vi.mock("../createManagementClient");
vi.mock("../syncFunctions/syncModels");
vi.mock("../syncFunctions/createModelsIndexFile");
vi.mock("path");

// Mock console methods to avoid cluttering test output
const consoleSpy = {
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
};

describe("syncToLocal", () => {
  const mockClient: PlainClientAPI = {
    locale: {
      getMany: vi.fn(),
    },
  } as any;

  const mockOptions = {
    accessToken: "test-token",
    environmentId: "test-env",
    spaceId: "test-space",
  };

  const mockContentModels = [
    {
      sys: { id: "testModel" },
      name: "Test Model",
      description: "A test model",
      displayField: "title",
      fields: [],
    },
  ];

  const mockLocales = [
    {
      sys: { id: "en-US" },
      name: "English (United States)",
      code: "en-US",
      default: true,
      fallbackCode: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (createManagementClient as any).mockReturnValue(mockClient);
    (syncModels as any).mockResolvedValue(mockContentModels);
    (createModelsIndexFile as any).mockResolvedValue(undefined);
    (mockClient.locale.getMany as any).mockResolvedValue({
      items: mockLocales,
    });
    (path.resolve as any).mockImplementation((...args: string[]) =>
      args.join("/"),
    );
  });

  afterEach(() => {
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
  });

  it("should successfully orchestrate the sync process", async () => {
    const result = await syncToLocal({
      modelsBasePath: "/test/models",
      options: mockOptions,
    });

    expect(createManagementClient).toHaveBeenCalledWith(mockOptions);
    expect(syncModels).toHaveBeenCalledWith({
      modelsDir: "/test/models",
      client: mockClient,
    });
    expect(mockClient.locale.getMany).toHaveBeenCalledWith({});
    expect(createModelsIndexFile).toHaveBeenCalledWith({
      modelsDir: "/test/models",
      contentModels: mockContentModels,
      locales: mockLocales,
    });
    expect(result).toBe(mockClient);
  });

  it("should use process.cwd() when modelsBasePath is not provided", async () => {
    const mockCwd = "/default/path";
    vi.spyOn(process, "cwd").mockReturnValue(mockCwd);

    await syncToLocal({
      options: mockOptions,
    });

    expect(path.resolve).toHaveBeenCalledWith(mockCwd);
    expect(syncModels).toHaveBeenCalledWith({
      modelsDir: mockCwd,
      client: mockClient,
    });
  });

  it("should resolve the provided modelsBasePath", async () => {
    await syncToLocal({
      modelsBasePath: "/custom/models/path",
      options: mockOptions,
    });

    expect(path.resolve).toHaveBeenCalledWith("/custom/models/path");
    expect(syncModels).toHaveBeenCalledWith({
      modelsDir: "/custom/models/path",
      client: mockClient,
    });
  });

  it("should handle errors from syncModels", async () => {
    const error = new Error("Sync models error");
    (syncModels as any).mockRejectedValue(error);

    await expect(
      syncToLocal({
        modelsBasePath: "/test/models",
        options: mockOptions,
      }),
    ).rejects.toThrow("Sync models error");
  });

  it("should handle errors from locale fetching", async () => {
    const error = new Error("Locale fetch error");
    (mockClient.locale.getMany as any).mockRejectedValue(error);

    await expect(
      syncToLocal({
        modelsBasePath: "/test/models",
        options: mockOptions,
      }),
    ).rejects.toThrow("Locale fetch error");
  });

  it("should handle errors from createModelsIndexFile", async () => {
    const error = new Error("Index file creation error");
    (createModelsIndexFile as any).mockRejectedValue(error);

    await expect(
      syncToLocal({
        modelsBasePath: "/test/models",
        options: mockOptions,
      }),
    ).rejects.toThrow("Index file creation error");
  });

  it("should call createManagementClient with correct parameters", async () => {
    const customOptions = {
      accessToken: "custom-token",
      environmentId: "custom-env",
      spaceId: "custom-space",
    };

    await syncToLocal({
      modelsBasePath: "/test/models",
      options: customOptions,
    });

    expect(createManagementClient).toHaveBeenCalledWith(customOptions);
  });

  it("should display initial log message", async () => {
    await syncToLocal({
      modelsBasePath: "/test/models",
      options: mockOptions,
    });

    expect(consoleSpy.log).toHaveBeenCalledWith("Running sync function...");
  });

  it("should display success messages", async () => {
    await syncToLocal({
      modelsBasePath: "/test/models",
      options: mockOptions,
    });

    expect(consoleSpy.log).toHaveBeenCalledWith("Running sync function...");
    expect(consoleSpy.log).toHaveBeenCalledWith(
      "\x1b[35m",
      "=======================================",
    );
    expect(consoleSpy.log).toHaveBeenCalledWith(
      "\x1b[32m",
      "+++++++++++++++++++++++++++++++++++++++",
    );
    expect(consoleSpy.log).toHaveBeenCalledWith(
      "\x1b[34m",
      "Sync completed successfully!",
    );
    expect(consoleSpy.log).toHaveBeenCalledWith(
      "\x1b[34m",
      "**You should probably format and commit your code now.**",
    );
  });

  it("should pass through empty locales array", async () => {
    (mockClient.locale.getMany as any).mockResolvedValue({
      items: [],
    });

    await syncToLocal({
      modelsBasePath: "/test/models",
      options: mockOptions,
    });

    expect(createModelsIndexFile).toHaveBeenCalledWith({
      modelsDir: "/test/models",
      contentModels: mockContentModels,
      locales: [],
    });
  });

  it("should pass through empty content models array", async () => {
    (syncModels as any).mockResolvedValue([]);

    await syncToLocal({
      modelsBasePath: "/test/models",
      options: mockOptions,
    });

    expect(createModelsIndexFile).toHaveBeenCalledWith({
      modelsDir: "/test/models",
      contentModels: [],
      locales: mockLocales,
    });
  });

  it("should handle multiple locales correctly", async () => {
    const multipleLocales = [
      ...mockLocales,
      {
        sys: { id: "es" },
        name: "Spanish",
        code: "es",
        default: false,
        fallbackCode: "en-US",
      },
    ];

    (mockClient.locale.getMany as any).mockResolvedValue({
      items: multipleLocales,
    });

    await syncToLocal({
      modelsBasePath: "/test/models",
      options: mockOptions,
    });

    expect(createModelsIndexFile).toHaveBeenCalledWith({
      modelsDir: "/test/models",
      contentModels: mockContentModels,
      locales: multipleLocales,
    });
  });

  it("should handle multiple content models correctly", async () => {
    const multipleModels = [
      ...mockContentModels,
      {
        sys: { id: "anotherModel" },
        name: "Another Model",
        description: "Another test model",
        displayField: "name",
        fields: [],
      },
    ];

    (syncModels as any).mockResolvedValue(multipleModels);

    await syncToLocal({
      modelsBasePath: "/test/models",
      options: mockOptions,
    });

    expect(createModelsIndexFile).toHaveBeenCalledWith({
      modelsDir: "/test/models",
      contentModels: multipleModels,
      locales: mockLocales,
    });
  });

  it("should handle client creation errors", async () => {
    const error = new Error("Client creation error");
    (createManagementClient as any).mockImplementation(() => {
      throw error;
    });

    await expect(
      syncToLocal({
        modelsBasePath: "/test/models",
        options: mockOptions,
      }),
    ).rejects.toThrow("Client creation error");
  });
});
