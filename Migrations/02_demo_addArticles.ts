import { MigrationModule } from "@kontent-ai/cli";
import { ManagementClient } from "@kontent-ai/management-sdk";
/**
 * Creates a sample content item of type Blog.
 */
const migration: MigrationModule = {
  order: 2,
  run: async (apiClient: ManagementClient) => {
    // Create content item
    await createFirstArticle(apiClient);
    await createSecondArticle(apiClient);
    await createThirdArticle(apiClient);
  },
};

const createFirstArticle = async (apiClient: ManagementClient) => {
  const itemResponse = await apiClient
      .addContentItem()
      .withData({
        name: "Draft Article",
        type: {
          codename: "article",
        },
      })
      .toPromise();

    // Create language variant in default language
    await apiClient
      .upsertLanguageVariant()
      .byItemId(itemResponse.data.id)
      .byLanguageCodename("default")
      .withData((builder) => [
        builder.textElement({
          element: {
            codename: "title",
          },
          value: "First Article",
        }),
        builder.richTextElement({
          element: {
            codename: "body",
          },
          value: "<p><strong>First article intro text block.</strong></p><p>The quick brown fox jumped over the lazy dogs.</p>",
        })
      ])
      .toPromise();
}

const createSecondArticle = async (apiClient: ManagementClient) => {
  const itemResponse = await apiClient
      .addContentItem()
      .withData({
        name: "Published Article",
        type: {
          codename: "article",
        },
      })
      .toPromise();

    // Create language variant in default language
    await apiClient
      .upsertLanguageVariant()
      .byItemId(itemResponse.data.id)
      .byLanguageCodename("default")
      .withData((builder) => [
        builder.textElement({
          element: {
            codename: "title",
          },
          value: "Second Article",
        }),
        builder.richTextElement({
          element: {
            codename: "body",
          },
          value: "<p><strong>Second article intro text block.</strong></p><p>The quick brown fox jumped over the lazy dogs.</p>",
        })
      ])
      .toPromise();
    
    await apiClient
      .publishLanguageVariant()
      .byItemId(itemResponse.data.id)
      .byLanguageCodename("default")
      .withoutData()
      .toPromise();
}

const createThirdArticle = async (apiClient: ManagementClient) => {
  const itemResponse = await apiClient
      .addContentItem()
      .withData({
        name: "Published Article with Draft",
        type: {
          codename: "article",
        },
      })
      .toPromise();

    // Create language variant in default language
    await apiClient
      .upsertLanguageVariant()
      .byItemId(itemResponse.data.id)
      .byLanguageCodename("default")
      .withData((builder) => [
        builder.textElement({
          element: {
            codename: "title",
          },
          value: "Third Article",
        }),
        builder.richTextElement({
          element: {
            codename: "body",
          },
          value: "<p><strong>Third article intro text block.</strong></p><p>The quick brown fox jumped over the lazy dogs.</p>",
        })
      ])
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
          value: "Third Article (edited)",
        })
      ])
      .toPromise();
}

export default migration;
