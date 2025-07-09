import {
  ContentTypeProps,
  EditorInterfaceProps,
  PlainClientAPI,
} from "contentful-management";
import cloneDeep from "lodash/cloneDeep.js";
import { ContentModel } from "../../types";

export const migrateModels = async ({
  client,
  options,
  models,
}: {
  client: PlainClientAPI;
  options: {
    accessToken: string;
    spaceId: string;
    environmentId: string;
  };
  models?: ContentModel[];
}): Promise<void> => {
  if (models?.length) {
    let originalContentTypes: Record<string, ContentTypeProps> = {};
    let originalEditorInterfaces: Record<string, EditorInterfaceProps> = {};
    let createdContentTypes: string[] = [];

    try {
      let contentModels = await client.contentType.getMany({});
      const editorInterfaces = await client.editorInterface.getMany({});

      originalContentTypes = contentModels.items.reduce<{
        [key: string]: ContentTypeProps;
      }>((acc, model) => {
        acc[model.sys.id] = cloneDeep(model);
        return acc;
      }, {});

      originalEditorInterfaces = editorInterfaces.items.reduce<
        Record<string, EditorInterfaceProps>
      >((acc, model) => {
        acc[model.sys.contentType.sys.id] = cloneDeep(model);
        return acc;
      }, {});

      // create all models that exist in the local list but not in the space. Do not include their fields.
      const modelsToCreate = models.filter((model) => {
        return !contentModels.items.find((m) => m.sys.id === model.sys.id);
      });

      for (const model of modelsToCreate) {
        createdContentTypes.push(model.sys.id);
        const createdModel = await client.contentType.createWithId(
          {
            contentTypeId: model.sys.id,
          },
          {
            name: model.name,
            description: model.description,
            fields: [],
          },
        );

        console.log("created model", createdModel.sys.id, "✅");
      }

      // Now update all models that exist in the space, including those created above
      contentModels = await client.contentType.getMany({});

      for (const model of models) {
        const existingContentType = contentModels.items.find(
          (m) => m.sys.id === model.sys.id,
        );
        if (!existingContentType) {
          // This should never happen because we create all models that don't exist above
          throw new Error(
            `Something went wrong. Model ${model.sys.id} does not exist in the space and was not created as part of the initial pass.`,
          );
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
              description: model.description ?? "",
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

      console.log("Rolling back all changes 🛞⬅️");
      for (const model of models) {
        if (createdContentTypes.includes(model.sys.id)) {
          // delete the content type
          await client.contentType.delete({
            contentTypeId: model.sys.id,
          });
          console.log("Deleted content type", model.sys.id, "🗑️");
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
              "Rolled back editor interface for",
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
            console.log("Rolled back content type for", model.sys.id, "🛞⬅️");
          }
        }
      }
    }
  } else {
    console.log("No models to migrate, skipping...");
  }
};
