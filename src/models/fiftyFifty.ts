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
        fieldId: "orientation",
        widgetId: "dropdown",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "mobileOrientation",
        widgetId: "dropdown",
        widgetNamespace: "builtin",
      },
    ],
    editors: [
      {
        settings: {},
        widgetId: "tags-editor",
        widgetNamespace: "editor-builtin",
      },
      {
        disabled: true,
        widgetId: "default-editor",
        widgetNamespace: "editor-builtin",
      },
    ],
  },
};
