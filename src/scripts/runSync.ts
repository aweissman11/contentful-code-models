import { syncContentfulToLocal } from "../utils/sync.js";

syncContentfulToLocal({
  modelsBasePath: "./src/models",
})
  .then(() => {
    console.log("Sync completed successfully.");
  })
  .catch((error) => {
    console.error("Sync failed:", error);
  });
