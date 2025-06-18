import { syncContentfulToLocal } from "../utils/syncContentfulToLocal.js";

syncContentfulToLocal({
  modelsBasePath: "./src/models",
})
  .then(() => {
    console.log("Sync completed successfully.");
  })
  .catch((error) => {
    console.error("Sync failed:", error);
  });
