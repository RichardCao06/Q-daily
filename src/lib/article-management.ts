export type ArticleStatus = "draft" | "published";

export type ArticleMutationInput = {
  title: string;
  slug: string;
  excerpt: string;
  authorSlug: string;
  categorySlug: string;
  readingTime: string;
  coverAlt: string;
  palette: string;
  tagSlugs: string[];
  bodyInput: string;
  status: ArticleStatus;
  publishedAt: string;
};

export type ArticleMutationPayload = {
  article: {
    title: string;
    slug: string;
    excerpt: string;
    authorSlug: string;
    categorySlug: string;
    readingTime: string;
    coverAlt: string;
    palette: string;
    status: ArticleStatus;
    publishedAt: string | null;
  };
  tagSlugs: string[];
  body: string[];
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function splitArticleBody(input: string) {
  return input
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function joinArticleBody(paragraphs: string[]) {
  return paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean).join("\n\n");
}

export function isPublishedStatus(status: string | null | undefined): status is "published" {
  return status === "published";
}

export function buildArticleMutation(input: ArticleMutationInput): ArticleMutationPayload {
  const title = input.title.trim();
  const slug = input.slug.trim();
  const excerpt = input.excerpt.trim();
  const authorSlug = input.authorSlug.trim();
  const categorySlug = input.categorySlug.trim();
  const readingTime = input.readingTime.trim();
  const coverAlt = input.coverAlt.trim();
  const palette = input.palette.trim();
  const body = splitArticleBody(input.bodyInput);
  const publishedAt =
    input.status === "published" ? (input.publishedAt.trim() ? new Date(input.publishedAt).toISOString() : new Date().toISOString()) : null;

  if (!title) {
    throw new Error("标题不能为空");
  }

  if (!slugPattern.test(slug)) {
    throw new Error("Slug 只能包含小写字母、数字和中划线");
  }

  if (!excerpt) {
    throw new Error("摘要不能为空");
  }

  if (!authorSlug || !categorySlug) {
    throw new Error("作者和分类不能为空");
  }

  if (body.length === 0) {
    throw new Error("正文至少需要一个段落");
  }

  return {
    article: {
      title,
      slug,
      excerpt,
      authorSlug,
      categorySlug,
      readingTime,
      coverAlt,
      palette,
      status: input.status,
      publishedAt,
    },
    tagSlugs: Array.from(new Set(input.tagSlugs)),
    body,
  };
}
