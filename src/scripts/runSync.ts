import { syncToLocal } from "../utils/syncToLocal.js";

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
};

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
