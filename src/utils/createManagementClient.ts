import contentfulManagement, { PlainClientAPI } from "contentful-management";

let client: PlainClientAPI | undefined;

export const createManagementClient = ({
  accessToken,
  environmentId,
  spaceId,
}: {
  accessToken: string;
  environmentId: string;
  spaceId: string;
}): PlainClientAPI => {
  if (!accessToken || !environmentId || !spaceId) {
    throw new Error(
      "Access token, environment ID, and space ID are required to create the Contentful management client.",
    );
  }

  return contentfulManagement.createClient(
    {
      accessToken,
    },
    {
      type: "plain",
      defaults: {
        spaceId,
        environmentId,
      },
    },
  );
};
