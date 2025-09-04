import { CreateLocaleProps, PlainClientAPI } from "contentful-management";
import { ContentModel } from "../types";
import { createManagementClient } from "./createManagementClient";
import { migrateModels } from "./migrateFunctions/migrateModels";
import { handleLocales } from "./migrateFunctions/migrateLocales";
import { ContentfulClientOptions } from "../types/ClientOptions";

export const migrateConfig = async ({
  options,
  models,
  locales,
}: {
  options: ContentfulClientOptions;
  models?: ContentModel[];
  locales?: CreateLocaleProps[];
}): Promise<PlainClientAPI> => {
  const client = createManagementClient(options);

  await handleLocales({ client, options, locales });

  await migrateModels({ client, options, models });

  return client;
};
