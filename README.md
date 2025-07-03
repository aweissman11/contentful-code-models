# Contentful Code Models

A TypeScript library for managing Contentful content types and models through code, enabling version control, code reviews, and programmatic content model management.

## 🚀 Features

- **Code-First Approach**: Define your Contentful content models in TypeScript
- **Bi-directional Sync**: Pull existing models from Contentful or push local models to Contentful
- **Migration Support**: Run complex data migrations with full TypeScript support

## ⚙️ Development: Full TypeScript definitions for all content model properties

- **Editor Interface Support**: Manage field controls and editor layouts
- **Field Validation**: Define and manage field validations in code

## 📦 Installation

```bash
npm install --save-dev contentful-code-models
```

## 📖 Usage

### 1. Syncing FROM Contentful (Pull Existing Models)

Use this when you have existing content types in Contentful and want to manage them through code:

```typescript
// scripts/sync.ts
import "dotenv/config";
import { syncContentfulToLocal } from "contentful-code-models";

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
};

syncContentfulToLocal({
  modelsBasePath: "./src/models", // Optional param where to save model files
  options,
})
  .then(() => {
    console.log("Sync completed successfully.");
  })
  .catch((error) => {
    console.error("Sync failed:", error);
    process.exit(1);
  });
```

This will:

- Create TypeScript files for each content type in your specified directory
- Include all field definitions, validations, and editor interface settings
- Generate an `index.ts` file that exports all models as an array

### 2. Creating Models in Code

Define your content models using TypeScript:

```typescript
// src/models/blogPost.ts
import type { ContentModel } from "contentful-code-models";

export const blogPost: ContentModel = {
  sys: {
    id: "blogPost",
  },
  name: "Blog Post",
  description: "A blog post content type",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
      localized: false,
      omitted: false,
      disabled: false,
      validations: [
        {
          size: { max: 100 },
        },
      ],
    },
    {
      id: "slug",
      name: "URL Slug",
      type: "Symbol",
      required: true,
      localized: false,
      omitted: false,
      disabled: false,
      validations: [
        {
          regexp: {
            pattern: "^[a-z0-9-]+$",
            flags: "i",
          },
        },
      ],
    },
    {
      id: "content",
      name: "Content",
      type: "RichText",
      required: true,
      localized: false,
      omitted: false,
      disabled: false,
      validations: [
        {
          enabledMarks: ["bold", "italic", "underline", "code"],
        },
        {
          enabledNodeTypes: [
            "heading-1",
            "heading-2",
            "heading-3",
            "paragraph",
            "unordered-list",
            "ordered-list",
          ],
        },
      ],
    },
    {
      id: "publishDate",
      name: "Publish Date",
      type: "Date",
      required: true,
      localized: false,
      omitted: false,
      disabled: false,
      validations: [],
    },
  ],
  // Optional: Define editor interface
  editorInterface: {
    controls: [
      {
        fieldId: "title",
        widgetId: "singleLine",
        widgetNamespace: "editor-builtin",
      },
      {
        fieldId: "slug",
        widgetId: "slugEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        fieldId: "content",
        widgetId: "richTextEditor",
        widgetNamespace: "editor-builtin",
      },
      {
        fieldId: "publishDate",
        widgetId: "datePicker",
        widgetNamespace: "editor-builtin",
      },
    ],
  },
};
```

### 3. Migrating TO Contentful (Push Local Models)

Push your local models to Contentful using the sync function:

```typescript
// scripts/migrate.ts
import "dotenv/config";
import { syncModelsToContentful } from "contentful-code-models";
import { models } from "../src/models"; // Your model definitions

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
};

syncModelsToContentful({
  models,
  options,
})
  .then((client) => {
    console.log("Migration completed successfully.");
    console.log("Client ready for further operations:", client);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
```

The `syncModelsToContentful` function will:

- Create new content types that don't exist
- Update existing content types with your local changes
- Preserve existing fields by omitting them instead of deleting
- Update editor interface configurations
- Handle field reordering and validation updates

### 4. Advanced Model Composition

You can create reusable field definitions and compose complex models:

```typescript
// src/models/shared/richTextFields.ts
export const basicRichText = {
  type: "RichText" as const,
  required: false,
  localized: false,
  omitted: false,
  disabled: false,
  validations: [
    {
      enabledMarks: ["bold", "italic"],
    },
    {
      enabledNodeTypes: ["paragraph", "heading-2", "unordered-list"],
    },
  ],
};

export const complexRichText = {
  type: "RichText" as const,
  required: false,
  localized: false,
  omitted: false,
  disabled: false,
  validations: [
    {
      enabledMarks: ["bold", "italic", "underline", "code"],
    },
    {
      enabledNodeTypes: [
        "paragraph",
        "heading-1",
        "heading-2",
        "heading-3",
        "unordered-list",
        "ordered-list",
        "blockquote",
        "embedded-entry-block",
      ],
    },
  ],
};

// Usage in a content model
// src/models/article.ts
import { ContentModel } from "contentful-code-models";
import { complexRichText } from "./shared/richTextFields";

export const article: ContentModel = {
  sys: { id: "article" },
  name: "Article",
  description: "Long-form article content",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
      localized: false,
      omitted: false,
      disabled: false,
      validations: [],
    },
    {
      ...complexRichText,
      id: "body",
      name: "Body Content",
    },
  ],
};
```

### 5. Package Scripts Integration

Add these scripts to your `package.json` for easy development workflow:

```json
{
  "scripts": {
    "content:sync": "tsx ./scripts/sync.ts",
    "content:migrate": "tsx ./scripts/migrate.ts",
    "content:format": "npm run content:sync && npm run format"
  }
}
```

Usage:

- `npm run content:sync` - Pull models from Contentful to local files
- `npm run content:migrate` - Push local models to Contentful
- `npm run content:format` - Sync and format in one command

## 🔧 Field Types & Validation

This library supports all Contentful field types with comprehensive validation options:

### Supported Field Types

- **Symbol**: Short text fields (max 256 characters)
- **Text**: Long text fields
- **RichText**: Structured rich content with markdown-like formatting
- **Integer**: Whole numbers
- **Number**: Decimal numbers
- **Date**: Date values
- **Boolean**: True/false values
- **Location**: Geographic coordinates
- **JSON**: Arbitrary JSON objects
- **Link**: References to other entries or assets
- **Array**: Lists of other field types

### Validation Examples

```typescript
// Text length validation
{
  id: "title",
  name: "Title",
  type: "Symbol",
  validations: [
    { size: { min: 1, max: 100 } }
  ]
}

// Pattern validation
{
  id: "slug",
  name: "URL Slug",
  type: "Symbol",
  validations: [
    {
      regexp: {
        pattern: "^[a-z0-9-]+$",
        flags: "i"
      }
    }
  ]
}

// Rich text validation
{
  id: "content",
  name: "Content",
  type: "RichText",
  validations: [
    {
      enabledMarks: ["bold", "italic", "underline"],
      enabledNodeTypes: ["paragraph", "heading-2", "unordered-list"]
    }
  ]
}

// Link validation
{
  id: "relatedPost",
  name: "Related Post",
  type: "Link",
  linkType: "Entry",
  validations: [
    { linkContentType: ["blogPost", "article"] }
  ]
}
```

## 🏗️ Best Practices

### Model Organization

- **Use descriptive IDs**: Content type IDs should be camelCase and descriptive
- **Group related models**: Organize models in directories by feature or content area
- **Shared field definitions**: Create reusable field configurations in a `shared/` directory
- **Consistent naming**: Use consistent field naming across content types

### Development Workflow

1. **Start with sync**: Pull existing models from Contentful using `npm run content:sync`
2. **Make changes locally**: Edit the generated TypeScript files
3. **Test changes**: Use a development environment first
4. **Migrate**: Push changes with `npm run content:migrate`
5. **Version control**: Commit model changes like any other code

### Field Management

- **Never delete fields directly**: The library automatically omits fields instead of deleting them to prevent data loss
- **Use field validation**: Define comprehensive validation rules to ensure content quality
- **Test migrations**: Always test model changes in a development space first
- **Document changes**: Use descriptive commit messages for model changes

## 🔧 API Reference

### `syncContentfulToLocal(options)`

Pulls content types from Contentful and generates local TypeScript model files.

**Parameters:**

- `modelsBasePath?: string` - Directory to save model files (default: `process.cwd()`)
- `options.accessToken: string` - Contentful Management API token
- `options.spaceId: string` - Contentful space ID
- `options.environmentId: string` - Contentful environment ID

**Returns:** `Promise<PlainClientAPI>` - The Contentful management client instance

### `syncModelsToContentful(options)`

Pushes local content models to Contentful.

**Parameters:**

- `models: ContentModel[]` - Array of content model definitions
- `options.accessToken: string` - Contentful Management API token
- `options.spaceId: string` - Contentful space ID
- `options.environmentId: string` - Contentful environment ID

**Returns:** `Promise<PlainClientAPI>` - The Contentful management client instance

## 🚨 Important Notes

- **Sync vs Migration**: Syncing pulls FROM Contentful and overwrites local files. Migration pushes TO Contentful and may overwrite remote content types.
- **Field Deletion**: Fields are omitted rather than deleted to prevent data loss. Use migration scripts for explicit field removal.
- **Environment Safety**: Always test in development environments before applying to production.
- **Backup Strategy**: Consider backing up your Contentful space before running migrations.

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors**: Verify your management token has the correct permissions and hasn't expired.

**Field Validation Errors**: Check that field validations match Contentful's validation schema exactly.

## �️ Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Getting Started

1. Install

```bash
npm install --save-dev contentful-code-models
```

2. Set up your environment variables by copying `.env.example` to `.env` and filling in your Contentful credentials.

```
CONTENTFUL_SPACE_ID=""
CONTENTFUL_ENVIRONMENT=""
CONTENTFUL_MANAGEMENT_TOKEN=""
```

3. Set up a script runner for sync/migrate depending on you use case.
   - See above for examples

## 🤝 Contributing

Contributions are welcome!

## 📄 License

MIT License - see LICENSE file for details.

```

## 📋 Roadmap

### Completed ✅
- [x] Field omission instead of deletion (prevents data loss)
- [x] Onboarding process for existing Contentful spaces
- [x] Field movement and reordering
- [x] Comprehensive test suite
- [x] Pre-commit hooks with code formatting and test coverage
- [x] Bi-directional sync (Contentful ↔ Local)
- [x] Editor interface management

### In Progress 🚧
- [ ] CLI tools and commands
- [ ] Locale management and internationalization
- [ ] Integrated content migration utilities (eg plain => rich text conversion)

### High Priority Features 🚀
- [ ] **TypeScript Type Generation**: Auto-generate TypeScript interfaces from content models
- [ ] **Environment Management**: Multi-environment sync (dev → staging → prod)

### Developer Experience 🛠️
- [ ] **Advanced Migration Features**: Rollback capabilities and conditional migrations
- [ ] **Model Documentation**: Auto-generated docs from content models
- [ ] **Content Validation**: Cross-field validation and data integrity checks
- [ ] **Plugin System**: Custom field types and validation plugins

### Enterprise Features 🏢
- [ ] **Multi-Space Management**: Manage multiple Contentful spaces from one interface

### Integration & Automation 🔗
- [ ] **Webhook Integration**: Trigger external workflows on model changes
- [ ] **CI/CD Integration**: Enhanced GitHub Actions and deployment pipelines
- [ ] **Third-party Integrations**: Slack notifications, Jira tickets, etc.

### Quality & Testing 🧪
- [ ] **Integration Testing**: End-to-end tests with real Contentful spaces
- [ ] **Performance Testing**: Load testing for large-scale migrations
- [ ] **Content Model Validation**: Advanced validation rules and testing tools

### Future Vision 🔮
- [ ] **Advanced Rich Text**: Custom rich text configurations and components
- [ ] **Content Localization Tools**: Advanced locale management and translation workflows
- [ ] **Mobile App**: Mobile interface for content model management
```
