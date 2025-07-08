import { models, locales } from "../models";
import { migrateConfig } from "../utils";

import "dotenv/config";

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
};

migrateConfig({
  models,
  locales,
  options,
})
  .then(async (client) => {
    console.log("Migration completed successfully.");
    console.log("Client ready for further operations");
    const entries = await client.entry.getMany({ query: { limit: 10 } });
    // Do something else to the entries here
    console.log("entries =>", entries);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
