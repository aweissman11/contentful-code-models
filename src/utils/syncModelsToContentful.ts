import cloneDeep from "lodash/cloneDeep";
import { ContentModel } from "../types";
import { createManagementClient } from "./createManagementClient";
import {
  ContentTypeProps,
  EditorInterfaceProps,
  PlainClientAPI,
} from "contentful-management";

export const syncModelsToContentful = async ({
  options,
  models,
}: {
  options: {
    accessToken: string;
    spaceId: string;
    environmentId: string;
  };
  models?: ContentModel[];
}): Promise<PlainClientAPI> => {
  const client = createManagementClient(options);

  if (models?.length) {
    const contentModels = await client.contentType.getMany({});
    const editorInterfaces = await client.editorInterface.getMany({});

    const originalContentTypes = contentModels.items.reduce<{
      [key: string]: ContentTypeProps;
    }>((acc, model) => {
      acc[model.sys.id] = cloneDeep(model);
      return acc;
    }, {});

    const createdContentTypes: string[] = [];

    const originalEditorInterfaces = editorInterfaces.items.reduce<
      Record<string, EditorInterfaceProps>
    >((acc, model) => {
      acc[model.sys.contentType.sys.id] = cloneDeep(model);
      return acc;
    }, {});

    try {
      for (const model of models) {
        const existingContentType = contentModels.items.find(
          (m) => m.sys.id === model.sys.id,
        );
        if (!existingContentType) {
          const createdModel = await client.contentType.createWithId(
            {
              contentTypeId: model.sys.id,
            },
            {
              name: model.name,
              description: model.description,
              displayField: model.displayField ?? undefined,
              fields: model.fields,
            },
          );

          createdContentTypes.push(createdModel.sys.id);
          console.log("created model", createdModel.sys.id, "✅");
        } else {
          const fields = [
            ...model.fields,
            ...existingContentType.fields
              .filter((f) => !model.fields.find((mf) => mf.id === f.id))
              .map((f) => ({
                ...f,
                omitted: true,
              })),
          ];

          const updatedModel = await client.contentType.update(
            {
              ...options,
              contentTypeId: model.sys.id,
            },
            {
              ...existingContentType,
              name: model.name,
              description: model.description,
              displayField:
                model.displayField ??
                model.fields.find((f) => f.type === "Symbol")?.id ??
                "",
              fields,
            },
          );

          console.log(
            "updated model",
            updatedModel.sys.id,
            "version",
            updatedModel.sys.version,
            "⬆️",
          );
        }
      }

      for (const editor of editorInterfaces.items) {
        const model = models.find(
          (m) => m.sys.id === editor.sys.contentType.sys.id,
        );
        if (model && model.editorInterface) {
          const updatedEditor = await client.editorInterface.update(
            {
              ...options,
              contentTypeId: model.sys.id,
            },
            {
              ...editor,
              ...model.editorInterface,
            },
          );
          console.log("updated editor interface for", model.sys.id, "📋");
          if (originalEditorInterfaces[model.sys.id]) {
            originalEditorInterfaces[model.sys.id].sys = updatedEditor.sys;
          }
        } else {
          console.log("no editor interface for", editor.sys.contentType.sys.id);
        }
      }

      for (const model of contentModels.items) {
        const publishedModel = await client.contentType.publish(
          {
            ...options,
            contentTypeId: model.sys.id,
          },
          {
            ...model,
            sys: {
              ...model.sys,
              version: model.sys.version + 1,
            },
          },
        );
        console.log(
          "published model",
          publishedModel.sys.id,
          "version:",
          publishedModel.sys.version,
          "📤",
        );
        if (originalContentTypes[model.sys.id]) {
          originalContentTypes[model.sys.id].sys = publishedModel.sys;
        }
      }

      console.log("\x1b[35m", "=======================================");
      console.log("\x1b[32m", "+++++++++++++++++++++++++++++++++++++++");
      console.log("\x1b[34m", "All models successfully migrated! 🎉");
      console.log("\x1b[32m", "+++++++++++++++++++++++++++++++++++++++");
      console.log("\x1b[35m", "=======================================");
    } catch (error) {
      console.error("\n\n\n\x1b[31m", error, "\n\n\n");

      for (const model of models) {
        if (createdContentTypes.includes(model.sys.id)) {
          // delete the content type
          await client.contentType.delete({
            contentTypeId: model.sys.id,
          });
          console.log("deleted content type", model.sys.id, "🗑️");
        } else {
          const originalEditorInterface =
            originalEditorInterfaces[model.sys.id];
          if (originalEditorInterface) {
            await client.editorInterface.update(
              {
                ...options,
                contentTypeId: model.sys.id,
              },
              {
                ...originalEditorInterface,
              },
            );
            console.log(
              "rolled back editor interface for",
              model.sys.id,
              "🛞⬅️",
            );
          }

          const originalContentType = originalContentTypes[model.sys.id];

          if (originalContentType) {
            const rolledBack = await client.contentType.update(
              {
                ...options,
                contentTypeId: model.sys.id,
              },
              {
                ...originalContentType,
                sys: {
                  ...originalContentType.sys,
                  version: originalContentType.sys.version + 1,
                },
              },
            );
            await client.contentType.publish(
              {
                ...options,
                contentTypeId: rolledBack.sys.id,
              },
              {
                ...rolledBack,
                sys: {
                  ...rolledBack.sys,
                  version: rolledBack.sys.version,
                },
              },
            );
            console.log("rolled back content type for", model.sys.id, "🛞⬅️");
          }
        }
      }
    }
  }

  return client;
};
