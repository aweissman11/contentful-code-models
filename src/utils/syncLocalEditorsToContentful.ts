import isEqual from "lodash/isEqual";
import { AsyncMigrationFunction } from "../types";
import { createManagementClient } from "./createManagementClient";
import { createOrEditContentType } from "./createOrEditContentType";

export const syncLocalEditorsToContentful: AsyncMigrationFunction = async ({
  models,
  migration,
  context,
  options,
}): Promise<void> => {
  const { makeRequest } = context;

  if (!models || models.length === 0) {
    console.log("No editors to migrate.");
    return;
  }

  if (!options) {
    throw new Error(
      "Options must be provided to syncLocalEditorsToContentful.",
    );
  }

  console.log("Migrating local content editors to Contentful...");

  const { accessToken, environmentId, spaceId } = options;
  const client = createManagementClient({
    accessToken,
    environmentId,
    spaceId,
  });

  const existingEditors = (
    await client.editorInterface.getMany({
      query: { limit: 200 },
    })
  ).items;

  for (const m of models) {
    const model = await createOrEditContentType({
      migration,
      makeRequest,
      name: m.name,
      contentTypeId: m.id,
    });

    const modelEditorLayout = existingEditors.find(
      (ei) => ei.sys.contentType.sys.id === model.contentModel?.sys?.id,
    );

    if (!modelEditorLayout) {
      console.warn(`No editor layout found for content type ${m.id}.`);
    }

    if (m.configureEntryEditors) {
      // TODO: Figure out why this won't work
      // model.contentType.configureEntryEditors(m.configureEntryEditors);
      for (const editor of m.configureEntryEditors) {
        const existingEditor = modelEditorLayout?.controls?.find(
          (e) => e.settings?.fieldId === editor.settings?.fieldId,
        );
        if (existingEditor) {
          existingEditor.widgetNamespace =
            existingEditor?.widgetNamespace === "builtin"
              ? "editor-builtin"
              : existingEditor?.widgetNamespace;
        }
        const editorHasChanged = !isEqual(editor, existingEditor);
        if (editorHasChanged) {
          model.contentType.configureEntryEditor(
            editor.widgetNamespace,
            editor.widgetId,
            editor.settings,
          );
        } else {
          console.log(
            "Skipping editor configuration for",
            editor.settings?.fieldId,
            "as it matches the existing editor layout.",
          );
        }
      }
    }

    // check if the order of fields has changed
    const existingFields = modelEditorLayout?.controls?.map((c) => c.fieldId);

    const localFields = m.fields?.map((f) => f.id);
    const orderHasChanged =
      !existingFields ||
      existingFields.length !== localFields?.length ||
      !isEqual(existingFields, localFields);

    if (orderHasChanged) {
      m.fields?.forEach((field, ix) => {
        if (ix === 0) {
          model.contentType.moveField(field.id).toTheTop();
        } else {
          const prevField = m.fields[ix - 1];
          if (prevField) {
            model.contentType.moveField(field.id).afterField(prevField.id);
          }
        }
      });
    }
  }
};
