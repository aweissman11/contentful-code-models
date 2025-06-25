# Contentful Code Models

A way to manage your contentful content types and models through code.

## Installation

`npm install --save-dev contentful-code-models`

## Overview

There are two main ways to use this library.

First, you can pull down an existing contentful package and sync it into your current repository. This is done by using the `syncContentfulToLocal` function.

Second, you can use this library to manage your contentful configuration in your codebase. This is similar to how other CMS's might manage their content models (think Sanity, or Payload, etc).

Models look something like this, but look through the models directory in this package for more thorough examples:

```typescript
import { complexRichText } from "./shared/complexRichText.js";
import { stylesOnlyRichText } from "./shared/stylesOnlyRichText.js";

export const generalContent: ContentModel = {
  id: "generalContent",
  name: "General Content!",
  description: "Content type for general content blocks.",
  displayField: "internalTitle",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      validations: [],
    },
    {
      id: "body",
      type: "RichText",
      required: false,
      validations: [
        {
          enabledNodeTypes: [],
        },
        {
          enabledMarks: ["bold", "italic", "underline"],
        },
      ],
    },
  ],
};
```

This library relies on two packages from contentful: [contentful-management](https://www.npmjs.com/package/contentful-management) and [contentful-migration](https://www.npmjs.com/package/contentful-migration).

## Syncing from contentful

```typescript
import { syncContentfulToLocal } from "../utils/syncContentfulToLocal.js";

syncContentfulToLocal({
  modelsBasePath: "./src/models",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  spaceId: process.env.CONTENTFUL_SPACE_ID!,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID ?? "master",
})
  .then(() => {
    console.log("Sync completed successfully.");
  })
  .catch((error) => {
    console.error("Sync failed:", error);
  });
```

## Migrating from a local configuration to contentful

```typescript
import "dotenv/config";
import { models } from "../models";
import { AsyncMigrationFunction } from "../types";
import { runMigrations } from "../utils";

export const migrationFunction: AsyncMigrationFunction = async ({
  models,
  migration,
  context,
}): Promise<void> => {
  console.log("Running migration function...");

  // migration functions go here. This might be somewhere you manipulate data like taking a field that was previously plain text and converting it to rich text format. See the contentful-migration documentation for how to transformEntries
  const modelIds = models?.map((m) => m.id);
  console.log("Models to migrate:", modelIds);
};

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT!,
  yes: true,
  migrationFunction,
};

runMigrations({
  models,
  options,
})
  .then(() => {
    console.log("Migration completed successfully.");
  })
  .catch((error) => {
    console.error("Migration failed:", error);
  });
```

## Notes

- Running the sync command would override the use of the shared content model objects. So `generalContent` will no longer reference the two types of rich text. That being said, the way they are set up now will work fine for migrate.
- If you need to sync down the models from contentful, be careful what's committed and migrated back up

## TODOS:

- [x] ~~Don't delete fields, just omit them from the API response~~ [06-16-25]
- [x] ~~Needs an onboarding process to take an existing Contentful space and turn it into config objects~~ [06-17-25]
- [x] ~~Field Movement~~ [06-16-25]
- [ ] Locales
- [ ] Write tests
- [ ] LATER
  - [ ] Content Type editor interfaces
  - [ ] Content Type annotations??
  - [ ] Generate types from the model files
  - [ ] Full delete of a field?? Maybe this just goes in a migration script rather than the config model
- [ ] Fix regex flags in sync. We're getting null sometimes and that doesn't type match
