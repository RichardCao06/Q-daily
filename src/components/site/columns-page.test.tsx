import { render, screen } from "@testing-library/react";

import { ColumnsPage } from "./columns-page";

const categorySummaries = [
  {
    slug: "business",
    name: "商业",
    href: "/categories/business",
    description: "追踪产品、平台与商业结构变化。",
    articleCount: 12,
  },
  {
    slug: "smart",
    name: "智能",
    href: "/categories/smart",
    description: "跟进 AI、自动化与技术判断。",
    articleCount: 8,
  },
  {
    slug: "design",
    name: "设计",
    href: "/categories/design",
    description: "记录视觉系统、界面和媒介表达。",
    articleCount: 4,
  },
] as const;

const featuredCategories = [
  {
    slug: "business",
    name: "商业",
    href: "/categories/business",
    description: "商业栏目关注产品、平台与产业接口如何变化。",
    articleCount: 12,
    featuredStory: {
      slug: "climatiq-product-carbon-interface-feature-editorial",
      title: "产品碳足迹开始有 ROI 之后，LCA 不再只是报告交付，而是销售与采购接口",
      excerpt: "PCF 正在从可持续附件，变成采购、询价和供应链协作里的接口语言。",
      publishedAt: "2026-04-22 15:50",
    },
  },
  {
    slug: "smart",
    name: "智能",
    href: "/categories/smart",
    description: "智能栏目追踪模型、机器人与系统层能力如何进入现实世界。",
    articleCount: 8,
    featuredStory: {
      slug: "openai-trusted-access-cyber-feature-editorial",
      title: "当更强的模型先交给守门人，OpenAI 想把网络安全变成 AI 的第一块“分级开放”试验田",
      excerpt: "前沿模型开始按身份、用途和可见性分层开放。",
      publishedAt: "2026-04-21 18:00",
    },
  },
  {
    slug: "culture",
    name: "文化",
    href: "/categories/culture",
    description: "文化栏目用更慢的节奏看人与叙事如何被塑形。",
    articleCount: 6,
    featuredStory: {
      slug: "zhangxue-profile-editorial-reillustrated",
      title: "张雪不太喜欢“创业者”这个词",
      excerpt: "一个人物与时代关系的长篇切口。",
      publishedAt: "2026-03-30 10:00",
    },
  },
] as const;

describe("ColumnsPage", () => {
  it("renders a category atlas with summaries and featured category cards", () => {
    render(
      <ColumnsPage
        categorySummaries={categorySummaries}
        featuredCategories={featuredCategories}
        highlight={{
          busiest: "商业",
          reflective: "文化",
          freshest: "智能",
        }}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "栏目中心" })).toBeInTheDocument();
    expect(screen.getByText("从栏目进入，而不是从时间进入")).toBeInTheDocument();
    expect(screen.getByText("今日导览")).toBeInTheDocument();
    expect(screen.getByText("更新最多：商业")).toBeInTheDocument();
    expect(screen.getByText("慢读首选：文化")).toBeInTheDocument();
    expect(screen.getByText("最近值得进入：智能")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "栏目索引" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "进入商业栏目" })).toBeInTheDocument();
    expect(screen.getByText("12 篇文章")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "重点栏目" })).toBeInTheDocument();
    expect(screen.getByText("商业栏目关注产品、平台与产业接口如何变化。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "阅读代表文章：产品碳足迹开始有 ROI 之后，LCA 不再只是报告交付，而是销售与采购接口" })).toBeInTheDocument();
  });
});
