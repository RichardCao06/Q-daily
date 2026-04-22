export const normalizedTagDefinitions = [
  { slug: "hao-wenzhang", name: "好文章", description: "当前主标签，先承接现有全部文章" },
  { slug: "hao-guandian", name: "好观点", description: "观点型内容" },
  { slug: "hao-jiahuo", name: "好家伙", description: "人物、器物或惊喜发现" },
  { slug: "hao-lunwen", name: "好论文", description: "论文与研究内容" },
] as const;

const legacyTagSlugByNormalizedSlug = new Map<string, string>([
  ["hao-wenzhang", "longform"],
  ["hao-guandian", "product-thinking"],
  ["hao-jiahuo", "newsroom"],
  ["hao-lunwen", "culture-shift"],
]);

const normalizedSlugByLegacySlug = new Map<string, string>([
  ["longform", "hao-wenzhang"],
  ["product-thinking", "hao-guandian"],
  ["newsroom", "hao-jiahuo"],
  ["culture-shift", "hao-lunwen"],
]);

const legacyBundledArticleTagSlugs = new Set(["longform", "product-thinking", "newsroom"]);

export function buildNormalizedSiteTags() {
  return normalizedTagDefinitions.map((tag) => ({
    slug: tag.slug,
    name: tag.name,
    href: `/tags/${tag.slug}`,
  }));
}

export function buildNormalizedTagOptions() {
  return normalizedTagDefinitions.map((tag) => ({
    slug: tag.slug,
    name: tag.name,
  }));
}

export function mapEditorTagSlugsToStored(tagSlugs: string[]) {
  return Array.from(
    new Set(tagSlugs.map((slug) => legacyTagSlugByNormalizedSlug.get(slug) ?? slug)),
  );
}

export function mapStoredTagSlugsToEditor(tagSlugs: string[]) {
  const uniqueTagSlugs = Array.from(new Set(tagSlugs));

  if (
    uniqueTagSlugs.length > 0 &&
    uniqueTagSlugs.every((slug) => legacyBundledArticleTagSlugs.has(slug)) &&
    uniqueTagSlugs.includes("longform")
  ) {
    return ["hao-wenzhang"];
  }

  return Array.from(
    new Set(uniqueTagSlugs.map((slug) => normalizedSlugByLegacySlug.get(slug) ?? slug)),
  );
}
