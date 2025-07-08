import {
  CreateContentTypeProps,
  EditorInterfaceProps,
} from "contentful-management";

export type ContentModel = CreateContentTypeProps & {
  sys: {
    id: string;
  };
  editorInterface?: Omit<EditorInterfaceProps, "sys">;
};

// export type ContentModel = {
//   sys: {
//     id: string;
//   };
//   name: string;
//   description: string;
//   displayField: string | null;
//   fields: ContentFields<KeyValueMap>[];
//   editorInterface?: Omit<EditorInterfaceProps, "sys">;
// };
