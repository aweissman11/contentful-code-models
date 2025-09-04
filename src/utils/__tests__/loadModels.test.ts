import { describe, it, expect, vi } from "vitest";
import { loadModels } from "../loadModels.js";

// Mock console methods to avoid cluttering test output
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

describe("loadModels", () => {
  describe("basic functionality", () => {
    it("should be importable", () => {
      expect(loadModels).toBeDefined();
      expect(typeof loadModels).toBe("function");
    });
  });

  describe("integration tests", () => {
    it("should load models successfully with default path", async () => {
      const result = await loadModels({});

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      expect(result.models).toBeDefined();
      expect(Array.isArray(result.models)).toBe(true);
      expect(result.locales).toBeDefined();
      expect(Array.isArray(result.locales)).toBe(true);
    });

    it("should handle non-existent directory gracefully", async () => {
      await expect(
        loadModels({ modelsPath: "./totally-nonexistent-directory" }),
      ).rejects.toThrow();
    });

    it("should handle missing index file in existing directory", async () => {
      await expect(loadModels({ modelsPath: "./asdf" })).rejects.toThrow(
        "No index.js or index.ts found",
      );
    });

    it("should work with custom models path", async () => {
      const result = await loadModels({ modelsPath: "./src/models" });

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      expect(result.models).toBeDefined();
      expect(Array.isArray(result.models)).toBe(true);
    });

    it("should return proper model structure", async () => {
      const result = await loadModels({});

      // Verify each model has expected ContentModel structure
      result.models!.forEach((model) => {
        expect(model).toHaveProperty("sys");
        expect(model).toHaveProperty("fields");
        expect(model.sys).toHaveProperty("id");
        expect(typeof model.sys.id).toBe("string");
        expect(model.sys.id.length).toBeGreaterThan(0);
      });
    });

    it("should return proper locale structure", async () => {
      const result = await loadModels({});

      if (result.locales && result.locales.length > 0) {
        result.locales.forEach((locale) => {
          expect(locale).toHaveProperty("code");
          expect(locale).toHaveProperty("name");
          expect(typeof locale.code).toBe("string");
          expect(typeof locale.name).toBe("string");
        });

        // Should have at least one default locale
        const defaultLocales = result.locales.filter(
          (locale) => locale.default,
        );
        expect(defaultLocales.length).toBeGreaterThan(0);
      }
    });

    it("should return fileInfo with correct structure", async () => {
      const result = await loadModels({});

      expect(result.fileInfo).toBeDefined();
      expect(Array.isArray(result.fileInfo)).toBe(true);

      result.fileInfo.forEach((info) => {
        expect(info).toHaveProperty("file");
        expect(info).toHaveProperty("path");
        expect(typeof info.file).toBe("string");
        expect(typeof info.path).toBe("string");
        expect(info.file).toMatch(/\.ts$/);
        expect(info.path).toContain("models");
      });
    });

    it("should exclude test and definition files from fileInfo", async () => {
      const result = await loadModels({});

      result.fileInfo.forEach((info) => {
        expect(info.file).not.toMatch(/\.test\.ts$/);
        expect(info.file).not.toMatch(/\.d\.ts$/);
        expect(info.file).not.toMatch(/__tests__/);
        expect(info.file).not.toBe("index.ts");
      });
    });

    it("should have consistent count with models array length", async () => {
      const result = await loadModels({});

      expect(result.count).toBe(result.models!.length);
      expect(result.count).toBeGreaterThan(0);
    });

    it("should use default path when no options provided", async () => {
      const result = await loadModels({});

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
    });

    it("should handle relative paths correctly", async () => {
      const result = await loadModels({ modelsPath: "src/models" });

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
    });

    it("should handle absolute paths correctly", async () => {
      const absolutePath = `${process.cwd()}/src/models`;
      const result = await loadModels({ modelsPath: absolutePath });

      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
    });
  });

  describe("error scenarios", () => {
    it("should throw meaningful error for completely invalid path", async () => {
      await expect(
        loadModels({
          modelsPath: "/completely/invalid/path/that/does/not/exist",
        }),
      ).rejects.toThrow();
    });

    it("should throw meaningful error for empty string path", async () => {
      await expect(loadModels({ modelsPath: "" })).rejects.toThrow();
    });

    it("should throw meaningful error for directory without index file", async () => {
      await expect(loadModels({ modelsPath: "./src/types" })).rejects.toThrow(
        "No index.js or index.ts found",
      );
    });
  });

  describe("path resolution", () => {
    it("should resolve relative paths from current working directory", async () => {
      // This should work since src/models exists relative to project root
      const result = await loadModels({ modelsPath: "./src/models" });
      expect(result).toBeDefined();
    });

    it("should handle paths with extra slashes", async () => {
      const result = await loadModels({ modelsPath: "./src//models/" });
      expect(result).toBeDefined();
    });

    it("should handle paths with dot notation", async () => {
      const result = await loadModels({ modelsPath: "./src/./models" });
      expect(result).toBeDefined();
    });
  });

  describe("data validation", () => {
    it("should ensure all models have required sys properties", async () => {
      const result = await loadModels({});

      result.models!.forEach((model) => {
        expect(model.sys).toBeDefined();
        expect(model.sys.id).toBeDefined();
        expect(typeof model.sys.id).toBe("string");
        expect(model.sys.id.trim()).not.toBe("");
      });
    });

    it("should ensure all models have fields property", async () => {
      const result = await loadModels({});

      result.models!.forEach((model) => {
        expect(model.fields).toBeDefined();
        expect(typeof model.fields).toBe("object");
      });
    });

    it("should ensure locales have required properties when present", async () => {
      const result = await loadModels({});

      if (result.locales) {
        result.locales.forEach((locale) => {
          expect(locale.code).toBeDefined();
          expect(locale.name).toBeDefined();
          expect(typeof locale.code).toBe("string");
          expect(typeof locale.name).toBe("string");
          expect(locale.code.trim()).not.toBe("");
          expect(locale.name.trim()).not.toBe("");
        });
      }
    });

    it("should have at least one model loaded", async () => {
      const result = await loadModels({});

      expect(result.models).toBeDefined();
      expect(result.models!.length).toBeGreaterThan(0);
      expect(result.count).toBeGreaterThan(0);
    });

    it("should have fileInfo entries for TypeScript files", async () => {
      const result = await loadModels({});

      expect(result.fileInfo.length).toBeGreaterThan(0);

      // Should have some .ts files
      const tsFiles = result.fileInfo.filter((info) =>
        info.file.endsWith(".ts"),
      );
      expect(tsFiles.length).toBeGreaterThan(0);
    });
  });
});
