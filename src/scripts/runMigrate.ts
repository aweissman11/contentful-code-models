import "dotenv/config";
import { models } from "../models";
import { AsyncMigrationFunction } from "../types";
import { runMigrations } from "../utils";

export const migrationFunction: AsyncMigrationFunction = async ({
  models: theseModels,
  migration,
  context,
}): Promise<void> => {
  console.log("Running migration function...");

  // migration functions go here. This might be somewhere you manipulate data like taking a field that was previously plain text and converting it to rich text format. See the contentful-migration documentation for how to transformEntries
  const modelIds = theseModels?.map((m) => m.id);
  console.log("Models being migrated:", modelIds);
};

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
  yes: true,
  migrationFunction,
};

runMigrations({
  models,
  options,
})
  .then(() => {
    console.log("Migration completed successfully.");
  })
  .catch((error) => {
    console.error("Migration failed:", error);
  });
