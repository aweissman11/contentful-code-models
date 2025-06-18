import type { Field, FieldType } from "contentful-migration";

export const createOrEditField = async ({
  parent,
  fieldId,
  name,
  type,
}: {
  parent: FullModel;
  fieldId: string;
  name: string;
  type: FieldType;
}): Promise<Field> => {
  const fieldExists = parent.contentModel?.fields.some(
    (field: ContentField) => field.id === fieldId,
  );

  if (fieldExists) {
    return parent.contentType.editField(fieldId).name(name);
  } else {
    return parent.contentType.createField(fieldId).name(name).type(type);
  }
};
