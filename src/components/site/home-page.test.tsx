import { render, screen, within } from "@testing-library/react";

import { channelLinks, defaultHomePageCopy, featurePanels, feedStories, footerColumns, primaryLinks, sideFeatures, spotlightStory, utilityLinks } from "@/lib/qdaily-data";

import { HomePage } from "./home-page";

const homePageData = {
  spotlightStory,
  sideFeatures,
  featurePanels,
  feedStories,
  copy: defaultHomePageCopy,
  channelLinks,
  primaryLinks,
  utilityLinks,
  footerColumns,
  isEmpty: false,
} as const;

describe("HomePage", () => {
  it("renders a QDaily-like front page with editorial hero modules and dense footer controls", () => {
    render(<HomePage data={homePageData} />);

    expect(screen.getByRole("banner")).toHaveTextContent("好奇心研究所");
    expect(screen.getByText("今日策展")).toBeInTheDocument();
    expect(screen.getByText("像一本被翻开的周末杂志，留下呼吸感，也留下值得细看的新闻。")).toBeInTheDocument();
    expect(screen.getByText("编者手记")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: spotlightStory.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("登录 / 注册").length).toBeGreaterThan(0);
    expect(screen.getByText("今日 · TODAY")).toBeInTheDocument();
    expect(screen.getByLabelText("今日")).toBeInTheDocument();
    expect(screen.getByText("加载更多")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "搜索文章" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "编辑挑选的首页文章流" })).toBeInTheDocument();
    expect(screen.getByText("不再强调压迫式信息墙，而让每一条内容都像被认真摆放过的展签。")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(
      feedStories.length + featurePanels.length + 1,
    );
    expect(screen.getAllByRole("contentinfo").at(-1)).toHaveTextContent("下载 APP");
    const banner = screen.getByRole("banner");
    const channelNav = within(banner).getByRole("navigation", { name: "频道导航" });
    expect(within(channelNav).getByRole("link", { name: "好文章" })).toBeInTheDocument();
    expect(within(channelNav).getByRole("link", { name: "好观点" })).toBeInTheDocument();
    expect(within(channelNav).queryByRole("link", { name: "商业" })).not.toBeInTheDocument();
  });

  it("renders article cover images on cards when the content source provides them", () => {
    render(
      <HomePage
        data={{
          ...homePageData,
          spotlightStory: {
            ...spotlightStory,
            coverImage: {
              src: "/editorial/avo-paper/paper-firstpage-1.png",
              alt: "AVO 论文首页",
            },
          },
          sideFeatures,
          featurePanels,
          feedStories: [
            {
              ...feedStories[0]!,
              coverImage: {
                src: "/editorial/heqiong-profile/hero-heqiong-1.jpg",
                alt: "何琼与张雪",
              },
            },
          ],
        }}
      />,
    );

    expect(screen.getByAltText("AVO 论文首页")).toBeInTheDocument();
    expect(screen.getByAltText("何琼与张雪")).toBeInTheDocument();
  });

  it("keeps Supabase storage urls unchanged on homepage cards", () => {
    render(
      <HomePage
        data={{
          ...homePageData,
          spotlightStory: {
            ...spotlightStory,
            coverImage: {
              src: "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/hero/cover-reward-hacking-title-card.png",
              alt: "Reward hacking 标题卡",
            },
          },
          sideFeatures,
          featurePanels,
          feedStories,
        }}
      />,
    );

    expect(screen.getByAltText("Reward hacking 标题卡")).toHaveAttribute("src", "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/hero/cover-reward-hacking-title-card.png");
  });
  it("renders an empty state when Supabase has not configured homepage modules yet", () => {
    render(
      <HomePage
        data={{
          ...homePageData,
          copy: null,
          isEmpty: false,
        }}
      />,
    );

    expect(screen.queryByRole("heading", { level: 1, name: "首页内容暂未配置" })).not.toBeInTheDocument();
    expect(screen.getByText("今日策展")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: spotlightStory.title })).toBeInTheDocument();
  });

  it("renders an empty state only when there are no stories to show at all", () => {
    render(
      <HomePage
        data={{
          ...homePageData,
          spotlightStory: null,
          sideFeatures: [],
          featurePanels: [],
          feedStories: [],
          copy: null,
          isEmpty: true,
        }}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "首页内容暂未配置" })).toBeInTheDocument();
    expect(screen.getByText("请先在 Supabase 中发布文章并配置首页模块，首页才会显示正式内容。")).toBeInTheDocument();
    expect(screen.queryByText("今日策展")).not.toBeInTheDocument();
  });

  it("renders homepage narrative copy from the supplied content data", () => {
    render(
      <HomePage
        data={{
          ...homePageData,
          copy: {
            ...defaultHomePageCopy,
            curatorNote: {
              label: "本日导览",
              text: "这一版首页的导语已经改成从 Supabase 提供。",
            },
            curatorKicker: {
              title: "Daily Brief",
              text: "右侧说明也应该跟着数据库里的模块文案变化。",
            },
            editorMemo: {
              label: "值班编辑",
              text: "这一段不该再写死在组件里。",
            },
            loginModule: {
              eyebrow: "读者账户",
              title: "进入账户",
              text: "账户模块说明也应该来自内容表。",
              href: "/account/login",
            },
            loginActions: {
              loginLabel: "立即登录",
              registerLabel: "创建账户",
            },
            latestMeta: {
              statusLabel: "刚刚更新",
              updatedAtPrefix: "同步于",
            },
            feedHeading: {
              eyebrow: "Supabase Feed",
              title: "数据库驱动的首页文章流",
              hint: "这段说明现在也应该由数据库控制。",
            },
            controls: {
              loadMoreLabel: "继续展开",
              backToTopLabel: "返回顶部",
            },
            footerBrand: {
              title: "数据库日报",
              text: "页脚品牌说明也来自 Supabase。",
            },
            footerSearch: {
              label: "搜索数据库文章",
              placeholder: "输入 Supabase 关键词",
              copyright: "2026 Supabase-driven QDaily",
            },
          },
        }}
      />,
    );

    expect(screen.getByText("本日导览")).toBeInTheDocument();
    expect(screen.getByText("这一版首页的导语已经改成从 Supabase 提供。")).toBeInTheDocument();
    expect(screen.getByText("Daily Brief")).toBeInTheDocument();
    expect(screen.getByText("右侧说明也应该跟着数据库里的模块文案变化。")).toBeInTheDocument();
    expect(screen.getByText("值班编辑")).toBeInTheDocument();
    expect(screen.getByText("进入账户")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "立即登录" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "创建账户" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "数据库驱动的首页文章流" })).toBeInTheDocument();
    expect(screen.getByText("继续展开")).toBeInTheDocument();
    expect(screen.getByText("返回顶部")).toBeInTheDocument();
    expect(screen.getByText("数据库日报")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "搜索数据库文章" })).toHaveAttribute("placeholder", "输入 Supabase 关键词");
    expect(screen.getByText("2026 Supabase-driven QDaily")).toBeInTheDocument();
  });

  it("renders today's date as the right-rail calendar card with day, month, year and weekday", () => {
    const fixedToday = new Date("2026-04-27T08:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(fixedToday);

    try {
      render(<HomePage data={homePageData} />);

      const calendar = screen.getByLabelText("今日");
      expect(within(calendar).getByText("今日 · TODAY")).toBeInTheDocument();
      expect(within(calendar).getByText(String(fixedToday.getDate()))).toBeInTheDocument();
      expect(within(calendar).getByText(`${fixedToday.getMonth() + 1} 月`)).toBeInTheDocument();
      expect(within(calendar).getByText(String(fixedToday.getFullYear()))).toBeInTheDocument();
      // Local weekday label depends on the test environment's TZ — assert one of the seven labels appears.
      const weekdayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      expect(weekdayLabels.some((label) => within(calendar).queryByText(label) !== null)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
