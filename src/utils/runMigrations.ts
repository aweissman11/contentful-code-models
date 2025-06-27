import { runMigration } from "contentful-migration";
import { ContentModel, RunMigrationConfigWithAsync } from "../types";
import { syncLocalModelsToContentful } from "./syncLocalModelsToContentful";
import { syncLocalEditorsToContentful } from "./syncLocalEditorsToContentful";

export const runMigrations = async ({
  options,
  models,
}: {
  options: RunMigrationConfigWithAsync;
  models?: ContentModel[];
}) => {
  if (models?.length) {
    // run a migration of the models
    await runMigration({
      ...options,
      migrationFunction: async (migration, context) => {
        await syncLocalModelsToContentful({
          models,
          migration,
          context,
          options,
        });
      },
    });

    // TODO: This isn't currently working
    // Now configure the editors
    if (models.some((m) => m.configureEntryEditors)) {
      await runMigration({
        ...options,
        migrationFunction: async (migration, context) => {
          await syncLocalEditorsToContentful({
            models,
            migration,
            context,
            options,
          });

          options.migrationFunction?.({ models, migration, context });
        },
      });
    }
  }
};
