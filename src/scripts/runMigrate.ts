import { models } from "../models";
import { runMigrations } from "../utils";

import "dotenv/config";

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
};

runMigrations({
  models,
  options,
})
  .then((client) => {
    console.log("Migration completed successfully.");
    console.log("Client ready for further operations:", client);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
