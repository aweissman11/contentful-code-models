import { CreateLocaleProps, PlainClientAPI } from "contentful-management";
import { ContentModel } from "../types";
import { createManagementClient } from "./createManagementClient";
import { migrateModels } from "./migrateFunctions/migrateModels";
import { handleLocales } from "./migrateFunctions/migrateLocales";
import { loadModels } from "./loadModels";
import { ContentfulClientOptions } from "../types/ClientOptions";

interface MigrateOptionsWithModels {
  options: ContentfulClientOptions;
  models: ContentModel[];
  locales?: CreateLocaleProps[];
}

interface MigrateOptionsWithPath {
  options: ContentfulClientOptions;
  modelsPath: string;
}

type MigrateOptions = MigrateOptionsWithModels | MigrateOptionsWithPath;

export const migrateConfig = async (
  migrateOptions: MigrateOptions,
): Promise<PlainClientAPI> => {
  const client = createManagementClient(migrateOptions.options);

  // Determine models and locales to use
  let models: ContentModel[] | undefined;
  let locales: CreateLocaleProps[] | undefined;

  if ("modelsPath" in migrateOptions) {
    // Load models from path
    console.log("\n📦 Loading local models...");
    const modelsResult = await loadModels({
      modelsPath: migrateOptions.modelsPath,
    });
    console.log(`   ✅ Found ${modelsResult.count} local model files`);
    models = modelsResult.models;
    locales = modelsResult.locales;
  } else if (
    "models" in migrateOptions &&
    Array.isArray(migrateOptions.models)
  ) {
    // Use provided models (specific models provided)
    console.log(
      `\n📦 Using ${migrateOptions.models.length} provided models...`,
    );
    models = migrateOptions.models;
    locales = migrateOptions.locales;
  } else {
    throw new Error("Either 'modelsPath' or 'models' must be provided");
  }

  await handleLocales({ client, options: migrateOptions.options, locales });

  await migrateModels({ client, options: migrateOptions.options, models });

  return client;
};
