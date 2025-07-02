# Contentful Code Models

A TypeScript library for managing Contentful content types and models through code, enabling version control, code reviews, and programmatic content model management.

## 🚀 Features

- **Code-First Approach**: Define your Contentful content models in TypeScript
- **Bi-directional Sync**: Pull existing models from Contentful or push local models to Contentful
- **Migration Support**: Run complex data migrations with full TypeScript support
- **Type Safety**: Full TypeScript definitions for all content model properties
- **Editor Interface Support**: Manage field controls and editor layouts
- **Field Validation**: Define and manage field validations in code

## 📦 Installation

```bash
npm install --save-dev contentful-code-models
```

## 🛠️ Setup

### Environment Variables

Create a `.env` file in your project root:

```bash
# Required for both sync and migration operations
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ENVIRONMENT=master

# Required for syncing FROM Contentful (read operations)
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token

# Required for migrating TO Contentful (write operations)
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
```

### TypeScript Configuration

Ensure your `tsconfig.json` supports ES modules:

```json
{
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 📖 Usage

### 1. Syncing FROM Contentful (Pull Existing Models)

Use this when you have existing content types in Contentful and want to manage them through code:

```typescript
import { syncContentfulToLocal } from "contentful-code-models";

await syncContentfulToLocal({
  modelsBasePath: "./src/models", // Where to save model files
  options: {
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    spaceId: process.env.CONTENTFUL_SPACE_ID!,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT || "master",
  },
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
      validations: [
        {
          enabledMarks: ["bold", "italic", "underline", "code"],
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
    },
    {
      id: "tags",
      name: "Tags",
      type: "Array",
      items: {
        type: "Symbol",
      },
    },
  ],
  // Optional: Define editor interface
  editorInterface: {
    controls: [
      {
        fieldId: "title",
        widgetId: "singleLine",
      },
      {
        fieldId: "slug",
        widgetId: "slugEditor",
      },
      {
        fieldId: "content",
        widgetId: "richTextEditor",
      },
      {
        fieldId: "publishDate",
        widgetId: "datePicker",
      },
      {
        fieldId: "tags",
        widgetId: "tagEditor",
      },
    ],
  },
};
```

### 3. Migrating TO Contentful (Push Local Models)

Create a migration script to push your local models to Contentful:

```typescript
// scripts/migrate.ts
import "dotenv/config";
import { runMigrations } from "contentful-code-models";
import { models } from "../src/models"; // Your model definitions

const migrationFunction = async ({ models, migration, context }) => {
  console.log(`Migrating ${models?.length} content types...`);

  // Custom migration logic can go here
  // For example, data transformations when changing field types

  // Example: Transform existing entries when changing a field
  // migration.transformEntries({
  //   contentType: 'blogPost',
  //   from: ['oldField'],
  //   to: ['newField'],
  //   transformEntryForLocale: (fromFields, currentLocale) => ({
  //     newField: fromFields.oldField?.[currentLocale]?.toUpperCase()
  //   })
  // });
};

await runMigrations({
  models,
  options: {
    spaceId: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
    yes: true, // Skip confirmation prompts
    migrationFunction,
  },
});
```

### 4. Advanced Model Composition

You can create reusable field definitions and compose complex models:

```typescript
// src/models/shared/richTextFields.ts
export const basicRichText = {
  type: "RichText" as const,
  validations: [
    {
      enabledMarks: ["bold", "italic"],
      enabledNodeTypes: ["paragraph", "heading-2", "unordered-list"],
    },
  ],
};

export const complexRichText = {
  type: "RichText" as const,
  validations: [
    {
      enabledMarks: ["bold", "italic", "underline", "code"],
      enabledNodeTypes: [
        "paragraph",
        "heading-1",
        "heading-2",
        "heading-3",
        "unordered-list",
        "ordered-list",
        "blockquote",
        "embedded-entry-block",
        "embedded-asset-block",
      ],
    },
  ],
};

// src/models/article.ts
import { basicRichText } from "./shared/richTextFields";

export const article: ContentModel = {
  sys: { id: "article" },
  name: "Article",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
    },
    {
      id: "summary",
      name: "Summary",
      ...basicRichText,
    },
    // ... other fields
  ],
};
```

## 🔧 API Reference

### `syncContentfulToLocal(options)`

Pulls content types from Contentful and generates local TypeScript model files.

**Parameters:**

- `modelsBasePath?: string` - Directory to save model files (default: `process.cwd()`)
- `options.accessToken: string` - Contentful Management API token
- `options.spaceId: string` - Contentful space ID
- `options.environmentId: string` - Contentful environment ID

**Returns:** `Promise<PlainClientAPI>` - The Contentful management client instance

### `runMigrations(options)`

Pushes local content models to Contentful and runs migrations.

**Parameters:**

- `models: ContentModel[]` - Array of content model definitions
- `options.spaceId: string` - Contentful space ID
- `options.accessToken: string` - Contentful Management API token
- `options.environmentId: string` - Contentful environment ID
- `options.yes?: boolean` - Skip confirmation prompts
- `options.migrationFunction?: Function` - Custom migration logic

## 🎯 Best Practices

### 1. Project Structure

```
src/
├── models/
│   ├── shared/           # Reusable field definitions
│   │   ├── richText.ts
│   │   └── validation.ts
│   ├── blogPost.ts
│   ├── author.ts
│   └── index.ts         # Export all models
├── scripts/
│   ├── sync.ts          # Sync from Contentful
│   └── migrate.ts       # Migrate to Contentful
```

### 2. Model Organization

- Keep shared field definitions in a `shared/` directory
- Use descriptive names for content type IDs
- Include comprehensive field validations
- Document complex field relationships

### 3. Migration Strategy

- Always test migrations in a development environment first
- Use semantic versioning for migration scripts
- Keep migration functions focused and atomic
- Back up your Contentful space before major migrations

### 4. Version Control

- Commit all model files to version control
- Use meaningful commit messages for model changes
- Review model changes through pull requests
- Tag releases when pushing to production

## 🚨 Important Notes

- **Sync vs Migration**: Syncing pulls FROM Contentful and overwrites local files. Migration pushes TO Contentful and may overwrite remote content types.
- **Field Deletion**: Fields are omitted rather than deleted to prevent data loss. Use migration scripts for explicit field removal.
- **Environment Safety**: Always test in development environments before applying to production.
- **Backup Strategy**: Consider backing up your Contentful space before running migrations.

## 🐛 Troubleshooting

### Common Issues

**TypeScript Errors**: Ensure your TypeScript configuration supports ES modules and the latest syntax features.

**Authentication Errors**: Verify your management token has the correct permissions and hasn't expired.

**Field Validation Errors**: Check that field validations match Contentful's validation schema exactly.

**Migration Failures**: Review the migration logs and ensure your local models are valid before attempting to migrate.

## �️ Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/aweissman11/contentful-code-models.git
cd contentful-code-models
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables by copying `.env.example` to `.env` and filling in your Contentful credentials.

### Available Scripts

- `npm test` - Run the test suite
- `npm run test:coverage` - Run tests with coverage report
- `npm run dev` - Run tests in watch mode
- `npm run format` - Format code with Prettier
- `npm run check-format` - Check code formatting
- `npm run build` - Build the package for distribution
- `npm run precommit` - Run formatting and tests (used by pre-commit hook)

### Pre-commit Hooks

This project uses [Husky](https://typicode.github.io/husky/) to run pre-commit hooks that ensure code quality:

1. **Code Formatting**: Automatically formats code with Prettier
2. **Test Coverage**: Runs the full test suite with coverage requirements
   - Functions: 95% coverage required
   - Lines/Statements/Branches: 85% coverage required

The pre-commit hook will:

- Format your code automatically
- Run all tests with coverage
- Prevent commits if tests fail or coverage drops below thresholds
- Prevent commits if formatting changes files (you'll need to stage the formatted files)

### Test Coverage

The project maintains high test coverage focused on the `src/utils` directory:

- **Current Coverage**: ~89% statements, ~90% branches, 100% functions
- **Coverage Reports**: Available in `coverage/` directory after running `npm run test:coverage`
- **Focused Testing**: Only utils directory is included in coverage reports

### Code Quality

- **TypeScript**: Strict type checking enabled
- **Prettier**: Consistent code formatting
- **Vitest**: Modern testing framework with coverage reporting
- **ESLint**: Code linting (configured via package.json)

## �📝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

MIT License - see LICENSE file for details.

```

## 📋 Roadmap

### Completed ✅
- [x] Field omission instead of deletion (prevents data loss)
- [x] Onboarding process for existing Contentful spaces
- [x] Field movement and reordering
- [x] Comprehensive test suite

### In Progress 🚧
- [ ] Locale management and internationalization
- [ ] Enhanced field validation patterns

### Future Features 🔮
- [ ] Content type editor interface customization
- [ ] Content type annotations and metadata
- [ ] Automatic TypeScript type generation from models
- [ ] Advanced field deletion with safety checks
- [ ] Visual model editor and diff viewer
```
