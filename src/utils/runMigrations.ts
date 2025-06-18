import { runMigration } from "contentful-migration";
import { ContentModel, RunMigrationConfigWithAsync } from "../types";
import { syncLocalModelsToContentful } from "./syncLocalModelsToContentful";

export const runMigrations = async ({
  options,
  models,
}: {
  options: RunMigrationConfigWithAsync;
  models?: ContentModel[];
}) => {
  await runMigration({
    ...options,
    migrationFunction: async (migration, context) => {
      if (models) {
        await syncLocalModelsToContentful({ models, migration, context });
      }

      options.migrationFunction?.({ models, migration, context });
    },
  });
};
