import type { ContentModel } from "../types";

export const fiftyFifty: ContentModel = {
  sys: {
    id: "fiftyFifty",
  },
  name: "Fifty Fifty",
  description:
    "Content type for a fifty fifty section with a title and subtitle.",
  displayField: "internalTitle",
  fields: [
    {
      omitted: false,
      disabled: false,
      required: true,
      localized: false,
      id: "internalTitle",
      name: "Internal Title",
      type: "Symbol",
      validations: [],
    },
    {
      omitted: false,
      disabled: false,
      required: true,
      localized: false,
      linkType: "Entry",
      id: "content",
      name: "Content",
      type: "Link",
      validations: [
        {
          linkContentType: ["generalContent"],
        },
      ],
    },
    {
      id: "orientation",
      name: "Orientation",
      type: "Symbol",
      omitted: false,
      disabled: false,
      required: true,
      localized: false,
      defaultValue: {
        "en-US": "Image left",
      },
      validations: [
        {
          in: ["Image left", "Image right"],
        },
      ],
    },
    {
      id: "mobileOrientation",
      name: "Mobile Orientation",
      type: "Symbol",
      omitted: false,
      disabled: false,
      required: true,
      localized: false,
      defaultValue: {
        "en-US": "Image top",
      },
      validations: [
        {
          in: ["Image top", "Image bottom"],
        },
      ],
    },
  ],
  editorInterface: {
    editor: {
      settings: {
        fieldId: "heroType",
      },
      widgetId: "dropdown",
      widgetNamespace: "editor-builtin",
    },
    controls: [],
  },
};
