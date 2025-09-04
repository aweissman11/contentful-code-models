import contentfulManagement, { PlainClientAPI } from "contentful-management";
import { ContentfulClientOptions } from "../types/ClientOptions";

let client: PlainClientAPI | undefined;

export const createManagementClient = ({
  accessToken,
  environmentId,
  spaceId,
}: ContentfulClientOptions): PlainClientAPI => {
  if (!accessToken || !environmentId || !spaceId) {
    throw new Error(
      "Access token, environment ID, and space ID are required to create the Contentful management client.",
    );
  }

  client = contentfulManagement.createClient(
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

  return client;
};

export default createManagementClient;
