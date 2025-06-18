import { runMigration, RunMigrationConfig } from "contentful-migration";
import { AsyncMigrationFunction, ContentModel } from "../types";
import { syncLocalModelsToContentful } from "./syncLocalModelsToContentful";

export const runMigrations = async ({
  options,
  migrationCallback,
  models,
}: {
  options: RunMigrationConfig;
  migrationCallback?: AsyncMigrationFunction;
  models?: ContentModel[];
}) => {
  await runMigration({
    ...options,
    migrationFunction: async (migration, context) => {
      if (models) {
        await syncLocalModelsToContentful({ models, migration, context });
      }

      migrationCallback?.({ models, migration, context });
    },
  });
};
