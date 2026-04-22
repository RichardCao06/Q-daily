import { getArticleBySlug, getCategoryBySlug, getTagBySlug } from "./qdaily-data";
import { buildArticleMetadata, buildCollectionMetadata, buildHomeMetadata } from "./metadata";

describe("metadata helpers", () => {
  it("builds homepage metadata", () => {
    const metadata = buildHomeMetadata();

    expect(metadata.title).toBe("Q-daily");
    expect(metadata.description).toContain("Q-daily");
    expect(metadata.alternates?.canonical).toBe("https://piggpywithpuppy.cn");
    expect(metadata.openGraph?.url).toBe("https://piggpywithpuppy.cn");
  });

  it("builds article metadata from article content", () => {
    const article = getArticleBySlug("rebuild-a-newsroom-wall");
    const metadata = buildArticleMetadata(article!);

    expect(metadata.title).toContain(article!.title);
    expect(metadata.title).toContain(article!.category.name);
    expect(metadata.description).toBe(article!.excerpt);
    expect(metadata.alternates?.canonical).toBe(`https://piggpywithpuppy.cn/articles/${article!.slug}`);
    expect(metadata.openGraph?.url).toBe(`https://piggpywithpuppy.cn/articles/${article!.slug}`);
  });

  it("builds collection metadata for categories and tags", () => {
    const category = getCategoryBySlug("business");
    const tag = getTagBySlug("hao-wenzhang");

    expect(buildCollectionMetadata(category!, "category").title).toContain("商业");
    expect(buildCollectionMetadata(tag!, "tag").title).toContain("好文章");
    expect(buildCollectionMetadata(category!, "category").alternates?.canonical).toBe(
      "https://piggpywithpuppy.cn/categories/business",
    );
    expect(buildCollectionMetadata(tag!, "tag").alternates?.canonical).toBe(
      "https://piggpywithpuppy.cn/tags/hao-wenzhang",
    );
  });
});
