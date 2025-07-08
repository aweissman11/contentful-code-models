import {
  CreateContentTypeProps,
  EditorInterfaceProps,
  ContentFields,
  KeyValueMap,
} from "contentful-management";

export type ContentModel = Omit<CreateContentTypeProps, "fields"> & {
  sys: {
    id: string;
  };
  fields: ContentFields<KeyValueMap>[];
  editorInterface?: Omit<EditorInterfaceProps, "sys">;
};
