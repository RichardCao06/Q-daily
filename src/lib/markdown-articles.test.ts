import { describe, expect, it } from "vitest";

import { parseMarkdownArticle } from "./markdown-articles";

describe("markdown longform articles", () => {
  it("parses frontmatter, hero metadata, headings, paragraphs, images, and captions", () => {
    const article = parseMarkdownArticle(`---
title: 张雪不太喜欢“创业者”这个词
slug: zhangxue-profile-editorial-reillustrated
excerpt: 这不是一个机车品牌如何夺冠的故事。
publishedAt: 2026-03-30T10:00:00+08:00
author: Richard Cao
readingTime: 9 分钟
category: business
tags: hao-wenzhang
palette: linear-gradient(135deg, #111 0%, #333 100%)
coverAlt: WSBK 葡萄牙站庆祝现场
heroImage: /editorial/zhangxue/hero-media-news-1.jpg
heroCaption: 图注：WSBK 葡萄牙站夺冠后的庆祝现场。
---

## 先被认识的，往往不是车

很多人先认识张雪，不是因为一辆车。

![500RR](/editorial/zhangxue/product-500rr-1.png)

*图注：500RR 官方产品图。*

它真正难的不是做出第一辆车，而是把一套方法持续做下去。`);

    expect(article.slug).toBe("zhangxue-profile-editorial-reillustrated");
    expect(article.category.slug).toBe("business");
    expect(article.tags.map((tag) => tag.slug)).toEqual(["hao-wenzhang"]);
    expect(article.layout).toBe("longform");
    expect(article.heroImage?.src).toBe("/editorial/zhangxue/hero-media-news-1.jpg");
    expect(article.heroImage?.caption).toContain("WSBK 葡萄牙站");
    expect(article.longformBlocks).toEqual([
      expect.objectContaining({ type: "heading", level: 2, content: "先被认识的，往往不是车" }),
      expect.objectContaining({ type: "paragraph", content: "很多人先认识张雪，不是因为一辆车。" }),
      expect.objectContaining({ type: "image", src: "/editorial/zhangxue/product-500rr-1.png", alt: "500RR", caption: "图注：500RR 官方产品图。" }),
      expect.objectContaining({ type: "paragraph", content: "它真正难的不是做出第一辆车，而是把一套方法持续做下去。" }),
    ]);
  });
});
