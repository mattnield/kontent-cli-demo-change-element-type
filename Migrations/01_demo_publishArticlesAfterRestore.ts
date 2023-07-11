import { MigrationModule } from "@kontent-ai/cli";
import { ManagementClient } from "@kontent-ai/management-sdk";
/**
 * Creates a sample content item of type Blog.
 */
const migration: MigrationModule = {
  order: 1,
  run: async (apiClient: ManagementClient) => {
    // Create content item
    await publishSecondArticle(apiClient);
    await publishThirdArticleAndCreateDraft(apiClient);
    await archiveFourthArticle(apiClient);
  },
};

const publishSecondArticle = async (apiClient: ManagementClient) => {
  const itemResponse = await apiClient
      .viewContentItem()
      .byItemCodename('published_article')
      .toPromise();

  await apiClient
      .publishLanguageVariant()
      .byItemId(itemResponse.data.id)
      .byLanguageCodename('default')
      .withoutData()
      .toPromise();
}

const publishThirdArticleAndCreateDraft = async (apiClient: ManagementClient) => {
  const itemResponse = await apiClient
      .viewContentItem()
      .byItemCodename('published_article_with_draft')
      .toPromise();

  await apiClient
      .publishLanguageVariant()
      .byItemId(itemResponse.data.id)
      .byLanguageCodename("default")
      .withoutData()
      .toPromise();

  await apiClient
      .createNewVersionOfLanguageVariant()
      .byItemId(itemResponse.data.id)
      .byLanguageCodename("default")
      .toPromise();

  await apiClient
      .upsertLanguageVariant()
      .byItemId(itemResponse.data.id)
      .byLanguageCodename("default")
      .withData((builder) => [
        builder.textElement({
          element: {
            codename: "title",
          },
          value: "Article Title (edited)",
        })
      ])
      .toPromise();
}

const archiveFourthArticle = async (apiClient: ManagementClient) => {
  await apiClient
      .changeWorkflowStepOfLanguageVariant()
      .byItemCodename('archived_article')
      .byLanguageId('00000000-0000-0000-0000-000000000000')
      .byWorkflowStepCodename('archived')
      .toPromise();
}

export default migration;
