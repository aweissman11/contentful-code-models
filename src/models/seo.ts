import { ContentModel } from "../types";

export const seo: ContentModel = {
  id: "seo",
  name: "SEO",
  description: "Metadata for Search Engine Optimization",
  displayField: "title",
  fields: [
    {
      omitted: false,
      disabled: false,
      required: true,
      localized: true,
      id: "title",
      name: "Title",
      type: "Symbol",
      validations: [],
    },
    {
      omitted: false,
      disabled: false,
      required: true,
      localized: true,
      id: "description",
      name: "Description",
      type: "Text",
      validations: [],
    },
    {
      omitted: false,
      disabled: false,
      required: false,
      localized: true,
      id: "ogDescription",
      name: "OG Description",
      type: "Text",
      validations: [],
    },
    {
      omitted: false,
      disabled: false,
      required: true,
      localized: true,
      linkType: "Asset",
      id: "image",
      name: "Image",
      type: "Link",
      validations: [],
    },
    {
      omitted: false,
      disabled: false,
      required: false,
      localized: true,
      id: "canonicalUrl",
      name: "Canonical URL",
      type: "Symbol",
      validations: [
        {
          unique: true,
          message: "This URL must be unique across the site.",
        },
      ],
    },
    {
      omitted: false,
      disabled: false,
      required: false,
      localized: false,
      id: "noIndex",
      name: "No Index",
      type: "Boolean",
      validations: [],
    },
    {
      omitted: false,
      disabled: false,
      required: false,
      localized: false,
      id: "noFollow",
      name: "No Follow",
      type: "Boolean",
      validations: [],
    },
  ],
  editorInterface: {
    editors: [
      {
        settings: {
          fieldId: "title",
        },
        widgetId: "singleLine",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "description",
        },
        widgetId: "markdown",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "ogDescription",
        },
        widgetId: "markdown",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "image",
        },
        widgetId: "assetLinkEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "canonicalUrl",
        },
        widgetId: "singleLine",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "noIndex",
        },
        widgetId: "boolean",
        widgetNamespace: "editor-builtin",
      },
      {
        settings: {
          fieldId: "noFollow",
        },
        widgetId: "boolean",
        widgetNamespace: "editor-builtin",
      },
    ],
    controls: [
      {
        fieldId: "title",
        widgetId: "singleLine",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "description",
        widgetId: "markdown",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "ogDescription",
        widgetId: "markdown",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "image",
        widgetId: "assetLinkEditor",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "canonicalUrl",
        widgetId: "singleLine",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "noIndex",
        widgetId: "boolean",
        widgetNamespace: "builtin",
      },
      {
        fieldId: "noFollow",
        widgetId: "boolean",
        widgetNamespace: "builtin",
      },
    ],
  },
};
