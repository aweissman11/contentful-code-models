import { describe, it, expect, vi, beforeEach } from "vitest";
import { migrateConfig } from "../migrateConfig";
import { createManagementClient } from "../createManagementClient";
import { handleLocales } from "../migrateFunctions/migrateLocales";
import { migrateModels } from "../migrateFunctions/migrateModels";
import { loadModels } from "../loadModels";
import { ContentModel } from "../../types";

// Mock dependencies
vi.mock("../createManagementClient");
vi.mock("../migrateFunctions/migrateLocales");
vi.mock("../migrateFunctions/migrateModels");
vi.mock("../loadModels");

describe("migrateConfig (orchestration)", () => {
  const mockClient = { test: "mockClient" };
  const mockOptions = {
    accessToken: "test-token",
    spaceId: "test-space",
    environmentId: "test-env",
  };

  const mockModels: ContentModel[] = [
    {
      sys: { id: "testModel" },
      name: "Test Model",
      description: "A test model",
      displayField: "title",
      fields: [
        {
          id: "title",
          name: "Title",
          type: "Symbol",
          required: true,
          localized: false,
        },
      ],
    },
  ];

  const mockLocales = [
    {
      code: "en-US",
      name: "English (US)",
      contentDeliveryApi: true,
      contentManagementApi: true,
      optional: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (createManagementClient as any).mockReturnValue(mockClient);
    (handleLocales as any).mockResolvedValue(undefined);
    (migrateModels as any).mockResolvedValue(undefined);
    (loadModels as any).mockResolvedValue({
      models: mockModels,
      locales: mockLocales,
      count: mockModels.length,
    });
  });

  it("should create management client with provided options", async () => {
    await migrateConfig({ options: mockOptions, models: mockModels });

    expect(createManagementClient).toHaveBeenCalledWith(mockOptions);
  });

  it("should call handleLocales with client, options, and locales", async () => {
    await migrateConfig({
      options: mockOptions,
      models: mockModels,
      locales: mockLocales,
    });

    expect(handleLocales).toHaveBeenCalledWith({
      client: mockClient,
      options: mockOptions,
      locales: mockLocales,
    });
  });

  it("should call migrateModels with client, options, and models", async () => {
    await migrateConfig({
      options: mockOptions,
      models: mockModels,
      locales: mockLocales,
    });

    expect(migrateModels).toHaveBeenCalledWith({
      client: mockClient,
      options: mockOptions,
      models: mockModels,
    });
  });

  it("should pass undefined locales when not provided", async () => {
    await migrateConfig({ options: mockOptions, models: mockModels });

    expect(handleLocales).toHaveBeenCalledWith({
      client: mockClient,
      options: mockOptions,
      locales: undefined,
    });
  });

  it("should pass undefined models when modelsPath loads no models", async () => {
    // Mock loadModels to return no models
    (loadModels as any).mockResolvedValueOnce({
      models: undefined,
      locales: mockLocales,
      count: 0,
    });

    await migrateConfig({ options: mockOptions, modelsPath: "./empty/models" });

    expect(migrateModels).toHaveBeenCalledWith({
      client: mockClient,
      options: mockOptions,
      models: undefined,
    });
  });

  it("should return the created client", async () => {
    const result = await migrateConfig({
      options: mockOptions,
      models: mockModels,
    });

    expect(result).toBe(mockClient);
  });

  it("should call functions in correct order", async () => {
    const callOrder: string[] = [];

    (createManagementClient as any).mockImplementation(() => {
      callOrder.push("createManagementClient");
      return mockClient;
    });

    (handleLocales as any).mockImplementation(() => {
      callOrder.push("handleLocales");
      return Promise.resolve();
    });

    (migrateModels as any).mockImplementation(() => {
      callOrder.push("migrateModels");
      return Promise.resolve();
    });

    await migrateConfig({
      options: mockOptions,
      models: mockModels,
      locales: mockLocales,
    });

    expect(callOrder).toEqual([
      "createManagementClient",
      "handleLocales",
      "migrateModels",
    ]);
  });

  it("should propagate errors from handleLocales", async () => {
    const localeError = new Error("Locale migration failed");
    (handleLocales as any).mockRejectedValue(localeError);

    await expect(
      migrateConfig({
        options: mockOptions,
        models: mockModels,
        locales: mockLocales,
      }),
    ).rejects.toThrow("Locale migration failed");

    // Should not call migrateModels if handleLocales fails
    expect(migrateModels).not.toHaveBeenCalled();
  });

  it("should propagate errors from migrateModels", async () => {
    const modelError = new Error("Model migration failed");
    (migrateModels as any).mockRejectedValue(modelError);

    await expect(
      migrateConfig({
        options: mockOptions,
        models: mockModels,
      }),
    ).rejects.toThrow("Model migration failed");

    // Should have called handleLocales first
    expect(handleLocales).toHaveBeenCalled();
  });

  it("should propagate errors from createManagementClient", async () => {
    const clientError = new Error("Failed to create client");
    (createManagementClient as any).mockImplementation(() => {
      throw clientError;
    });

    await expect(
      migrateConfig({ options: mockOptions, models: mockModels }),
    ).rejects.toThrow("Failed to create client");

    // Should not call other functions if client creation fails
    expect(handleLocales).not.toHaveBeenCalled();
    expect(migrateModels).not.toHaveBeenCalled();
  });

  it("should handle empty options gracefully", async () => {
    const emptyOptions = {
      accessToken: "",
      spaceId: "",
      environmentId: "",
    };

    await migrateConfig({ options: emptyOptions, models: mockModels });

    expect(createManagementClient).toHaveBeenCalledWith(emptyOptions);
    expect(handleLocales).toHaveBeenCalledWith({
      client: mockClient,
      options: emptyOptions,
      locales: undefined,
    });
    expect(migrateModels).toHaveBeenCalledWith({
      client: mockClient,
      options: emptyOptions,
      models: mockModels,
    });
  });

  it("should load models from modelsPath and call functions with loaded models", async () => {
    await migrateConfig({
      options: mockOptions,
      modelsPath: "./src/models",
    });

    expect(loadModels).toHaveBeenCalledWith({ modelsPath: "./src/models" });
    expect(createManagementClient).toHaveBeenCalledWith(mockOptions);
    expect(handleLocales).toHaveBeenCalledWith({
      client: mockClient,
      options: mockOptions,
      locales: mockLocales,
    });
    expect(migrateModels).toHaveBeenCalledWith({
      client: mockClient,
      options: mockOptions,
      models: mockModels,
    });
  });

  it("should prefer modelsPath over provided models when both are present", async () => {
    const customModels = [
      {
        sys: { id: "customModel" },
        name: "Custom Model",
        description: "A custom model",
        displayField: "name",
        fields: [
          {
            id: "name",
            name: "Name",
            type: "Symbol",
            required: true,
            localized: false,
          },
        ],
      },
    ];

    // Use type assertion to test runtime behavior when both are provided
    await migrateConfig({
      options: mockOptions,
      models: customModels,
      modelsPath: "./src/models", // This should take precedence
    } as any);

    // loadModels should be called when modelsPath is provided (takes precedence)
    expect(loadModels).toHaveBeenCalledWith({ modelsPath: "./src/models" });
    expect(migrateModels).toHaveBeenCalledWith({
      client: mockClient,
      options: mockOptions,
      models: mockModels, // These come from loadModels mock, not customModels
    });
  });

  it("should throw error when neither models nor modelsPath is provided", async () => {
    await expect(
      migrateConfig({ options: mockOptions } as any),
    ).rejects.toThrow("Either 'modelsPath' or 'models' must be provided");
  });
});
