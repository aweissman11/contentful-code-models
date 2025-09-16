import "dotenv/config";
import { trialMigration } from "../utils/trialMigration.js";
import { models, locales } from "../models";
import { options } from "./options.js";

trialMigration({
  options,
  models,
  locales,
})
  .then(() => {
    console.log("Trial migration completed successfully.");
  })
  .catch((error) => {
    console.error("Trial migration failed:", error);
    process.exit(1);
  });
