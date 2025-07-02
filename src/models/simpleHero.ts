import { ContentModel } from "../types";

export const simpleHero: ContentModel = {
  id: "simpleHero",
  name: "Simple Hero",
  description:
    "Content type for a simple hero section with a title and subtitle.",
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
      omitted: false,
      disabled: false,
      required: true,
      localized: false,
      defaultValue: {
        "en-US": "simple",
      },
      id: "heroType",
      name: "Hero Type",
      type: "Symbol",
      validations: [
        {
          in: ["simple", "complex"],
        },
      ],
    },
  ],
  editorInterface: {
    editors: [
      {
        settings: {
          fieldId: "internalTitle",
        },
        widgetId: "singleLine",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "content",
        },
        widgetId: "entryLinkEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "heroType",
        },
        widgetId: "dropdown",
        widgetNamespace: "editor-builtin",
      },
    ],
    controls: [
      {
        fieldId: "internalTitle",
        widgetId: "singleLine",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "content",
        widgetId: "entryLinkEditor",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "heroType",
        widgetId: "dropdown!!",
        widgetNamespace: "builtin",
      },
    ],
  },
};
