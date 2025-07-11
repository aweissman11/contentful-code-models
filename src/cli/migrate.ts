import { Command } from "commander";
import { stat } from "fs/promises";
import path from "path";
import { migrateConfig } from "../utils/migrateConfig.js";
import "dotenv/config";
import { ContentModel } from "../types/index.js";
import { CreateLocaleProps } from "contentful-management/dist/typings/entities/locale.js";

/**
 * Loads models from a directory, looking for either index.js or index.ts
 * Prefers index.js if both exist, falls back to index.ts if only that exists
 */
async function loadModelsFromDirectory(
  modelsPath: string,
): Promise<{ models?: ContentModel[]; locales?: CreateLocaleProps[] }> {
  try {
    const resolvedPath = path.resolve(process.cwd(), modelsPath);

    console.log(`📂 Loading models from: ${resolvedPath}`);

    // Try to find index file (prefer .js, fallback to .ts)
    let indexPath: string;
    let isTypeScript = false;

    // First try index.js
    const indexJsPath = path.join(resolvedPath, "index.js");
    try {
      await stat(indexJsPath);
      indexPath = indexJsPath;
      console.log(`📄 Using index.js`);
    } catch {
      // Try index.ts
      const indexTsPath = path.join(resolvedPath, "index.ts");
      try {
        await stat(indexTsPath);
        indexPath = indexTsPath;
        isTypeScript = true;
        console.log(`📄 Using index.ts`);
      } catch {
        // Neither found
        console.error(
          `❌ Error: No index.js or index.ts found in ${resolvedPath}`,
        );
        console.log(
          "💡 Tip: Make sure your models directory has an index file that exports all models as an array.",
        );
        process.exit(1);
      }
    }

    // Import the models
    let modelsModule;
    if (isTypeScript) {
      // For TypeScript files, we need to handle them specially
      try {
        // Use tsx to run the TypeScript file and extract the models
        console.log("📝 Loading TypeScript file with tsx...");
        const { spawn } = await import("child_process");
        const { writeFile, unlink } = await import("fs/promises");
        const { tmpdir } = await import("os");

        // Create a temporary script to extract models
        const tempScriptPath = path.join(
          tmpdir(),
          `extract-models-${Date.now()}.js`,
        );
        const extractScript = `
          import { models, locales } from "${indexPath}";
          process.stdout.write(JSON.stringify({ models, locales }, null, 2));
        `;

        await writeFile(tempScriptPath, extractScript);

        // Run tsx to execute the script
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

        // Clean up temp file
        await unlink(tempScriptPath).catch(() => {}); // Ignore cleanup errors

        // Parse the JSON output
        try {
          modelsModule = JSON.parse(result.trim());
        } catch (parseError) {
          console.error(
            "❌ Error: Failed to parse models output from TypeScript file.",
          );
          console.error("Raw output:", result);
          throw parseError;
        }
      } catch (tsxError) {
        console.error(
          "❌ Error: Failed to load TypeScript file. Make sure tsx is available for loading .ts files.",
        );
        console.log(
          "💡 Tip: Either build your project first or ensure tsx is properly installed.",
        );
        console.log(
          "💡 Alternative: Convert your index.ts to index.js or build your models first.",
        );
        throw tsxError;
      }
    } else {
      modelsModule = await import(indexPath!);
    }

    const models = modelsModule.models || modelsModule.default;
    const locales = modelsModule.locales;

    if (!Array.isArray(models)) {
      console.error(
        "❌ Error: Models export must be an array of ContentModel objects.",
      );
      console.log(
        "💡 Expected format: export const models = [model1, model2, ...];",
      );
      process.exit(1);
    }

    console.log(`📋 Found ${models.length} model(s) to migrate`);
    return { models, locales };
  } catch (error) {
    console.error(`❌ Error loading models from ${modelsPath}:`, error);
    process.exit(1);
  }
}

export const migrateCommand = new Command("migrate")
  .description("Migrate content models TO Contentful from local files")
  .option(
    "-m, --models <path>",
    "Path to models directory (relative to current directory)",
    "./src/models",
  )
  .option(
    "-s, --space-id <spaceId>",
    "Contentful space ID (or set CONTENTFUL_SPACE_ID env var)",
  )
  .option(
    "-t, --access-token <token>",
    "Contentful management token (or set CONTENTFUL_MANAGEMENT_TOKEN env var)",
  )
  .option(
    "-e, --environment <environment>",
    "Contentful environment (or set CONTENTFUL_ENVIRONMENT env var)",
    "master",
  )
  .action(async (options) => {
    try {
      // Get configuration from options or environment variables
      const spaceId = options.spaceId || process.env.CONTENTFUL_SPACE_ID;
      const accessToken =
        options.accessToken || process.env.CONTENTFUL_MANAGEMENT_TOKEN;
      const environmentId =
        options.environment || process.env.CONTENTFUL_ENVIRONMENT || "master";

      if (!spaceId) {
        console.error(
          "❌ Error: Contentful space ID is required. Provide via --space-id or CONTENTFUL_SPACE_ID env var.",
        );
        process.exit(1);
      }

      if (!accessToken) {
        console.error(
          "❌ Error: Contentful management token is required. Provide via --access-token or CONTENTFUL_MANAGEMENT_TOKEN env var.",
        );
        process.exit(1);
      }

      console.log(`🚀 Migrating content models to Contentful...`);
      console.log(`   Space: ${spaceId}`);
      console.log(`   Environment: ${environmentId}`);
      console.log(`   Models path: ${options.models}`);
      console.log("");

      // Load models from the specified directory
      const { models, locales } = await loadModelsFromDirectory(options.models);

      await migrateConfig({
        models,
        locales,
        options: {
          spaceId,
          accessToken,
          environmentId,
        },
      });

      console.log("\n✅ Migration completed successfully!");
      console.log(`🎉 ${models?.length} model(s) synced to Contentful`);
    } catch (error) {
      console.error("\n❌ Migration failed:\n", error);
      process.exit(1);
    }
  });
