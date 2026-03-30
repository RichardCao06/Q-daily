import { getArticleBySlug, getCategoryBySlug, getTagBySlug } from "./qdaily-data";
import { buildArticleMetadata, buildCollectionMetadata, buildHomeMetadata } from "./metadata";

describe("metadata helpers", () => {
  it("builds homepage metadata", () => {
    const metadata = buildHomeMetadata();

    expect(metadata.title).toBe("Q-daily Recreation");
    expect(metadata.description).toContain("QDaily");
  });

  it("builds article metadata from article content", () => {
    const article = getArticleBySlug("rebuild-a-newsroom-wall");
    const metadata = buildArticleMetadata(article!);

    expect(metadata.title).toContain(article!.title);
    expect(metadata.title).toContain(article!.category.name);
    expect(metadata.description).toBe(article!.excerpt);
  });

  it("builds collection metadata for categories and tags", () => {
    const category = getCategoryBySlug("business");
    const tag = getTagBySlug("longform");

    expect(buildCollectionMetadata(category!, "category").title).toContain("商业");
    expect(buildCollectionMetadata(tag!, "tag").title).toContain("长文章");
  });
});
