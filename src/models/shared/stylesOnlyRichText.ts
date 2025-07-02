import { ContentFields, KeyValueMap } from "contentful-management";

export const stylesOnlyRichText: ContentFields<KeyValueMap> = {
  id: "text",
  name: "Text",
  type: "RichText",
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
  required: false,
};
