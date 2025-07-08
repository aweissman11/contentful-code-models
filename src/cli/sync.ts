import { Command } from "commander";
import { syncToLocal } from "../utils/syncToLocal.js";
import path from "path";
import "dotenv/config";

export const syncCommand = new Command("sync")
  .description("Sync content models FROM Contentful to local files")
  .option(
    "-o, --output <path>",
    "Output directory for model files (relative to current directory)",
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

      // Resolve output path relative to current working directory
      const outputPath = path.resolve(process.cwd(), options.output);

      console.log(`🔄 Syncing content models from Contentful...`);
      console.log(`   Space: ${spaceId}`);
      console.log(`   Environment: ${environmentId}`);
      console.log(`   Output: ${outputPath}`);
      console.log("");

      await syncToLocal({
        modelsBasePath: outputPath,
        options: {
          spaceId,
          accessToken,
          environmentId,
        },
      });

      console.log("");
      console.log("✅ Sync completed successfully!");
      console.log(`📁 Models saved to: ${outputPath}`);
    } catch (error) {
      console.error("❌ Sync failed:", error);
      process.exit(1);
    }
  });
