"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a sample content item of type Blog.
 */
const migration = {
    order: 2,
    run: (apiClient) => __awaiter(void 0, void 0, void 0, function* () {
        // Create content item
        yield createFirstArticle(apiClient);
        yield createSecondArticle(apiClient);
        yield createThirdArticle(apiClient);
    }),
};
const createFirstArticle = (apiClient) => __awaiter(void 0, void 0, void 0, function* () {
    const itemResponse = yield apiClient
        .addContentItem()
        .withData({
        name: "Draft Article",
        type: {
            codename: "article",
        },
    })
        .toPromise();
    // Create language variant in default language
    yield apiClient
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
});
const createSecondArticle = (apiClient) => __awaiter(void 0, void 0, void 0, function* () {
    const itemResponse = yield apiClient
        .addContentItem()
        .withData({
        name: "Published Article",
        type: {
            codename: "article",
        },
    })
        .toPromise();
    // Create language variant in default language
    yield apiClient
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
    yield apiClient
        .publishLanguageVariant()
        .byItemId(itemResponse.data.id)
        .byLanguageCodename("default")
        .withoutData()
        .toPromise();
});
const createThirdArticle = (apiClient) => __awaiter(void 0, void 0, void 0, function* () {
    const itemResponse = yield apiClient
        .addContentItem()
        .withData({
        name: "Published Article with Draft",
        type: {
            codename: "article",
        },
    })
        .toPromise();
    // Create language variant in default language
    yield apiClient
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
    yield apiClient
        .publishLanguageVariant()
        .byItemId(itemResponse.data.id)
        .byLanguageCodename("default")
        .withoutData()
        .toPromise();
    yield apiClient
        .createNewVersionOfLanguageVariant()
        .byItemId(itemResponse.data.id)
        .byLanguageCodename("default")
        .toPromise();
    yield apiClient
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
});
exports.default = migration;
