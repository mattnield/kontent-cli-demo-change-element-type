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
 * Creates content type called Blog.
 * This content type has three text elements: title, author and text.
 */
const migration = {
    order: 1,
    run: (apiClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield apiClient
            .addContentType()
            .withData(BuildBlogPostTypeData)
            .toPromise();
    }),
};
const BuildBlogPostTypeData = (builder) => {
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
                allowed_text_blocks: ["paragraph", "heading-two", "heading-three", "unordered-list", "ordered-list"],
                allowed_formatting: ["unstyled", "bold", "italic", "link"],
            }),
        ],
    };
};
exports.default = migration;
