import path from "node:path";

type ArticleMediaKind = "hero" | "inline";

const ARTICLE_MEDIA_BUCKET = "article-media";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/u, "");
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value).replace(/%2F/gu, "/");
}

export function buildSupabaseArticleMediaUrl(
  articleSlug: string,
  kind: ArticleMediaKind,
  fileName: string,
  baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
) {
  if (!baseUrl) {
    return null;
  }

  return `${trimTrailingSlash(baseUrl)}/storage/v1/object/public/${ARTICLE_MEDIA_BUCKET}/articles/${encodePathSegment(articleSlug)}/${kind}/${encodePathSegment(fileName)}`;
}

export function normalizeArticleMediaUrl(
  src: string,
  options: {
    articleSlug?: string;
    kind?: ArticleMediaKind;
    baseUrl?: string;
  } = {},
) {
  if (!src || /^https?:\/\//u.test(src)) {
    return src;
  }

  if (!src.startsWith("/editorial/")) {
    return src;
  }

  if (!options.articleSlug || !options.kind) {
    return src;
  }

  return buildSupabaseArticleMediaUrl(options.articleSlug, options.kind, path.basename(src), options.baseUrl) ?? src;
}
