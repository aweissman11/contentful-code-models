import { ContentModel } from "../types";

export const landingPage: ContentModel = {
  id: "landingPage",
  name: "Landing Page",
  description: "Content type for landing pages.",
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
      required: false,
      localized: false,
      id: "title",
      name: "Title",
      type: "RichText",
      validations: [
        {
          enabledNodeTypes: [],
        },
        {
          enabledMarks: ["bold", "italic", "underline"],
        },
      ],
    },
    {
      omitted: false,
      disabled: false,
      required: true,
      localized: false,
      id: "slug",
      name: "Slug",
      type: "Symbol",
      validations: [
        {
          unique: true,
          message: "This slug must be unique across the site.",
        },
      ],
    },
    {
      omitted: false,
      disabled: false,
      required: false,
      localized: false,
      linkType: "Entry",
      id: "hero",
      name: "Hero",
      type: "Link",
      validations: [
        {
          linkContentType: ["simpleHero"],
        },
      ],
    },
    {
      omitted: false,
      disabled: false,
      required: false,
      localized: false,
      id: "modules",
      name: "Modules",
      type: "Array",
      validations: [],
    },
  ],
};
