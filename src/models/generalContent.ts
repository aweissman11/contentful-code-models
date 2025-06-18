import { complexRichText } from "./shared/complexRichText.js";
import { stylesOnlyRichText } from "./shared/stylesOnlyRichText.js";

export const generalContent: ContentModel = {
  id: "generalContent",
  name: "General Content!",
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
      id: "pretext",
      name: "Pretext",
      ...stylesOnlyRichText,
    },
    {
      id: "title",
      name: "Title",
      ...stylesOnlyRichText,
    },
    {
      id: "body",
      name: "Body",
      ...complexRichText,
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
  configureEntryEditors: [
    {
      widgetNamespace: "editor-builtin",
      widgetId: "singleLine",
      settings: {
        fieldId: "internalTitle",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "richTextEditor",
      settings: {
        fieldId: "title",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "richTextEditor",
      settings: {
        fieldId: "pretext",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "richTextEditor",
      settings: {
        fieldId: "body",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "assetLinkEditor",
      settings: {
        fieldId: "asset",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "entryLinkEditor",
      settings: {
        fieldId: "cta",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "entryLinkEditor",
      settings: {
        fieldId: "link",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "assetLinkEditor",
      settings: {
        fieldId: "image",
      },
    },
  ],
};
