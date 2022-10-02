import { MigrationModule } from "@kontent-ai/cli";
import {
  ContentTypeElementsBuilder,
  ContentTypeModels,
  ManagementClient,
} from "@kontent-ai/management-sdk";

/**
 * Creates content type called Blog.
 * This content type has three text elements: title, author and text.
 */
const migration: MigrationModule = {
  order: 1,
  run: async (apiClient: ManagementClient) => {
    await apiClient
      .addContentType()
      .withData(BuildBlogPostTypeData)
      .toPromise();
  },
};

const BuildBlogPostTypeData = (
  builder: ContentTypeElementsBuilder
): ContentTypeModels.IAddContentTypeData => {
  return {
    name: "Article",
    codename: "article",
    elements: [
      builder.textElement({
        name: "Title",
        codename: "title",
        type: "text",
      }),
      builder.richTextElement({
        name: "Body",
        codename: "body",
        type: "rich_text",
        allowed_blocks: ["text"],
        allowed_text_blocks: ["paragraph", "heading-two", "heading-three" , "unordered-list", "ordered-list"],
        allowed_formatting: ["unstyled", "bold", "italic", "link"],
      }),
    ],
  };
};

export default migration;
