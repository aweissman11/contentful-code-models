import type { ContentModel } from "../types";

export const landingPage: ContentModel = {
  sys: {
    id: "landingPage",
  },
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
      id: "seo",
      name: "SEO",
      type: "Link",
      validations: [
        {
          linkContentType: ["seo"],
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
      items: {
        type: "Link",
        validations: [
          {
            linkContentType: ["fiftyFifty"],
          },
        ],
        linkType: "Entry",
      },
      validations: [],
    },
  ],
  editorInterface: {
    controls: [
      {
        fieldId: "internalTitle",
      },
      {
        fieldId: "slug",
      },
      {
        fieldId: "modules",
      },
      {
        fieldId: "hero",
      },
    ],
  },
};
