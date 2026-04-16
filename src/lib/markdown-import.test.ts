import { describe, expect, it } from "vitest";

import { buildMarkdownImportPayload, deserializeStoredArticleBlock, serializeArticleBlock } from "./markdown-import";

describe("markdown import", () => {
  it("builds a Supabase-ready payload from markdown with rich blocks", () => {
    const payload = buildMarkdownImportPayload(
      `---
title: 她没有一直陪在张雪身边，但在最难的时候托住了他
slug: heqiong-profile-editorial
excerpt: 如果只把张雪的故事写成一个车手和创业者的故事，就会漏掉何琼。
publishedAt: 2026-04-07T18:00:00+08:00
author: Richard Cao
readingTime: 9 分钟
category: culture
tags: longform, culture-shift, newsroom
palette: linear-gradient(135deg, #4f392d 0%, #8d684f 48%, #d4b58f 100%)
coverAlt: 何琼与张雪的合影
heroImage: /editorial/heqiong-profile/hero-heqiong-1.jpg
heroCaption: 图注：何琼与张雪的合影。
---

## 她离得不近，但一直没有离开

她是张雪的母亲。

![张雪写给母亲的手写页](/editorial/heqiong-profile/archive-note-1.jpg)

*图注：张雪写给母亲的手写页。*`,
      { authorSlug: "richard-cao" },
    );

    expect(payload.article.slug).toBe("heqiong-profile-editorial");
    expect(payload.article.authorSlug).toBe("richard-cao");
    expect(payload.article.categorySlug).toBe("culture");
    expect(payload.article.status).toBe("published");
    expect(payload.article.sourceMarkdown).toContain("她是张雪的母亲。");
    expect(payload.article.heroImageUrl).toBe("/editorial/heqiong-profile/hero-heqiong-1.jpg");
    expect(payload.article.heroImageCaption).toBe("图注：何琼与张雪的合影。");
    expect(payload.tagSlugs).toEqual(["longform", "culture-shift", "newsroom"]);
    expect(payload.blocks).toEqual([
      expect.objectContaining({ position: 1, kind: "heading" }),
      expect.objectContaining({ position: 2, kind: "paragraph", content: "她是张雪的母亲。" }),
      expect.objectContaining({ position: 3, kind: "image" }),
    ]);
  });

  it("round-trips heading and image blocks through storage serialization", () => {
    const heading = serializeArticleBlock({ type: "heading", level: 2, content: "冠军之后，问题才真正开始" });
    const image = serializeArticleBlock({
      type: "image",
      src: "/editorial/avo-paper/benchmark-redraw-1.png",
      alt: "AVO benchmark",
      caption: "图注：对比图。",
    });

    expect(deserializeStoredArticleBlock(heading)).toEqual({
      type: "heading",
      level: 2,
      content: "冠军之后，问题才真正开始",
    });
    expect(deserializeStoredArticleBlock(image)).toEqual({
      type: "image",
      src: "/editorial/avo-paper/benchmark-redraw-1.png",
      alt: "AVO benchmark",
      caption: "图注：对比图。",
    });
  });
});
