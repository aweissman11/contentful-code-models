import { syncToLocal } from "../utils/syncToLocal.js";
import { options } from "./options.js";

syncToLocal({
  modelsBasePath: "./src/models",
  options,
})
  .then(() => {
    console.log("Sync completed successfully.");
  })
  .catch((error) => {
    console.error("Sync failed:", error);
    process.exit(1);
  });
