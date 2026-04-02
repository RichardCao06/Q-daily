import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getCategoryBySlug, getTagBySlug, type Article, type ArticleLongformBlock } from "./qdaily-data";

const defaultDirectory = path.join(process.cwd(), "content", "articles");

type Frontmatter = Record<string, string>;

function parseFrontmatter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error("Markdown article requires frontmatter");
  }

  const [, rawFrontmatter, body] = match;
  const frontmatter = rawFrontmatter.split("\n").reduce<Frontmatter>((accumulator, line) => {
    const separator = line.indexOf(":");
    if (separator === -1) {
      return accumulator;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    accumulator[key] = value;
    return accumulator;
  }, {});

  return {
    frontmatter,
    body,
  };
}

function flushParagraph(buffer: string[], blocks: ArticleLongformBlock[]) {
  if (buffer.length === 0) {
    return;
  }

  blocks.push({
    type: "paragraph",
    content: buffer.join(" ").trim(),
  });
  buffer.length = 0;
}

function parseCaption(line: string) {
  const captionMatch = line.match(/^\*(.+)\*$/);
  return captionMatch ? captionMatch[1]?.trim() ?? "" : null;
}

function parseBlocks(body: string) {
  const blocks: ArticleLongformBlock[] = [];
  const paragraphBuffer: string[] = [];
  const lines = body.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? "";

    if (!line) {
      flushParagraph(paragraphBuffer, blocks);
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph(paragraphBuffer, blocks);
      blocks.push({
        type: "heading",
        level: 2,
        content: line.slice(3).trim(),
      });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph(paragraphBuffer, blocks);
      blocks.push({
        type: "heading",
        level: 3,
        content: line.slice(4).trim(),
      });
      continue;
    }

    const imageMatch = line.match(/^!\[(.*)\]\((.*)\)$/);
    if (imageMatch) {
      flushParagraph(paragraphBuffer, blocks);

      const [, alt, src] = imageMatch;
      let caption: string | undefined;
      let lookaheadIndex = index + 1;

      while (lookaheadIndex < lines.length && !(lines[lookaheadIndex]?.trim() ?? "")) {
        lookaheadIndex += 1;
      }

      const nextLine = lines[lookaheadIndex]?.trim() ?? "";
      const parsedCaption = parseCaption(nextLine);

      if (parsedCaption) {
        caption = parsedCaption;
        index = lookaheadIndex;
      }

      blocks.push({
        type: "image",
        src: src.trim(),
        alt: alt.trim(),
        caption,
      });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph(paragraphBuffer, blocks);
  return blocks;
}

function requireField(frontmatter: Frontmatter, key: string) {
  const value = frontmatter[key];

  if (!value) {
    throw new Error(`Missing frontmatter field: ${key}`);
  }

  return value;
}

export function parseMarkdownArticle(source: string): Article {
  const { frontmatter, body } = parseFrontmatter(source);
  const categorySlug = requireField(frontmatter, "category");
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    throw new Error(`Unknown category slug: ${categorySlug}`);
  }

  const tagSlugs = requireField(frontmatter, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const tags = tagSlugs.map((tagSlug) => {
    const tag = getTagBySlug(tagSlug);
    if (!tag) {
      throw new Error(`Unknown tag slug: ${tagSlug}`);
    }
    return tag;
  });

  const blocks = parseBlocks(body);

  return {
    id: requireField(frontmatter, "slug"),
    slug: requireField(frontmatter, "slug"),
    title: requireField(frontmatter, "title"),
    excerpt: requireField(frontmatter, "excerpt"),
    publishedAt: requireField(frontmatter, "publishedAt").replace("T", " ").slice(0, 16),
    comments: 0,
    likes: 0,
    palette: requireField(frontmatter, "palette"),
    author: requireField(frontmatter, "author"),
    readingTime: requireField(frontmatter, "readingTime"),
    coverAlt: requireField(frontmatter, "coverAlt"),
    body: blocks.filter((block): block is Extract<ArticleLongformBlock, { type: "paragraph" }> => block.type === "paragraph").map((block) => block.content),
    category,
    tags,
    layout: "longform",
    source: "markdown",
    heroImage: {
      src: requireField(frontmatter, "heroImage"),
      alt: requireField(frontmatter, "coverAlt"),
      caption: frontmatter.heroCaption?.trim() || undefined,
    },
    longformBlocks: blocks,
  };
}

export async function loadMarkdownArticles(directory = defaultDirectory) {
  try {
    const files = await readdir(directory);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));
    const articles = await Promise.all(
      markdownFiles.map(async (file) => {
        const source = await readFile(path.join(directory, file), "utf8");
        return parseMarkdownArticle(source);
      }),
    );

    return articles;
  } catch {
    return [] as Article[];
  }
}
