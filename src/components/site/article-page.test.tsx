import { render, screen } from "@testing-library/react";

import { getArticleBySlug } from "@/lib/qdaily-data";
import { parseMarkdownArticle } from "@/lib/markdown-articles";

import { ArticlePage } from "./article-page";

describe("ArticlePage", () => {
  it("renders a QDaily-like article layout with sidebar modules, comments, and related stories", () => {
    const article = getArticleBySlug("rebuild-a-newsroom-wall");

    expect(article).toBeDefined();

    render(<ArticlePage article={article!} />);

    expect(screen.getByRole("heading", { level: 1, name: article!.title })).toBeInTheDocument();
    expect(screen.getByText(article!.author)).toBeInTheDocument();
    expect(screen.getByText("导读")).toBeInTheDocument();
    expect(screen.getByText("摘录")).toBeInTheDocument();
    expect(screen.getByText("延伸阅读索引")).toBeInTheDocument();
    expect(screen.getAllByText(article!.body[0]!)[0]).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /点赞/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /收藏/ })).toBeInTheDocument();
    expect(screen.getByText("评论会在审核通过后公开显示。")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "评论区" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "编辑推荐" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "相关阅读" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(4);
  });

  it("renders markdown-backed long articles with the same standard article UI", () => {
    const article = parseMarkdownArticle(`---
title: 张雪不太喜欢“创业者”这个词
slug: zhangxue-profile-editorial-reillustrated
excerpt: 这不是一个机车品牌如何夺冠的故事。
publishedAt: 2026-03-30T10:00:00+08:00
author: Richard Cao
readingTime: 9 分钟
category: business
tags: longform, culture-shift, newsroom
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

    render(<ArticlePage article={article} relatedStories={[]} />);

    expect(screen.getByRole("heading", { level: 1, name: article.title })).toBeInTheDocument();
    expect(screen.getByText("导读")).toBeInTheDocument();
    expect(screen.getByText("摘录")).toBeInTheDocument();
    expect(screen.getByText("登录后参与评论")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "先被认识的，往往不是车" })).toBeInTheDocument();
    expect(screen.getByText("很多人先认识张雪，不是因为一辆车。")).toBeInTheDocument();
    expect(screen.getByAltText("500RR")).toBeInTheDocument();
    expect(screen.getByText("图注：500RR 官方产品图。")).toBeInTheDocument();
  });

  it("prefers local svg assets when editorial storage images point at legacy png files", () => {
    const article = parseMarkdownArticle(`---
title: 奖励黑客的渐变幻觉
slug: reward-hacking-gradient-feature-editorial
excerpt: 用一张更宽的标题卡验证页面优先选择本地 SVG。
publishedAt: 2026-04-20T09:00:00+08:00
author: Richard Cao
readingTime: 8 分钟
category: business
tags: longform, culture-shift
palette: linear-gradient(135deg, #111 0%, #333 100%)
coverAlt: 奖励黑客标题卡
heroImage: https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/hero/cover-reward-hacking-title-card.png
heroCaption: 图注：标题卡应优先显示宽版 SVG。
---

![流程图](https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/inline/process-grift-pipeline-1.png)

*图注：流程图也应回退到本地 SVG。*`);

    render(<ArticlePage article={article} relatedStories={[]} />);

    expect(screen.getByAltText("奖励黑客标题卡")).toHaveAttribute(
      "src",
      "/editorial/reward-hacking-gradient/cover-reward-hacking-title-card.svg",
    );
    expect(screen.getByAltText("流程图")).toHaveAttribute(
      "src",
      "/editorial/reward-hacking-gradient/process-grift-pipeline-1.svg",
    );
  });

  it("renders related story cover images when related articles provide hero images", () => {
    const article = getArticleBySlug("rebuild-a-newsroom-wall")!;
    const relatedStory = {
      ...article,
      id: "related-story-with-image",
      slug: "related-editorial-story",
      title: "带头图的相关阅读",
      heroImage: {
        src: "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/gemini-robotics-er16-facility-feature-editorial/hero/cover-gemini-robotics-er16-title-card.png",
        alt: "相关阅读封面",
      },
    };

    render(<ArticlePage article={article} relatedStories={[relatedStory]} />);

    expect(screen.getByAltText("相关阅读封面")).toHaveAttribute(
      "src",
      "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/gemini-robotics-er16-facility-feature-editorial/hero/cover-gemini-robotics-er16-title-card.png",
    );
  });
});
