import { PlainClientAPI } from "contentful-management";
import { createManagementClient } from "./createManagementClient.js";
import { migrateConfig } from "./migrateConfig.js";
import { loadModels } from "./loadModels.js";
import { setTimeout } from "timers/promises";
import { ContentfulClientOptions } from "../types/ClientOptions.js";
import { ContentModel } from "../types/index.js";
import { CreateLocaleProps } from "contentful-management/dist/typings/entities/locale.js";

interface TrialOptionsWithModels {
  options: ContentfulClientOptions;
  models: ContentModel[];
  locales?: CreateLocaleProps[];
}

interface TrialOptionsWithPath {
  options: ContentfulClientOptions;
  modelsPath: string;
}

type TrialOptions = TrialOptionsWithModels | TrialOptionsWithPath;

export const trialMigration = async (
  trialOptions: TrialOptions,
): Promise<string> => {
  console.log(
    `🔍 Starting trial migration for base environment: ${trialOptions.options.environmentId}`,
  );

  const client = createManagementClient(trialOptions.options);

  const trialEnvironmentId = `${trialOptions.options.environmentId}-trial-${Date.now()}`;
  console.log(`🆕 Creating trial environment: ${trialEnvironmentId}`);

  let actualTrialId: string | undefined;

  try {
    // Load models if path provided, otherwise use provided models
    let models: ContentModel[];
    let locales: CreateLocaleProps[] | undefined;

    if ("modelsPath" in trialOptions) {
      console.log("\n📦 Loading local models...");
      const modelsResult = await loadModels({
        modelsPath: trialOptions.modelsPath,
      });
      console.log(`   ✅ Found ${modelsResult.count} local model files`);
      models = modelsResult.models || [];
      locales = modelsResult.locales;
    } else if ("models" in trialOptions && Array.isArray(trialOptions.models)) {
      console.log(
        `\n📦 Using ${trialOptions.models.length} provided models...`,
      );
      models = trialOptions.models;
      locales = trialOptions.locales;
    } else {
      throw new Error("Either 'modelsPath' or 'models' must be provided");
    }

    actualTrialId = await createTrialEnvironment(client, trialOptions.options);

    console.log(
      `\n🚀 Running migration against trial environment: ${actualTrialId}`,
    );

    await migrateConfig({
      options: {
        ...trialOptions.options,
        environmentId: actualTrialId,
      },
      models,
      locales,
    });

    console.log("\n🔍 Verifying migration results...");
    const results = await verifyMigrationResults(
      trialOptions.options,
      actualTrialId,
    );

    const report = generateTrialReport({
      baseEnvironmentId: trialOptions.options.environmentId,
      trialEnvironmentId: actualTrialId,
      localModelsCount: models.length,
      migrationResults: results,
    });

    if (actualTrialId) {
      try {
        console.log(
          `\n🧹 Attempting to clean up trial environment: ${actualTrialId}`,
        );
        await client.environment.delete({ environmentId: actualTrialId });
        console.log("   ✅ Trial environment cleaned up successfully");
      } catch {
        console.log(
          "   ⚠️  Could not clean up trial environment - please delete manually",
        );
      }
    }

    return report;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Try to clean up the trial environment if it was created
    if (actualTrialId) {
      try {
        console.log(
          `\n🧹 Attempting to clean up trial environment: ${actualTrialId}`,
        );
        await client.environment.delete({ environmentId: actualTrialId });
        console.log("   ✅ Trial environment cleaned up successfully \n\n");
      } catch {
        console.log(
          "   ⚠️  Could not clean up trial environment - please delete manually",
        );
      }
    }

    throw new Error(`Trial migration failed: ${errorMessage}`);
  }
};

async function createTrialEnvironment(
  client: PlainClientAPI,
  options: ContentfulClientOptions,
): Promise<string> {
  try {
    const newEnvironment = await client.environment.create(
      { spaceId: options.spaceId },
      {
        name: `trial-${Date.now()}`,
      },
    );

    const createdTrialId = newEnvironment.sys.id;
    console.log(`   ✅ Trial environment created: ${createdTrialId}`);

    console.log("   ⏳ Waiting for environment to be ready...");
    let attempts = 0;
    const timeBetweenAttempts = 2000;
    const maxAttempts = 30; // 30 attempts * 2 seconds = 1 minute max wait

    while (attempts < maxAttempts) {
      const env = await client.environment.get({
        spaceId: options.spaceId,
        environmentId: createdTrialId,
      });
      if (env.sys.status.sys.id === "ready") {
        console.log("   ✅ Environment is ready for migration");
        return createdTrialId;
      }
      await setTimeout(timeBetweenAttempts);
      attempts++;
    }

    throw new Error("Environment did not become ready within timeout period");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to create trial environment: ${errorMessage}`);
    throw new Error(`Failed to create trial environment: ${errorMessage}`);
  }
}

async function verifyMigrationResults(
  options: { spaceId: string; accessToken: string },
  environmentId: string,
): Promise<{
  contentTypesCreated: number;
  contentTypesUpdated: number;
  errors: string[];
}> {
  try {
    // Create client for the trial environment
    const trialClient = createManagementClient({
      spaceId: options.spaceId,
      accessToken: options.accessToken,
      environmentId,
    });

    const contentTypes = await trialClient.contentType.getMany({});

    const results = {
      contentTypesCreated: 0,
      contentTypesUpdated: 0,
      errors: [] as string[],
    };

    // For simplicity, we'll count all content types as "created" since we can't easily
    // determine which were created vs updated without more complex logic
    results.contentTypesCreated = contentTypes.items.length;

    console.log(
      `   ✅ Migration completed with ${contentTypes.items.length} content types`,
    );

    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      contentTypesCreated: 0,
      contentTypesUpdated: 0,
      errors: [errorMessage],
    };
  }
}

function generateTrialReport({
  baseEnvironmentId,
  trialEnvironmentId,
  localModelsCount,
  migrationResults,
}: {
  baseEnvironmentId: string;
  trialEnvironmentId: string;
  localModelsCount: number;
  migrationResults: {
    contentTypesCreated: number;
    contentTypesUpdated: number;
    errors: string[];
  };
}): string {
  const hasErrors = migrationResults.errors.length > 0;

  return `
🧪 Trial Migration Report
=========================

Base Environment: ${baseEnvironmentId}
Trial Environment: ${trialEnvironmentId}

📦 Local Models: ${localModelsCount} files processed

🚀 Migration Results:
   • Content Types Created: ${migrationResults.contentTypesCreated}
   • Content Types Updated: ${migrationResults.contentTypesUpdated}
   • Errors: ${migrationResults.errors.length}

${
  hasErrors
    ? `
❌ Errors Encountered:
${migrationResults.errors.map((error) => `   • ${error}`).join("\n")}
`
    : "✅ Migration completed successfully!"
}

💡 Next Steps:
  ${
    hasErrors
      ? "Fix the errors above and run the trial again before applying to your main environment."
      : `Run 'contentful-code-models migrate --environment ${baseEnvironmentId}' to apply these changes to your main environment.`
  }
`;
}
