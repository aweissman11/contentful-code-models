import type { IFieldOptions } from "contentful-migration";

export const stylesOnlyRichText: IFieldOptions = {
  type: "RichText",
  required: false,
  validations: [
    {
      enabledNodeTypes: [],
    },
    {
      enabledMarks: ["bold", "italic", "underline"],
    },
  ],
  localized: false,
  disabled: false,
  omitted: false,
};
