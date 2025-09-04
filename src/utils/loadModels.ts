import { stat } from "fs/promises";
import path from "path";
import { glob } from "glob";
import { ContentModel } from "../types/index.js";
import { CreateLocaleProps } from "contentful-management/dist/typings/entities/locale.js";

export interface ModelFileInfo {
  file: string;
  path: string;
}

export interface LoadedModels {
  models?: ContentModel[];
  locales?: CreateLocaleProps[];
}

export interface LoadModelsResult extends LoadedModels {
  fileInfo: ModelFileInfo[];
  count: number;
}

export interface LoadModelsOptions {
  modelsPath?: string;
}

export async function loadModels({
  modelsPath = "src/models",
}: LoadModelsOptions): Promise<LoadModelsResult> {
  try {
    const resolvedPath = path.resolve(process.cwd(), modelsPath);
    console.log(`📂 Loading models from: ${resolvedPath}`);

    return await loadModelsFromIndex(resolvedPath);
  } catch (error) {
    console.error(`❌ Error loading models from ${modelsPath}:`, error);
    throw error;
  }
}

async function loadModelsFromIndex(
  resolvedPath: string,
): Promise<LoadModelsResult> {
  // Try to find index file (prefer .js, fallback to .ts)
  let indexPath: string;
  let isTypeScript = false;

  const indexJsPath = path.join(resolvedPath, "index.js");
  try {
    await stat(indexJsPath);
    indexPath = indexJsPath;
    console.log(`📄 Using index.js`);
  } catch {
    const indexTsPath = path.join(resolvedPath, "index.ts");
    try {
      await stat(indexTsPath);
      indexPath = indexTsPath;
      isTypeScript = true;
      console.log(`📄 Using index.ts`);
    } catch {
      throw new Error(
        `No index.js or index.ts found in ${resolvedPath}. Make sure your models directory has an index file that exports all models as an array.`,
      );
    }
  }

  let modelsModule;
  if (isTypeScript) {
    try {
      console.log("📝 Loading TypeScript file with tsx...");
      const { spawn } = await import("child_process");
      const { writeFile, unlink } = await import("fs/promises");
      const { tmpdir } = await import("os");

      const tempScriptPath = path.join(
        tmpdir(),
        `extract-models-${Date.now()}.js`,
      );
      const extractScript = `
        import { models, locales } from "${indexPath}";
        process.stdout.write(JSON.stringify({ models, locales }, null, 2));
      `;

      await writeFile(tempScriptPath, extractScript);

      const result = await new Promise<string>((resolve, reject) => {
        const child = spawn("npx", ["tsx", tempScriptPath], {
          stdio: ["pipe", "pipe", "pipe"],
          cwd: process.cwd(),
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        child.on("close", (code) => {
          if (code === 0) {
            resolve(stdout);
          } else {
            reject(
              new Error(
                `tsx execution failed with code ${code}. stderr: ${stderr}`,
              ),
            );
          }
        });

        child.on("error", reject);
      });

      await unlink(tempScriptPath).catch(() => {}); // Ignore cleanup errors

      try {
        modelsModule = JSON.parse(result.trim());
      } catch (parseError) {
        console.error(
          "❌ Error: Failed to parse models output from TypeScript file.",
        );
        console.error("Raw output:", result);
        throw parseError;
      }
    } catch {
      throw new Error(
        "Failed to load TypeScript file. Make sure tsx is available for loading .ts files. Either build your project first or ensure tsx is properly installed. Alternative: Convert your index.ts to index.js or build your models first.",
      );
    }
  } else {
    modelsModule = await import(indexPath!);
  }

  const models = modelsModule.models || modelsModule.default;
  const locales = modelsModule.locales;

  if (!Array.isArray(models)) {
    throw new Error(
      "Models export must be an array of ContentModel objects. Expected format: export const models = [model1, model2, ...];",
    );
  }

  console.log(`📋 Found ${models.length} model(s) to migrate`);

  // Also get file info for consistency
  const modelFiles = await glob("**/*.ts", {
    cwd: resolvedPath,
    ignore: ["index.ts", "**/*.d.ts", "**/*.test.ts", "**/__tests__/**"],
  });

  const fileInfo: ModelFileInfo[] = modelFiles.map((file) => ({
    file,
    path: path.join(resolvedPath, file),
  }));

  return {
    models,
    locales,
    fileInfo,
    count: models.length,
  };
}
