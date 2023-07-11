import { MigrationModule } from "@kontent-ai/cli";
import { ManagementClient } from "@kontent-ai/management-sdk";
import { ConvertTextToRichText } from "./Utils/change-field-type";

/**
 * Creates a sample content item of type Blog.
 */
const migration: MigrationModule = {
  order: 2,
  run: async (apiClient: ManagementClient) => {
    throw new Error('Stop here');
    await ConvertTextToRichText(apiClient, "article", "title", "Title", "h1", undefined);
  },
};

export default migration;
