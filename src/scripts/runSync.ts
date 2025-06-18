import { syncContentfulToLocal } from "../utils/syncContentfulToLocal.js";

syncContentfulToLocal({
  modelsBasePath: "./src/models",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  spaceId: process.env.CONTENTFUL_SPACE_ID!,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID ?? "master",
})
  .then(() => {
    console.log("Sync completed successfully.");
  })
  .catch((error) => {
    console.error("Sync failed:", error);
  });
