import "dotenv/config";
import { models, locales } from "../models";
import { migrateConfig } from "../utils";
import { options } from "./options";

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
