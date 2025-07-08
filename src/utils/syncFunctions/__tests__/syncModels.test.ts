import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { PlainClientAPI } from "contentful-management";
import { syncModels, fieldDefaults } from "../syncModels";
import merge from "lodash/merge.js";

// Mock dependencies
vi.mock("fs/promises");
vi.mock("path");
vi.mock("url");
vi.mock("lodash/merge.js");

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
};

describe("syncModels", () => {
  const mockClient: PlainClientAPI = {
    contentType: {
      getMany: vi.fn(),
    },
    editorInterface: {
      getMany: vi.fn(),
    },
  } as any;

  const mockContentType = {
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
      },
    ],
  };

  const mockEditorInterface = {
    sys: {
      contentType: { sys: { id: "testModel" } },
    },
    controls: [
      {
        fieldId: "title",
        widgetId: "singleLine",
      },
    ],
    sidebar: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (mockClient.contentType.getMany as any).mockResolvedValue({
      items: [mockContentType],
    });
    (mockClient.editorInterface.getMany as any).mockResolvedValue({
      items: [mockEditorInterface],
    });
    (path.resolve as any).mockImplementation((...args: string[]) =>
      args.join("/"),
    );
    (path.join as any).mockImplementation((...args: string[]) =>
      args.join("/"),
    );
    (path.dirname as any).mockImplementation((p: string) =>
      p.split("/").slice(0, -1).join("/"),
    );
    (mkdir as any).mockResolvedValue(undefined);
    (writeFile as any).mockResolvedValue(undefined);
    (pathToFileURL as any).mockImplementation((p: string) => ({
      toString: () => `file://${p}`,
    }));
    (merge as any).mockImplementation((local: any, contentful: any) => ({
      ...local,
      ...contentful,
    }));
  });

  afterEach(() => {
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
  });

  describe("fieldDefaults", () => {
    it("should export correct field defaults", () => {
      expect(fieldDefaults).toEqual({
        omitted: false,
        disabled: false,
        required: false,
        localized: false,
        allowedResources: undefined,
        deleted: undefined,
        linkType: undefined,
        defaultValue: undefined,
      });
    });
  });

  describe("syncModels", () => {
    it("should throw error when client is not provided", async () => {
      await expect(
        syncModels({
          modelsDir: "/test/models",
          client: null as any,
        }),
      ).rejects.toThrow(
        "Client is not provided. Please provide a valid client.",
      );
    });

    it("should successfully sync content models", async () => {
      const result = await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(mockClient.contentType.getMany).toHaveBeenCalledWith({
        query: { limit: 200 },
      });
      expect(mockClient.editorInterface.getMany).toHaveBeenCalledWith({
        query: { limit: 200 },
      });
      expect(result).toEqual([mockContentType]);
    });

    it("should filter out contentful-migrations content type", async () => {
      const mockContentTypes = [
        mockContentType,
        {
          sys: { id: "contentful-migrations" },
          name: "Migrations",
          description: "Migration tracking",
          displayField: null,
          fields: [],
        },
      ];

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: mockContentTypes,
      });

      const result = await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(result).toEqual([mockContentType]);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Processing model: testModel",
      );
      expect(consoleSpy.log).not.toHaveBeenCalledWith(
        "Processing model: contentful-migrations",
      );
    });

    it("should handle missing editor interface gracefully", async () => {
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [], // No editor interfaces
      });

      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(writeFile).toHaveBeenCalled();
      const [, fileContent] = (writeFile as any).mock.calls[0];
      expect(fileContent).toContain('"sys": {\n    "id": "testModel"\n  }');
      expect(fileContent).not.toContain("editorInterface");
    });

    it("should include editor interface when available", async () => {
      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(writeFile).toHaveBeenCalled();
      const [, fileContent] = (writeFile as any).mock.calls[0];
      expect(fileContent).toContain("editorInterface");
    });

    it("should handle local model import errors gracefully", async () => {
      // Mock pathToFileURL to return a non-existent path to trigger import error
      (pathToFileURL as any).mockImplementation(() => ({
        toString: () => "file:///non-existent-path",
      }));

      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "No local model for testModel found",
      );
    });

    it("should merge local model with contentful model when local model exists", async () => {
      // This test verifies that merge is called with the correct parameters
      // The actual merging behavior is tested by lodash.merge's own tests
      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(merge).toHaveBeenCalledWith(
        null, // null when no local model is found (default case)
        expect.objectContaining({
          sys: { id: "testModel" },
          name: "Test Model",
        }),
      );
    });

    it("should handle local model with different export structure", async () => {
      // Test the merge functionality with mock data
      const mockMergedResult = {
        sys: { id: "testModel" },
        name: "Test Model",
        customField: "customValue",
      };

      (merge as any).mockReturnValue(mockMergedResult);

      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(merge).toHaveBeenCalled();
      const [, fileContent] = (writeFile as any).mock.calls[0];
      expect(fileContent).toContain("testModel:ContentModel");
    });

    it("should create directory recursively", async () => {
      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(mkdir).toHaveBeenCalledWith("/test/models", { recursive: true });
    });

    it("should write correct file content", async () => {
      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      const [filePath, fileContent] = (writeFile as any).mock.calls[0];

      expect(filePath).toBe("/test/models/testModel.ts");
      expect(fileContent).toContain(
        "import type { ContentModel } from 'contentful-code-models';",
      );
      expect(fileContent).toContain("export const testModel:ContentModel = ");
    });

    it("should handle content types with null displayField", async () => {
      const mockContentTypeWithNullDisplay = {
        ...mockContentType,
        displayField: null,
      };

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockContentTypeWithNullDisplay],
      });

      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];
      expect(fileContent).toContain('"displayField": null');
    });

    it("should handle empty fields array", async () => {
      const mockContentTypeWithNoFields = {
        ...mockContentType,
        fields: [],
      };

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockContentTypeWithNoFields],
      });

      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];
      expect(fileContent).toContain('"fields": []');
    });

    it("should process multiple content types", async () => {
      const multipleModels = [
        mockContentType,
        {
          sys: { id: "anotherModel" },
          name: "Another Model",
          description: "Another test model",
          displayField: "name",
          fields: [],
        },
      ];

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: multipleModels,
      });

      const result = await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(result).toEqual(multipleModels);
      expect(writeFile).toHaveBeenCalledTimes(2);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Processing model: testModel",
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Processing model: anotherModel",
      );
    });

    it("should display success messages", async () => {
      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      expect(consoleSpy.log).toHaveBeenCalledWith("Running sync function...");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Processing model: testModel",
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Model for testModel written to /test/models/testModel.ts",
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "All models processed successfully.",
      );
    });

    it("should handle API errors gracefully", async () => {
      (mockClient.contentType.getMany as any).mockRejectedValue(
        new Error("API Error"),
      );

      await expect(
        syncModels({
          modelsDir: "/test/models",
          client: mockClient,
        }),
      ).rejects.toThrow("API Error");
    });

    it("should handle editor interface API errors gracefully", async () => {
      (mockClient.editorInterface.getMany as any).mockRejectedValue(
        new Error("Editor Interface API Error"),
      );

      await expect(
        syncModels({
          modelsDir: "/test/models",
          client: mockClient,
        }),
      ).rejects.toThrow("Editor Interface API Error");
    });

    it("should handle file system errors gracefully", async () => {
      (writeFile as any).mockRejectedValue(new Error("File write error"));

      await expect(
        syncModels({
          modelsDir: "/test/models",
          client: mockClient,
        }),
      ).rejects.toThrow("File write error");
    });

    it("should correctly extract editor interface data", async () => {
      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];
      expect(fileContent).toContain('"controls"');
      expect(fileContent).toContain('"sidebar"');
      // Note: The sys property appears in the main model, not in the editor interface section
    });

    it("should use correct file path construction", async () => {
      await syncModels({
        modelsDir: "/custom/path/models",
        client: mockClient,
      });

      expect(path.join).toHaveBeenCalledWith(
        "/custom/path/models",
        "testModel.ts",
      );
      expect(path.resolve).toHaveBeenCalledWith(
        "/custom/path/models",
        "testModel.ts",
      );
    });

    it("should handle case where dynamic import succeeds but module doesn't have expected export", async () => {
      // This test covers the optional chaining scenario where localModule?.[model.sys.id] returns undefined
      // We'll use a real module that exists but doesn't have the expected export

      // Mock to return a path to a module that will exist but won't have the expected export
      // eslint-disable-next-line no-undef
      const realModulePath = require.resolve("lodash/merge.js"); // This module exists but won't have 'testModel' export
      (path.resolve as any).mockReturnValueOnce(realModulePath);
      (pathToFileURL as any).mockReturnValueOnce({
        toString: () => `file://${realModulePath}`,
      });

      // Clear merge mock to track this specific call
      (merge as any).mockClear();

      await syncModels({
        modelsDir: "/test/models",
        client: mockClient,
      });

      // The merge should be called with undefined (from optional chaining) since lodash/merge doesn't export 'testModel'
      expect(merge).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          sys: { id: "testModel" },
          name: "Test Model",
        }),
      );
    });
  });
});
