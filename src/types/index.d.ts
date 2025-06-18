import type Migration from "contentful-migration";
import type {
  BuiltinEditor,
  ContentType,
  IEditorInterfaceOptions,
  IFieldOptions,
} from "contentful-migration";

type EntryEditor =
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

interface ContentField extends IFieldOptions {
  id: string;
  name: string;
}

type ContentModel = {
  id: string;
  name: string;
  description: string;
  displayField: string | null;
  fields: ContentField[];
  configureEntryEditors?: EntryEditor[];
};

type FullModel = {
  contentType: ContentType;
  contentModel?: ContentModel | null;
};

type AsyncMigrationFunction = ({
  models,
  migration,
  context,
}: {
  models?: ContentModel[];
  migration: Migration;
  context: Parameters<MigrationFunction>[1] & MakeRequest;
}) => Promise<void>;

type CreateOrEditContentTypeFunction = ({
  migration: Migration,
  makeRequest: MakeRequest,
  contentTypeId: string,
  name: string,
}) => Promise<FullModel>;

type SyncOptions = {
  modelsBasePath?: string;
};

type SyncContentfulToLocal = (syncOptions?: SyncOptions) => Promise<void>;
