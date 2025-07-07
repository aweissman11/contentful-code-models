import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PlainClientAPI } from "contentful-management";
import { migrateConfig } from "../migrateConfig";
import { createManagementClient } from "../createManagementClient";
import { ContentModel } from "../../types";
import cloneDeep from "lodash/cloneDeep";

// Mock dependencies
vi.mock("../createManagementClient");
vi.mock("lodash/cloneDeep");

// Mock console methods to avoid cluttering test output
const consoleSpy = {
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
};

describe("migrateConfig", () => {
  const mockClient: PlainClientAPI = {
    contentType: {
      getMany: vi.fn(),
      createWithId: vi.fn(),
      update: vi.fn(),
      publish: vi.fn(),
      delete: vi.fn(),
    },
    editorInterface: {
      getMany: vi.fn(),
      update: vi.fn(),
    },
  } as any;

  const mockOptions = {
    accessToken: "test-token",
    spaceId: "test-space",
    environmentId: "test-env",
  };

  const mockContentModel: ContentModel = {
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
      {
        id: "content",
        name: "Content",
        type: "Text",
        required: false,
        localized: false,
      },
    ],
  };

  const mockExistingContentType = {
    sys: {
      id: "testModel",
      version: 1,
      publishedAt: "2023-01-01T00:00:00Z",
    },
    name: "Old Test Model",
    description: "Old description",
    displayField: "oldField",
    fields: [
      {
        id: "title",
        name: "Title",
        type: "Symbol",
        required: true,
      },
      {
        id: "oldField",
        name: "Old Field",
        type: "Symbol",
        required: false,
      },
    ],
  };

  const mockEditorInterface = {
    sys: {
      id: "editor-interface-id",
      contentType: { sys: { id: "testModel" } },
      version: 1,
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
    (createManagementClient as any).mockReturnValue(mockClient);
    (cloneDeep as any).mockImplementation((obj: any) =>
      JSON.parse(JSON.stringify(obj)),
    );

    // Default successful responses
    (mockClient.contentType.getMany as any).mockResolvedValue({
      items: [],
    });
    (mockClient.editorInterface.getMany as any).mockResolvedValue({
      items: [],
    });
    (mockClient.contentType.createWithId as any).mockResolvedValue({
      sys: { id: "testModel", version: 1 },
      name: "Test Model",
    });
    (mockClient.contentType.update as any).mockResolvedValue({
      sys: { id: "testModel", version: 2 },
      name: "Test Model",
    });
    (mockClient.contentType.publish as any).mockResolvedValue({
      sys: { id: "testModel", version: 3 },
      name: "Test Model",
    });
    (mockClient.editorInterface.update as any).mockResolvedValue({
      sys: { id: "editor-interface-id", version: 2 },
    });
  });

  afterEach(() => {
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
  });

  describe("migrateConfig", () => {
    it("should return client when no models provided", async () => {
      const result = await migrateConfig({
        options: mockOptions,
        models: [],
      });

      expect(createManagementClient).toHaveBeenCalledWith(mockOptions);
      expect(result).toBe(mockClient);
      expect(mockClient.contentType.getMany).not.toHaveBeenCalled();
    });

    it("should return client when models is undefined", async () => {
      const result = await migrateConfig({
        options: mockOptions,
        models: undefined,
      });

      expect(createManagementClient).toHaveBeenCalledWith(mockOptions);
      expect(result).toBe(mockClient);
      expect(mockClient.contentType.getMany).not.toHaveBeenCalled();
    });

    it("should create new content type when it doesn't exist", async () => {
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [],
      });

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(mockClient.contentType.createWithId).toHaveBeenCalledWith(
        { contentTypeId: "testModel" },
        {
          name: "Test Model",
          description: "A test model",
          displayField: "title",
          fields: mockContentModel.fields,
        },
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "created model",
        "testModel",
        "✅",
      );
    });

    it("should create content type with undefined displayField when not provided", async () => {
      const modelWithoutDisplayField = {
        ...mockContentModel,
        displayField: null,
      };

      await migrateConfig({
        options: mockOptions,
        models: [modelWithoutDisplayField],
      });

      expect(mockClient.contentType.createWithId).toHaveBeenCalledWith(
        { contentTypeId: "testModel" },
        {
          name: "Test Model",
          description: "A test model",
          displayField: undefined,
          fields: mockContentModel.fields,
        },
      );
    });

    it("should update existing content type", async () => {
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(mockClient.contentType.update).toHaveBeenCalledWith(
        {
          ...mockOptions,
          contentTypeId: "testModel",
        },
        {
          ...mockExistingContentType,
          name: "Test Model",
          description: "A test model",
          displayField: "title",
          fields: [
            ...mockContentModel.fields,
            {
              ...mockExistingContentType.fields[1], // oldField
              omitted: true,
            },
          ],
        },
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "updated model",
        "testModel",
        "version",
        2,
        "⬆️",
      );
    });

    it("should set displayField to first Symbol field when not provided in model", async () => {
      const modelWithoutDisplayField = {
        ...mockContentModel,
        displayField: null,
        fields: [
          {
            id: "number",
            name: "Number",
            type: "Number",
            required: false,
            localized: false,
          },
          {
            id: "title",
            name: "Title",
            type: "Symbol",
            required: true,
            localized: false,
          },
        ],
      };

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });

      await migrateConfig({
        options: mockOptions,
        models: [modelWithoutDisplayField],
      });

      expect(mockClient.contentType.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          displayField: "title", // First Symbol field
        }),
      );
    });

    it("should set displayField to empty string when no Symbol fields exist", async () => {
      const modelWithoutSymbolFields = {
        ...mockContentModel,
        displayField: null,
        fields: [
          {
            id: "number",
            name: "Number",
            type: "Number",
            required: false,
            localized: false,
          },
        ],
      };

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });

      await migrateConfig({
        options: mockOptions,
        models: [modelWithoutSymbolFields],
      });

      expect(mockClient.contentType.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          displayField: "",
        }),
      );
    });

    it("should update editor interface when model has editorInterface", async () => {
      const modelWithEditor = {
        ...mockContentModel,
        editorInterface: {
          controls: [
            {
              fieldId: "title",
              widgetId: "singleLine",
            },
          ],
          sidebar: [],
        },
      };

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [mockEditorInterface],
      });

      await migrateConfig({
        options: mockOptions,
        models: [modelWithEditor],
      });

      expect(mockClient.editorInterface.update).toHaveBeenCalledWith(
        {
          ...mockOptions,
          contentTypeId: "testModel",
        },
        {
          ...mockEditorInterface,
          ...modelWithEditor.editorInterface,
        },
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "updated editor interface for",
        "testModel",
        "📋",
      );
    });

    it("should log when no editor interface is found for content type", async () => {
      const modelWithoutEditor = mockContentModel;

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [mockEditorInterface],
      });

      await migrateConfig({
        options: mockOptions,
        models: [modelWithoutEditor],
      });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "no editor interface for",
        "testModel",
      );
    });

    it("should publish all content types", async () => {
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(mockClient.contentType.publish).toHaveBeenCalledWith(
        {
          ...mockOptions,
          contentTypeId: "testModel",
        },
        {
          ...mockExistingContentType,
          sys: {
            ...mockExistingContentType.sys,
            version: mockExistingContentType.sys.version + 1,
          },
        },
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "published model",
        "testModel",
        "version:",
        3,
        "📤",
      );
    });

    it("should display success message when all operations complete", async () => {
      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "\x1b[34m",
        "All models successfully migrated! 🎉",
      );
    });

    it("should handle API errors gracefully", async () => {
      // Test a simpler error scenario - API call failure
      const error = new Error("API Error");
      (mockClient.contentType.getMany as any).mockRejectedValue(error);

      await expect(
        migrateConfig({
          options: mockOptions,
          models: [mockContentModel],
        }),
      ).rejects.toThrow("API Error");
    });

    it("should handle content type creation errors", async () => {
      // Test creation error - the function should handle it internally and not throw
      const error = new Error("Creation failed");
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [], // No existing content types
      });
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [],
      });
      (mockClient.contentType.createWithId as any).mockRejectedValue(error);

      // The function should handle the error internally and still return the client
      const result = await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(result).toBe(mockClient);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "\n\n\n\x1b[31m",
        error,
        "\n\n\n",
      );
    });

    it("should handle content type update errors", async () => {
      // Test update error
      const error = new Error("Update failed");
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });
      (mockClient.contentType.update as any).mockRejectedValue(error);

      await expect(
        migrateConfig({
          options: mockOptions,
          models: [mockContentModel],
        }),
      ).rejects.toThrow("Update failed");
    });

    it("should handle multiple models with mixed create/update scenarios", async () => {
      const secondModel: ContentModel = {
        sys: { id: "secondModel" },
        name: "Second Model",
        description: "Second test model",
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
      };

      // Mock that both models need to be created (none exist)
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [], // No existing models
      });

      // Mock different return values for each createWithId call
      (mockClient.contentType.createWithId as any)
        .mockResolvedValueOnce({
          sys: { id: "testModel", version: 1 },
        })
        .mockResolvedValueOnce({
          sys: { id: "secondModel", version: 1 },
        });

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel, secondModel],
      });

      // Both models should be created
      expect(mockClient.contentType.createWithId).toHaveBeenCalledWith(
        { contentTypeId: "testModel" },
        expect.any(Object),
      );
      expect(mockClient.contentType.createWithId).toHaveBeenCalledWith(
        { contentTypeId: "secondModel" },
        expect.any(Object),
      );

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "created model",
        "testModel",
        "✅",
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "created model",
        "secondModel",
        "✅",
      );
    });

    it("should handle cloneDeep properly for data preservation", async () => {
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [mockEditorInterface],
      });

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(cloneDeep).toHaveBeenCalledWith(mockExistingContentType);
      expect(cloneDeep).toHaveBeenCalledWith(mockEditorInterface);
    });

    it("should call createManagementClient with correct options", async () => {
      const customOptions = {
        accessToken: "custom-token",
        spaceId: "custom-space",
        environmentId: "custom-env",
      };

      await migrateConfig({
        options: customOptions,
        models: [mockContentModel],
      });

      expect(createManagementClient).toHaveBeenCalledWith(customOptions);
    });

    it("should handle empty fields array in model", async () => {
      const modelWithNoFields = {
        ...mockContentModel,
        fields: [],
      };

      await migrateConfig({
        options: mockOptions,
        models: [modelWithNoFields],
      });

      expect(mockClient.contentType.createWithId).toHaveBeenCalledWith(
        { contentTypeId: "testModel" },
        expect.objectContaining({
          fields: [],
        }),
      );
    });

    it("should preserve existing fields that are not in the model as omitted", async () => {
      const existingContentTypeWithManyFields = {
        ...mockExistingContentType,
        fields: [
          {
            id: "title",
            name: "Title",
            type: "Symbol",
            required: true,
          },
          {
            id: "preserveMe",
            name: "Preserve Me",
            type: "Text",
            required: false,
          },
          {
            id: "meToo",
            name: "Me Too",
            type: "Number",
            required: false,
          },
        ],
      };

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [existingContentTypeWithManyFields],
      });

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel], // Only has title and content fields
      });

      expect(mockClient.contentType.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          fields: [
            ...mockContentModel.fields,
            {
              id: "preserveMe",
              name: "Preserve Me",
              type: "Text",
              required: false,
              omitted: true,
            },
            {
              id: "meToo",
              name: "Me Too",
              type: "Number",
              required: false,
              omitted: true,
            },
          ],
        }),
      );
    });
  });

  describe("Rollback functionality", () => {
    it("should handle errors during content creation and trigger rollback", async () => {
      // consoleSpy.log.mockRestore();
      // consoleSpy.error.mockRestore();

      // Setup a scenario where an error occurs during the update phase for an existing content type
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [mockEditorInterface],
      });

      // Make the update method fail to trigger the catch block
      (mockClient.contentType.update as any).mockRejectedValueOnce(
        new Error("Update failed"),
      );

      // However, we need to ensure that the rollback operations don't fail
      // Mock the rollback operations to succeed
      (mockClient.contentType.delete as any).mockResolvedValue({});
      (mockClient.contentType.update as any).mockResolvedValue(
        mockExistingContentType,
      );
      (mockClient.editorInterface.update as any).mockResolvedValue(
        mockEditorInterface,
      );

      const result = await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      // make sure client.contentType.publish was called with the original version
      expect(mockClient.contentType.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: "test-token",
          contentTypeId: "testModel",
          environmentId: "test-env",
          spaceId: "test-space",
        }),
        expect.objectContaining({
          sys: expect.objectContaining({
            id: "testModel",
            version: 1,
          }),
        }),
      );

      // The function should handle the error and still return the client
      expect(result).toBe(mockClient);
      // Since the function catches and handles the error internally, we should see error logs
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it("should update original editor interface sys after successful editor update", async () => {
      const modelWithEditor = {
        ...mockContentModel,
        editorInterface: {
          controls: [
            {
              fieldId: "title",
              widgetId: "multiLine",
            },
          ],
          sidebar: [],
        },
      };

      const originalEditorInterface = {
        ...mockEditorInterface,
      };

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [originalEditorInterface],
      });

      const updatedEditorInterface = {
        sys: { id: "editor-interface-id", version: 2 },
      };
      (mockClient.editorInterface.update as any).mockResolvedValue(
        updatedEditorInterface,
      );

      await migrateConfig({
        options: mockOptions,
        models: [modelWithEditor],
      });

      expect(mockClient.editorInterface.update).toHaveBeenCalledWith(
        {
          ...mockOptions,
          contentTypeId: "testModel",
        },
        {
          ...originalEditorInterface,
          ...modelWithEditor.editorInterface,
        },
      );
    });

    it("should update original content type sys after successful publish", async () => {
      const originalContentType = {
        ...mockExistingContentType,
        sys: { ...mockExistingContentType.sys, version: 1 },
      };

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [originalContentType],
      });
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [],
      });

      const publishedContentType = {
        sys: { id: "testModel", version: 3 },
      };
      (mockClient.contentType.publish as any).mockResolvedValue(
        publishedContentType,
      );

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(mockClient.contentType.publish).toHaveBeenCalledWith(
        {
          ...mockOptions,
          contentTypeId: "testModel",
        },
        {
          ...originalContentType,
          sys: {
            ...originalContentType.sys,
            version: originalContentType.sys.version + 1,
          },
        },
      );
    });

    it("should delete content type if it was created", async () => {
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [],
      });

      (mockClient.contentType.createWithId as any).mockRejectedValue(
        new Error("Creation failed"),
      );

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(mockClient.contentType.createWithId).toHaveBeenCalledWith(
        { contentTypeId: "testModel" },
        expect.any(Object),
      );

      // Now simulate a rollback scenario
      (mockClient.contentType.delete as any).mockResolvedValue({});

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(mockClient.contentType.delete).toHaveBeenCalledWith({
        contentTypeId: "testModel",
      });
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Deleted content type",
        "testModel",
        "🗑️",
      );
    });
  });

  describe("Error handling edge cases", () => {
    it("should handle errors and log them properly", async () => {
      // Set up a simple error scenario
      (mockClient.contentType.getMany as any).mockRejectedValue(
        new Error("API Error"),
      );

      // The function should re-throw API errors from getMany
      await expect(
        migrateConfig({
          options: mockOptions,
          models: [mockContentModel],
        }),
      ).rejects.toThrow("API Error");
    });

    it("should handle scenario where editor interface exists but model doesn't have one", async () => {
      const modelWithoutEditor = mockContentModel;

      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [mockExistingContentType],
      });
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [mockEditorInterface],
      });

      await migrateConfig({
        options: mockOptions,
        models: [modelWithoutEditor],
      });

      expect(mockClient.editorInterface.update).not.toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "no editor interface for",
        "testModel",
      );
    });
  });

  describe("Complex scenarios", () => {
    it("should handle scenario with no existing content types but existing editor interfaces", async () => {
      (mockClient.contentType.getMany as any).mockResolvedValue({
        items: [],
      });
      (mockClient.editorInterface.getMany as any).mockResolvedValue({
        items: [mockEditorInterface],
      });

      await migrateConfig({
        options: mockOptions,
        models: [mockContentModel],
      });

      expect(mockClient.contentType.createWithId).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "no editor interface for",
        "testModel",
      );
    });
  });
});
