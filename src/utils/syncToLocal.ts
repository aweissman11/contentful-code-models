import { PlainClientAPI } from "contentful-management";
import "dotenv/config";
import path from "path";
import { createManagementClient } from "./createManagementClient";
import { syncModels } from "./syncFunctions/syncModels";
import { createModelsIndexFile } from "./syncFunctions/createModelsIndexFile";
import { ContentfulClientOptions } from "../types/ClientOptions";

export const syncToLocal = async ({
  modelsBasePath,
  options,
}: {
  modelsBasePath?: string;
  options: ContentfulClientOptions;
}): Promise<PlainClientAPI> => {
  console.log("Running sync function...");

  const client = createManagementClient(options);

  const basePath = modelsBasePath ?? process.cwd(); // fallback to project root
  const modelsDir = path.resolve(basePath);

  const contentModels = await syncModels({
    modelsDir,
    client,
  });

  const locales = (await client.locale.getMany({})).items;

  await createModelsIndexFile({
    modelsDir,
    contentModels,
    locales,
  });

  console.log("\x1b[35m", "=======================================");
  console.log("\x1b[32m", "+++++++++++++++++++++++++++++++++++++++");
  console.log("\x1b[34m", "Sync completed successfully!");
  console.log(
    "\x1b[34m",
    "**You should probably format and commit your code now.**",
  );
  console.log("\x1b[32m", "+++++++++++++++++++++++++++++++++++++++");
  console.log("\x1b[35m", "=======================================");

  return client;
};
