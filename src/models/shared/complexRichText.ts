import { ContentFields, KeyValueMap } from "contentful-management";

export const complexRichText: ContentFields<KeyValueMap> = {
  id: "body",
  omitted: false,
  disabled: false,
  required: false,
  localized: false,
  name: "Body",
  type: "RichText",
  validations: [
    {
      enabledMarks: [
        "bold",
        "italic",
        "code",
        "underline",
        "superscript",
        "subscript",
        "strikethrough",
      ],
      message:
        "Only bold, italic, code, underline, superscript, subscript, and strikethrough marks are allowed",
    },
    {
      enabledNodeTypes: [
        "heading-2",
        "heading-3",
        "heading-4",
        "heading-5",
        "heading-6",
        "ordered-list",
        "unordered-list",
        "hr",
        "hyperlink",
        "entry-hyperlink",
        "asset-hyperlink",
      ],
      message:
        "Only heading 2, heading 3, heading 4, heading 5, heading 6, ordered list, unordered list, horizontal rule, link to Url, link to entry, and link to asset nodes are allowed",
    },
    {
      nodes: {
        "asset-hyperlink": [
          {
            size: {
              min: 0,
              max: 5,
            },
            message: null,
          },
        ],
        "embedded-asset-block": [
          {
            size: {
              max: 3,
            },
            message: null,
          },
        ],
        "embedded-entry-block": [
          {
            linkContentType: ["link"],
            message: null,
          },
        ],
        "entry-hyperlink": [
          {
            linkContentType: ["landingPage"],
            message: null,
          },
          {
            size: {
              max: 5,
            },
            message: null,
          },
        ],
      },
    },
  ],
};
