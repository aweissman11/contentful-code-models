import { Command } from "commander";
import "dotenv/config";
import { trialMigration } from "../utils";

export const trialCommand = new Command("trial")
  .description(
    "Create a trial environment and run a real migration to test changes safely",
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
    "Contentful environment to trial against (or set CONTENTFUL_ENVIRONMENT env var)",
    "master",
  )
  .option(
    "-m, --models <path>",
    "Path to models directory (relative to current directory)",
    "./src/models",
  )
  .action(async (options) => {
    try {
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

      console.log(`🔍 Running trial migration...`);
      console.log(`   Space: ${spaceId}`);
      console.log(`   Environment: ${environmentId}`);
      console.log(`   Models path: ${options.models}`);
      console.log("");

      const report = await trialMigration({
        modelsPath: options.models,
        options: {
          spaceId,
          accessToken,
          environmentId,
        },
      });

      console.log(report);
    } catch (error) {
      console.error("❌ Trial run failed:", error);
      process.exit(1);
    }
  });
