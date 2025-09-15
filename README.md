# Contentful Code Models

A TypeScript library for managing Contentful content types through code, enabling version control and programmatic content model management.

## 🚀 Features

- **Code-First Approach**: Define Contentful content models in TypeScript
- **Bi-directional Sync**: Pull existing models from Contentful or push local models to Contentful
- **Safe Trial Migrations**: Test changes in isolated temporary environments
- **CLI & Programmatic APIs**: Use via command line or integrate into scripts
- **Full TypeScript Support**: Complete type definitions for all content model properties

## 📦 Installation

```bash
npm install --save-dev contentful-code-models
```

## 🖥️ CLI Usage

```bash
# Pull models from Contentful to local files
npx contentful-code-models sync --output ./src/models

# Push local models to Contentful
npx contentful-code-models migrate --models ./src/models

# Test changes in a temporary environment
npx contentful-code-models trial --models ./src/models
```

### Environment Variables

Create a `.env` file:

```bash
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
CONTENTFUL_ENVIRONMENT=master
```

## 📖 Programmatic Usage

### Sync from Contentful

```typescript
import { syncToLocal } from "contentful-code-models";

await syncToLocal({
  modelsBasePath: "./src/models",
  options: {
    spaceId: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
  },
});
```

### Define Models in Code

```typescript
import type { ContentModel } from "contentful-code-models";

export const blogPost: ContentModel = {
  sys: { id: "blogPost" },
  name: "Blog Post",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
      validations: [{ size: { max: 100 } }],
    },
    {
      id: "content",
      name: "Content",
      type: "RichText",
      required: true,
      validations: [
        {
          enabledMarks: ["bold", "italic"],
          enabledNodeTypes: ["paragraph", "heading-2"],
        },
      ],
    },
  ],
};
```

### Migrate to Contentful

```typescript
import { migrateConfig } from "contentful-code-models";
import { models } from "./src/models";

await migrateConfig({
  models,
  options: {
    spaceId: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
  },
});
```

### Trial Migration

```typescript
import { trialMigration } from "contentful-code-models";

const report = await trialMigration({
  options: {
    spaceId: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    environmentId: "master",
  },
  modelsPath: "./src/models",
});

console.log(report);
// Remember to manually delete trial environment
```

## 🔧 Field Types & Validation

### Supported Field Types

- **Symbol**: Short text (max 256 characters)
- **Text**: Long text
- **RichText**: Structured rich content
- **Integer** / **Number**: Numeric values
- **Date**: Date values
- **Boolean**: True/false
- **Location**: Geographic coordinates
- **JSON**: Arbitrary JSON objects
- **Link**: References to entries or assets
- **Array**: Lists of other field types

### Validation Examples

```typescript
// Text length validation
{
  id: "title",
  name: "Title",
  type: "Symbol",
  validations: [{ size: { min: 1, max: 100 } }]
}

// Pattern validation
{
  id: "slug",
  name: "URL Slug",
  type: "Symbol",
  validations: [
    { regexp: { pattern: "^[a-z0-9-]+$", flags: "i" } }
  ]
}

// Link validation
{
  id: "relatedPost",
  name: "Related Post",
  type: "Link",
  linkType: "Entry",
  validations: [{ linkContentType: ["blogPost"] }]
}
```

## 🔧 API Reference

### `syncToLocal(options)`

Pulls content types from Contentful and generates local TypeScript model files.

**Parameters:**

- `modelsBasePath?: string` - Directory to save model files
- `options.accessToken: string` - Contentful Management API token
- `options.spaceId: string` - Contentful space ID
- `options.environmentId: string` - Contentful environment ID

### `migrateConfig(options)`

Pushes local content models to Contentful.

**Parameters:**

- `models: ContentModel[]` - Array of content model definitions
- `options.accessToken: string` - Contentful Management API token
- `options.spaceId: string` - Contentful space ID
- `options.environmentId: string` - Contentful environment ID

### `trialMigration(options)`

Creates a temporary environment and performs a real migration to test changes safely.

**Parameters:**

- `options.accessToken: string` - Contentful Management API token
- `options.spaceId: string` - Contentful space ID
- `options.environmentId: string` - Base environment ID to copy from
- `modelsPath: string` - Path to local models directory

**Returns:** `Promise<string>` - Trial report with migration results

## 📄 License

MIT License - see LICENSE file for details.
