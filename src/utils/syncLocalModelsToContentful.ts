import { AsyncMigrationFunction } from "../types";
import { createOrEditContentType } from "./createOrEditContentType";
import { createOrEditField } from "./createOrEditField";

export const syncLocalModelsToContentful: AsyncMigrationFunction = async ({
  models,
  migration,
  context,
}): Promise<void> => {
  const { makeRequest } = context;

  if (!models || models.length === 0) {
    console.log("No models to migrate.");
    return;
  }

  console.log("Migrating local content models to Contentful...");

  for (const m of models) {
    const model = await createOrEditContentType({
      migration,
      makeRequest,
      name: m.name,
      contentTypeId: m.id,
    });

    if (m.description) {
      model.contentType.description(m.description);
    }
    if (m.displayField) {
      model.contentType.displayField(m.displayField);
    }

    if (m.fields) {
      for (const f of m.fields) {
        const field = await createOrEditField({
          parent: model,
          fieldId: f.id,
          name: f.name,
          type: f.type,
        });

        if (f.omitted) {
          field.omitted(true);
        } else {
          field.omitted(false);
        }

        if (f.disabled) {
          field.disabled(true);
        } else {
          field.disabled(false);
        }

        if (f.required) {
          field.required(true);
        } else {
          field.required(false);
        }

        if (f.localized) {
          field.localized(true);
        } else {
          field.localized(false);
        }

        if (f.defaultValue) {
          field.defaultValue(f.defaultValue);
        } else {
          // TODO: Handle default values when one used to be set and now is not
        }

        field.validations(f.validations ?? []);

        if (f.linkType) {
          field.linkType(f.linkType);
        }

        if (f.allowedResources) {
          field.allowedResources(f.allowedResources);
        } else {
          // TODO
        }
      }
    }

    model.contentModel?.fields.forEach((field) => {
      if (!m.fields.some((f) => f.id === field.id)) {
        console.log(`Omitting and disabling field: ${field.id}`);
        const omittedField = model.contentType.editField(field.id);
        omittedField.required(false).omitted(true).disabled(true);
      }
    });

    if (m.configureEntryEditors) {
      model.contentType.configureEntryEditors(m.configureEntryEditors);
    }

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
};
