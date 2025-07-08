import { ContentTypeProps, PlainClientAPI } from "contentful-management";
import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import merge from "lodash/merge.js";
import path from "path";
import { pathToFileURL } from "url";
import { ContentModel } from "../../types";

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

export const syncModels = async ({
  modelsDir,
  client,
}: {
  modelsDir: string;
  client: PlainClientAPI;
}): Promise<ContentTypeProps[]> => {
  console.log("Running sync function...");
  if (!client) {
    throw new Error("Client is not provided. Please provide a valid client.");
  }

  const contentModels = (
    await client.contentType.getMany({ query: { limit: 200 } })
  ).items.filter((model) => model.sys.id !== "contentful-migrations");

  const editorInterfaces = (
    await client.editorInterface.getMany({
      query: { limit: 200 },
    })
  ).items;

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
      localModel = localModule?.[model.sys.id];
    } catch {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sys, ...rest } = editorLayout;
      parsedModel.editorInterface = {
        ...rest,
      };
    }

    const mergedModel = merge(localModel, parsedModel);

    // set this path from the root of the project
    const filePath = path.join(modelsDir, `${model.sys.id}.ts`);
    await mkdir(path.dirname(filePath), { recursive: true });

    const fileContent = `
      import type { ContentModel } from 'contentful-code-models';

      export const ${model.sys.id}:ContentModel = ${JSON.stringify(mergedModel, null, 2)};
    `.trim();
    await writeFile(filePath, fileContent, "utf8");
    console.log(`Model for ${model.sys.id} written to ${filePath}`);
  }

  console.log("All models processed successfully.");

  return contentModels;
};
