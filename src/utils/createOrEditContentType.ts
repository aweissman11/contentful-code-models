import { CreateOrEditContentTypeFunction } from "../types/index.js";
import { contentTypeCheck } from "./contentTypeCheck.js";

export const createOrEditContentType: CreateOrEditContentTypeFunction = async ({
  migration,
  makeRequest,
  contentTypeId,
  name,
}) => {
  const contentModel = await contentTypeCheck({
    makeRequest,
    contentTypeId,
  });
  if (contentModel) {
    return {
      contentType: migration.editContentType(contentTypeId).name(name),
      contentModel,
    };
  } else {
    return {
      contentType: migration.createContentType(contentTypeId).name(name),
    };
  }
};
