import type { MakeRequest } from "contentful-migration";

export const contentTypeCheck = async ({
  makeRequest,
  contentTypeId,
}: {
  makeRequest: MakeRequest;
  contentTypeId: string;
}): Promise<ContentModel | null> => {
  try {
    return (await makeRequest({
      method: "GET",
      url: `/content_types/${contentTypeId}`,
    })) as ContentModel;
  } catch (error) {
    if ((error as { name?: string }).name === "NotFound") {
      return null;
    }
    throw error;
  }
};
