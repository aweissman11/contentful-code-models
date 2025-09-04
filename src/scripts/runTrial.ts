import "dotenv/config";
import { trialMigration } from "../utils/trialMigration.js";

const main = async () => {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
    const environmentId = process.env.CONTENTFUL_ENVIRONMENT || "master";

    if (!spaceId) {
      console.error(
        "❌ Error: CONTENTFUL_SPACE_ID environment variable is required",
      );
      process.exit(1);
    }

    if (!accessToken) {
      console.error(
        "❌ Error: CONTENTFUL_MANAGEMENT_TOKEN environment variable is required",
      );
      process.exit(1);
    }

    console.log("🧪 Starting trial run...");
    console.log(`   Space: ${spaceId}`);
    console.log(`   Environment: ${environmentId}`);
    console.log("");

    const result = await trialMigration({
      options: {
        spaceId,
        accessToken,
        environmentId,
      },
      modelsPath: "./src/models",
    });

    console.log(result);
  } catch {
    console.error("❌ Trial run failed see previous errors");
    process.exit(1);
  }
};

main();
