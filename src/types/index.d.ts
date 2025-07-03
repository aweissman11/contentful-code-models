import {
  ContentFields,
  EditorInterfaceProps,
  KeyValueMap,
} from "contentful-management";

export type ContentModel = {
  sys: {
    id: string;
  };
  name: string;
  description: string;
  displayField: string | null;
  fields: ContentFields<KeyValueMap>[];
  editorInterface?: Omit<EditorInterfaceProps, "sys">;
};

export type CreateOrEditContentTypeFunction = ({
  migration: Migration,
  makeRequest: MakeRequest,
  contentTypeId: string,
  name: string,
}) => Promise<FullModel>;
