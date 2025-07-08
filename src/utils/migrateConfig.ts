import { CreateLocaleProps, PlainClientAPI } from "contentful-management";
import { ContentModel } from "../types";
import { createManagementClient } from "./createManagementClient";
import { migrateModels } from "./migrateFunctions/migrateModels";
import { handleLocales } from "./migrateFunctions/migrateLocales";

export const migrateConfig = async ({
  options,
  models,
  locales,
}: {
  options: {
    accessToken: string;
    spaceId: string;
    environmentId: string;
  };
  models?: ContentModel[];
  locales?: CreateLocaleProps[];
}): Promise<PlainClientAPI> => {
  const client = createManagementClient(options);

  await handleLocales({ client, options, locales });

  await migrateModels({ client, options, models });

  return client;
};
