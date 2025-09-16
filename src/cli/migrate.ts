import { Command } from "commander";
import { migrateConfig } from "../utils/migrateConfig.js";
import "dotenv/config";

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

      await migrateConfig({
        modelsPath: options.models,
        options: {
          spaceId,
          accessToken,
          environmentId,
        },
      });

      console.log("\n✅ Migration completed successfully!");
    } catch (error) {
      console.error("\n❌ Migration failed:\n", error);
      process.exit(1);
    }
  });
