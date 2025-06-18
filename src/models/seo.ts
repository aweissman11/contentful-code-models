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
  configureEntryEditors: [
    {
      widgetNamespace: "editor-builtin",
      widgetId: "singleLine",
      settings: {
        fieldId: "title",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "markdown",
      settings: {
        fieldId: "description",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "markdown",
      settings: {
        fieldId: "ogDescription",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "assetLinkEditor",
      settings: {
        fieldId: "image",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "singleLine",
      settings: {
        fieldId: "canonicalUrl",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "boolean",
      settings: {
        fieldId: "noIndex",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "boolean",
      settings: {
        fieldId: "noFollow",
      },
    },
  ],
};
