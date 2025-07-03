import type { ContentModel } from "../types";
import { complexRichText } from "./shared/complexRichText";
import { stylesOnlyRichText } from "./shared/stylesOnlyRichText";

export const generalContent: ContentModel = {
  sys: {
    id: "generalContent",
  },
  name: "General Content",
  description: "Content type for general content blocks.",
  displayField: "internalTitle",
  fields: [
    {
      omitted: false,
      disabled: false,
      required: true,
      localized: false,
      defaultValue: {
        "en-US": "HELLO",
      },
      id: "internalTitle",
      name: "Internal Title",
      type: "Symbol",
      validations: [],
    },
    {
      ...stylesOnlyRichText,
      id: "pretext",
      name: "Pretext",
    },
    {
      ...stylesOnlyRichText,
      id: "title",
      name: "Title",
    },
    {
      ...complexRichText,
      id: "body",
      name: "Body",
    },
    {
      omitted: false,
      disabled: false,
      required: false,
      localized: false,
      linkType: "Asset",
      id: "asset",
      name: "Asset",
      type: "Link",
      validations: [
        {
          linkMimetypeGroup: ["image", "video"],
        },
      ],
    },
    {
      omitted: false,
      disabled: false,
      required: false,
      localized: false,
      linkType: "Entry",
      id: "cta",
      name: "Call to Action",
      type: "Link",
      validations: [
        {
          linkContentType: ["callToAction"],
        },
      ],
    },
    {
      omitted: false,
      disabled: false,
      required: false,
      localized: false,
      linkType: "Entry",
      id: "link",
      name: "Link",
      type: "Link",
      validations: [
        {
          linkContentType: ["link"],
        },
      ],
    },
    {
      omitted: true,
      disabled: true,
      required: false,
      localized: false,
      linkType: "Asset",
      id: "image",
      name: "Image",
      type: "Link",
      validations: [],
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
          fieldId: "title",
        },
        widgetId: "richTextEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "pretext",
        },
        widgetId: "richTextEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "body",
        },
        widgetId: "richTextEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "asset",
        },
        widgetId: "assetLinkEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "cta",
        },
        widgetId: "entryLinkEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "link",
        },
        widgetId: "entryLinkEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "image",
        },
        widgetId: "assetLinkEditor",
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
        fieldId: "title",
        widgetId: "richTextEditor",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "body",
        widgetId: "richTextEditor",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "asset",
        widgetId: "assetLinkEditor",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "cta",
        widgetId: "entryLinkEditor",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "link",
        widgetId: "entryLinkEditor",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "image",
        widgetId: "assetLinkEditor",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "pretext",
        widgetId: "richTextEditor",
        widgetNamespace: "builtin",
      },
    ],
    editorLayout: [
      {
        groupId: "internal",
        name: "Internal Fields",
        items: [
          {
            fieldId: "internalTitle",
          },
        ],
      },
      {
        groupId: "content",
        name: "Content Fields",
        items: [
          {
            fieldId: "title",
          },
          {
            fieldId: "body",
          },
          {
            fieldId: "pretext",
          },
        ],
      },
      {
        groupId: "media",
        name: "Media",
        items: [
          {
            fieldId: "asset",
          },
          {
            fieldId: "cta",
          },
          {
            fieldId: "link",
          },
          {
            fieldId: "image",
          },
        ],
      },
    ],
    groupControls: [
      {
        groupId: "internal",
        widgetId: "topLevelTab",
        widgetNamespace: "builtin",
      },
      {
        groupId: "content",
        widgetId: "topLevelTab",
        widgetNamespace: "builtin",
      },
      {
        groupId: "media",
        widgetId: "topLevelTab",
        widgetNamespace: "builtin",
      },
    ],
  },
};
