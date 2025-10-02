import { API_LIMIT_MAX } from "../constants";
import createManagementClient from "../utils/createManagementClient";
import { options } from "./options";

/**
 * Deletes all content models in the specified Contentful space.
 * This script will unpublish and then delete each content type.
 * Use with caution as this action cannot be undone.
 * This is used for development purposes to clean up the space but should likely never be used in a production application.
 */

const deleteAllModels = async () => {
  const client = createManagementClient(options);

  const allModels = await client.contentType.getMany({
    query: { limit: API_LIMIT_MAX },
  });

  for (const model of allModels.items) {
    try {
      await client.contentType.unpublish({
        contentTypeId: model.sys.id,
      });

      await client.contentType.delete({
        contentTypeId: model.sys.id,
      });
      console.log("Deleted content type", model.sys.id, "🗑️");
    } catch (error: { message: string } | unknown) {
      console.error(
        `Failed to delete content type ${model.sys.id}:`,
        (error as { message: string }).message,
      );
    }
  }
};

deleteAllModels();
