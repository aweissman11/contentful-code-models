import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ContentTypeProps, LocaleProps } from "contentful-management";
import { createModelsIndexFile } from "../createModelsIndexFile";

// Mock dependencies
vi.mock("fs/promises");
vi.mock("path");

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
};

describe("createModelsIndexFile", () => {
  const mockContentModels: ContentTypeProps[] = [
    {
      sys: {
        id: "testModel",
        type: "ContentType",
        version: 1,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        space: { sys: { type: "Link", linkType: "Space", id: "space-id" } },
        environment: {
          sys: { type: "Link", linkType: "Environment", id: "env-id" },
        },
      },
      name: "Test Model",
      description: "A test model",
      displayField: "title",
      fields: [],
    } as unknown as ContentTypeProps,
    {
      sys: {
        id: "anotherModel",
        type: "ContentType",
        version: 1,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        space: { sys: { type: "Link", linkType: "Space", id: "space-id" } },
        environment: {
          sys: { type: "Link", linkType: "Environment", id: "env-id" },
        },
      },
      name: "Another Model",
      description: "Another test model",
      displayField: "name",
      fields: [],
    } as unknown as ContentTypeProps,
  ];

  const mockLocales: LocaleProps[] = [
    {
      sys: { id: "en-US" },
      name: "English (United States)",
      code: "en-US",
      default: true,
      fallbackCode: null,
    } as LocaleProps,
    {
      sys: { id: "es" },
      name: "Spanish",
      code: "es",
      default: false,
      fallbackCode: "en-US",
    } as LocaleProps,
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (path.join as any).mockImplementation((...args: string[]) =>
      args.join("/"),
    );
    (path.dirname as any).mockImplementation((p: string) =>
      p.split("/").slice(0, -1).join("/"),
    );
    (mkdir as any).mockResolvedValue(undefined);
    (writeFile as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
  });

  describe("createModelsIndexFile", () => {
    it("should create index file with correct imports and exports", async () => {
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: mockLocales,
      });

      const [filePath, fileContent] = (writeFile as any).mock.calls[0];

      expect(filePath).toBe("/test/models/index.ts");
      expect(fileContent).toContain(
        "import type { ContentModel } from 'contentful-code-models';",
      );
      expect(fileContent).toContain('import { testModel } from "./testModel";');
      expect(fileContent).toContain(
        'import { anotherModel } from "./anotherModel";',
      );
      expect(fileContent).toContain(
        "export const models: ContentModel[] = [testModel, anotherModel];",
      );
    });

    it("should include locales in the export", async () => {
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: mockLocales,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];

      expect(fileContent).toContain("export const locales = [");
      expect(fileContent).toContain('"name":"English (United States)"');
      expect(fileContent).toContain('"code":"en-US"');
      expect(fileContent).toContain('"default":true');
      expect(fileContent).toContain('"name":"Spanish"');
      expect(fileContent).toContain('"code":"es"');
      expect(fileContent).toContain('"default":false');
      expect(fileContent).toContain('"fallbackCode":"en-US"');
    });

    it("should exclude sys property from locales", async () => {
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: mockLocales,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];

      expect(fileContent).not.toContain('"sys"');
    });

    it("should handle empty content models array", async () => {
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: [],
        locales: mockLocales,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];

      expect(fileContent).toContain(
        "import type { ContentModel } from 'contentful-code-models';",
      );
      expect(fileContent).toContain(
        "export const models: ContentModel[] = [];",
      );
      expect(fileContent).not.toContain("import {");
    });

    it("should handle empty locales array", async () => {
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: [],
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];

      expect(fileContent).toContain("export const locales = [];");
    });

    it("should handle single content model", async () => {
      const singleModel = [mockContentModels[0]];

      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: singleModel,
        locales: mockLocales,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];

      expect(fileContent).toContain('import { testModel } from "./testModel";');
      expect(fileContent).toContain(
        "export const models: ContentModel[] = [testModel];",
      );
      expect(fileContent).not.toContain("anotherModel");
    });

    it("should handle single locale", async () => {
      const singleLocale = [mockLocales[0]];

      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: singleLocale,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];

      expect(fileContent).toContain('"name":"English (United States)"');
      expect(fileContent).not.toContain('"name":"Spanish"');
    });

    it("should create directory recursively", async () => {
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: mockLocales,
      });

      expect(mkdir).toHaveBeenCalledWith("/test/models", { recursive: true });
    });

    it("should log success message", async () => {
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: mockLocales,
      });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Successfully created /test/models/index.ts",
      );
    });

    it("should handle file creation errors gracefully", async () => {
      const error = new Error("File write error");
      (writeFile as any).mockRejectedValue(error);

      // Should not throw, but log the error
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: mockLocales,
      });

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Error creating models index file:",
        error,
      );
    });

    it("should handle directory creation errors gracefully", async () => {
      const error = new Error("Directory creation error");
      (mkdir as any).mockRejectedValue(error);

      // Should not throw, but log the error
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: mockLocales,
      });

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Error creating models index file:",
        error,
      );
    });

    it("should format file content correctly", async () => {
      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: mockLocales,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];

      // Check that the content is properly formatted (trimmed)
      expect(fileContent.startsWith("import type")).toBe(true);
      expect(fileContent.endsWith("];")).toBe(true);
      expect(fileContent).not.toMatch(/^\s+/); // No leading whitespace
    });

    it("should handle content models with special characters in IDs", async () => {
      const specialCharModels: ContentTypeProps[] = [
        {
          sys: {
            id: "model-with-dashes",
            type: "ContentType",
            version: 1,
            createdAt: "2023-01-01T00:00:00Z",
            updatedAt: "2023-01-01T00:00:00Z",
            space: { sys: { type: "Link", linkType: "Space", id: "space-id" } },
            environment: {
              sys: { type: "Link", linkType: "Environment", id: "env-id" },
            },
          },
          name: "Model With Dashes",
          description: "A model with dashes in ID",
          displayField: "title",
          fields: [],
        } as unknown as ContentTypeProps,
        {
          sys: {
            id: "modelWithCamelCase",
            type: "ContentType",
            version: 1,
            createdAt: "2023-01-01T00:00:00Z",
            updatedAt: "2023-01-01T00:00:00Z",
            space: { sys: { type: "Link", linkType: "Space", id: "space-id" } },
            environment: {
              sys: { type: "Link", linkType: "Environment", id: "env-id" },
            },
          },
          name: "Model With Camel Case",
          description: "A model with camelCase ID",
          displayField: "title",
          fields: [],
        } as unknown as ContentTypeProps,
      ];

      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: specialCharModels,
        locales: mockLocales,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];

      // The function currently uses model IDs directly, which may not be valid JavaScript identifiers
      expect(fileContent).toContain(
        'import { model-with-dashes } from "./model-with-dashes";',
      );
      expect(fileContent).toContain(
        'import { modelWithCamelCase } from "./modelWithCamelCase";',
      );
      expect(fileContent).toContain(
        "export const models: ContentModel[] = [model-with-dashes, modelWithCamelCase];",
      );
    });

    it("should handle locales with null fallbackCode", async () => {
      const localesWithNull: LocaleProps[] = [
        {
          sys: { id: "en-US" },
          name: "English (United States)",
          code: "en-US",
          default: true,
          fallbackCode: null,
        } as LocaleProps,
      ];

      await createModelsIndexFile({
        modelsDir: "/test/models",
        contentModels: mockContentModels,
        locales: localesWithNull,
      });

      const [, fileContent] = (writeFile as any).mock.calls[0];

      expect(fileContent).toContain('"fallbackCode":null');
    });

    it("should use correct file path construction", async () => {
      await createModelsIndexFile({
        modelsDir: "/custom/path/models",
        contentModels: mockContentModels,
        locales: mockLocales,
      });

      expect(path.join).toHaveBeenCalledWith("/custom/path/models", "index.ts");
      expect(path.dirname).toHaveBeenCalledWith("/custom/path/models/index.ts");
    });
  });
});
