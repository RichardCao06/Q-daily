import type { ArticleLongformBlock } from "./qdaily-data";
import { parseMarkdownArticle } from "./markdown-articles";

type StoredArticleBlock = {
  kind: string;
  content: string;
};

type StoredHeroImage = {
  src: string;
  alt: string;
  caption?: string;
};

type MarkdownImportOptions = {
  authorSlug: string;
  status?: "draft" | "published";
};

type MarkdownImportPayload = {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    authorSlug: string;
    categorySlug: string;
    readingTime: string;
    coverAlt: string;
    palette: string;
    status: "draft" | "published";
    publishedAt: string | null;
  };
  tagSlugs: string[];
  blocks: Array<{
    position: number;
    kind: string;
    content: string;
  }>;
};

function parseFrontmatter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error("Markdown article requires frontmatter");
  }

  const [, rawFrontmatter] = match;

  return rawFrontmatter.split("\n").reduce<Record<string, string>>((accumulator, line) => {
    const separator = line.indexOf(":");
    if (separator === -1) {
      return accumulator;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    accumulator[key] = value;
    return accumulator;
  }, {});
}

export function serializeArticleBlock(block: ArticleLongformBlock): StoredArticleBlock {
  if (block.type === "paragraph") {
    return {
      kind: "paragraph",
      content: block.content,
    };
  }

  if (block.type === "heading") {
    return {
      kind: "heading",
      content: JSON.stringify({
        level: block.level,
        content: block.content,
      }),
    };
  }

  return {
    kind: "image",
    content: JSON.stringify({
      src: block.src,
      alt: block.alt,
      caption: block.caption,
    }),
  };
}

export function serializeHeroImage(image: StoredHeroImage): StoredArticleBlock {
  return {
    kind: "hero_image",
    content: JSON.stringify(image),
  };
}

export function deserializeStoredHeroImage(block: StoredArticleBlock): StoredHeroImage | null {
  if (block.kind !== "hero_image") {
    return null;
  }

  try {
    const parsed = JSON.parse(block.content) as { src?: string; alt?: string; caption?: string };

    if (typeof parsed.src === "string" && typeof parsed.alt === "string") {
      return {
        src: parsed.src,
        alt: parsed.alt,
        caption: typeof parsed.caption === "string" ? parsed.caption : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function deserializeStoredArticleBlock(block: StoredArticleBlock): ArticleLongformBlock | null {
  if (block.kind === "paragraph") {
    return {
      type: "paragraph",
      content: block.content,
    };
  }

  if (block.kind === "heading") {
    let parsed: { level?: number; content?: string };

    try {
      parsed = JSON.parse(block.content) as { level?: number; content?: string };
    } catch {
      return null;
    }

    if ((parsed.level === 2 || parsed.level === 3) && typeof parsed.content === "string") {
      return {
        type: "heading",
        level: parsed.level,
        content: parsed.content,
      };
    }

    return null;
  }

  if (block.kind === "image") {
    let parsed: { src?: string; alt?: string; caption?: string };

    try {
      parsed = JSON.parse(block.content) as { src?: string; alt?: string; caption?: string };
    } catch {
      return null;
    }

    if (typeof parsed.src === "string" && typeof parsed.alt === "string") {
      return {
        type: "image",
        src: parsed.src,
        alt: parsed.alt,
        caption: typeof parsed.caption === "string" ? parsed.caption : undefined,
      };
    }

    return null;
  }

  return null;
}

export function buildMarkdownImportPayload(source: string, options: MarkdownImportOptions): MarkdownImportPayload {
  const article = parseMarkdownArticle(source);
  const frontmatter = parseFrontmatter(source);
  const status = options.status ?? "published";
  const publishedAt = status === "published" ? new Date(frontmatter.publishedAt).toISOString() : null;
  const storedBlocks = (article.longformBlocks ?? []).map((block, index) => {
    const stored = serializeArticleBlock(block);

    return {
      position: index + 1,
      kind: stored.kind,
      content: stored.content,
    };
  });

  const blocks = article.heroImage
    ? [
        {
          position: 1,
          ...serializeHeroImage(article.heroImage),
        },
        ...storedBlocks.map((block) => ({
          ...block,
          position: block.position + 1,
        })),
      ]
    : storedBlocks;

  return {
    article: {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      authorSlug: options.authorSlug,
      categorySlug: article.category.slug,
      readingTime: article.readingTime,
      coverAlt: article.coverAlt,
      palette: article.palette,
      status,
      publishedAt,
    },
    tagSlugs: article.tags.map((tag) => tag.slug),
    blocks,
  };
}
