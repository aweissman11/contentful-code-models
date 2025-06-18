# Contentful Config Code

A way to manage your contentful content types and models through code.

## Installation

`npm install --save-dev contentful-config-code`

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
