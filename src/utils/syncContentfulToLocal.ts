import { PlainClientAPI } from "contentful-management";
import "dotenv/config";
import fs from "fs";
import merge from "lodash/merge.js";
import path from "path";
import { pathToFileURL } from "url";
import { ContentModel } from "../types";
import { createManagementClient } from "./createManagementClient";

export const fieldDefaults = {
  omitted: false,
  disabled: false,
  required: false,
  localized: false,
  allowedResources: undefined,
  deleted: undefined,
  linkType: undefined,
  defaultValue: undefined,
};

export const syncContentfulToLocal = async ({
  modelsBasePath,
  options,
}: {
  modelsBasePath?: string;
  options: {
    accessToken: string;
    environmentId: string;
    spaceId: string;
  };
}): Promise<PlainClientAPI> => {
  console.log("Running sync function...");
  const { accessToken, environmentId, spaceId } = options;

  const client = createManagementClient({
    accessToken,
    environmentId,
    spaceId,
  });

  const contentModels = (
    await client.contentType.getMany({ query: { limit: 200 } })
  ).items.filter((model) => model.sys.id !== "contentful-migrations");

  const editorInterfaces = (
    await client.editorInterface.getMany({
      query: { limit: 200 },
    })
  ).items;
  const basePath = modelsBasePath ?? process.cwd(); // fallback to project root
  const modelsDir = path.resolve(basePath);

  for (const model of contentModels) {
    console.log(`Processing model: ${model.sys.id}`);

    const editorLayout = editorInterfaces.find(
      (ei) => ei.sys.contentType.sys.id === model.sys.id,
    );

    // get local model from the file system
    let localModel: ContentModel | null = null;
    try {
      const localFilePath = path.resolve(
        path.join(modelsDir),
        `${model.sys.id}.ts`,
      );
      const localModule = await import(pathToFileURL(localFilePath).toString());
      localModel = localModule?.[model.sys.id] ?? {};
    } catch (error) {
      console.error(`No local model for ${model.sys.id} found`);
    }

    const parsedModel: ContentModel = {
      sys: {
        id: model.sys.id,
      },
      name: model.name,
      description: model.description,
      displayField: model.displayField,
      fields: model.fields,
    };

    if (editorLayout) {
      const { sys, ...rest } = editorLayout;
      parsedModel.editorInterface = {
        ...rest,
      };
    }

    const mergedModel = merge(localModel, parsedModel);

    // set this path from the root of the project
    const filePath = path.join(modelsDir, `${model.sys.id}.ts`);
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const fileContent = `import type { ContentModel } from 'contentful-code-models';\n\nexport const ${
      model.sys.id
    }:ContentModel = ${JSON.stringify(mergedModel, null, 2)};\n`;
    fs.writeFileSync(filePath, fileContent, "utf8");
    console.log(`Model for ${model.sys.id} written to ${filePath}`);
  }

  console.log("All models processed successfully.");

  const filePath = path.join(modelsDir, `index.ts`);
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const fileContent = `import type { ContentModel } from 'contentful-code-models';\n${contentModels
    .map(({ sys }) => `import { ${sys.id} } from "./${sys.id}";`)
    .join("\n")}\n\nexport const models:ContentModel[] = [${contentModels.map(
    ({ sys }) => sys.id,
  )}];\n`;
  fs.writeFileSync(filePath, fileContent, "utf8");

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
