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
      widgetId: "entryLinkEditor",
      settings: {
        fieldId: "content",
      },
    },
    {
      widgetNamespace: "editor-builtin",
      widgetId: "dropdown",
      settings: {
        fieldId: "heroType",
      },
    },
  ],
};
