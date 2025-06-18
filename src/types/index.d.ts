import type Migration from "contentful-migration";
import type {
  BuiltinEditor,
  ContentType,
  IEditorInterfaceOptions,
  IFieldOptions,
} from "contentful-migration";

type TEntryEditor =
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

interface IContentField extends IFieldOptions {
  id: string;
  name: string;
}

type TContentModel = {
  id: string;
  name: string;
  description: string;
  displayField: string | null;
  fields: ContentField[];
  configureEntryEditors?: EntryEditor[];
};

type TFullModel = {
  contentType: ContentType;
  contentModel?: TContentModel | null;
};

type TAsyncMigrationFunction = ({
  models,
  migration,
  context,
}: {
  models?: Array<TContentModel>;
  migration: Migration;
  context: Parameters<MigrationFunction>[1] & MakeRequest;
}) => Promise<void>;

type TCreateOrEditContentTypeFunction = ({
  migration: Migration,
  makeRequest: MakeRequest,
  contentTypeId: string,
  name: string,
}) => Promise<FullModel>;

type TSyncOptions = {
  modelsBasePath?: string;
};

type TSyncContentfulToLocal = (syncOptions?: TSyncOptions) => Promise<void>;

declare global {
  type EntryEditor = TEntryEditor;
  type ContentField = IContentField;
  type ContentModel = TContentModel;
  type FullModel = TFullModel;
  type AsyncMigrationFunction = TAsyncMigrationFunction;
  type CreateOrEditContentTypeFunction = TCreateOrEditContentTypeFunction;
  type SyncOptions = TSyncOptions;
  type SyncContentfulToLocal = TSyncContentfulToLocal;
}
