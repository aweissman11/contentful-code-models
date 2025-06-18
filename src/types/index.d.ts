import type Migration from "contentful-migration";
import type {
  BuiltinEditor,
  ContentType,
  IEditorInterfaceOptions,
  IFieldOptions,
} from "contentful-migration";

export type EntryEditor =
  | {
      widgetNamespace: "builtin";
      widgetId: BuiltinEditor;
      settings?: IEditorInterfaceOptions;
    }
  | {
      widgetNamespace: "editor-builtin" | "extension" | "app";
      widgetId: string;
      settings?: IEditorInterfaceOptions;
    };

export interface ContentField extends IFieldOptions {
  id: string;
  name: string;
}

export type ContentModel = {
  id: string;
  name: string;
  description: string;
  displayField: string | null;
  fields: ContentField[];
  configureEntryEditors?: EntryEditor[];
};

export type FullModel = {
  contentType: ContentType;
  contentModel?: ContentModel | null;
};

export type AsyncMigrationFunction = ({
  models,
  migration,
  context,
}: {
  models?: ContentModel[];
  migration: Migration;
  context: Parameters<MigrationFunction>[1] & MakeRequest;
}) => Promise<void>;

export type CreateOrEditContentTypeFunction = ({
  migration: Migration,
  makeRequest: MakeRequest,
  contentTypeId: string,
  name: string,
}) => Promise<FullModel>;

export type SyncOptions = {
  modelsBasePath?: string;
  accessToken: string;
  spaceId: string;
  environmentId: string;
};

export type SyncContentfulToLocalFunction = (
  syncOptions?: SyncOptions,
) => Promise<void>;

export type RunMigrationConfigWithAsync = Omit<
  RunMigrationConfig,
  "migrationFunction"
> & {
  migrationFunction?: AsyncMigrationFunction;
};
