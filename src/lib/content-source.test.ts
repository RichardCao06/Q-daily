import { articles, defaultHomePageCopy, siteCategories, siteTags } from "./qdaily-data";
import { buildAutomaticHomepageModules, buildSiteChromeData, getHomePageData, mapHomepageModules } from "./content-source";

describe("content source", () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousAnonKey;
  });

  it("throws when Supabase is not configured instead of falling back to local data", async () => {
    await expect(getHomePageData()).rejects.toThrow("Supabase");
  });

  it("derives homepage layout from the latest published articles when homepage modules are missing", () => {
    const modules = buildAutomaticHomepageModules(articles);

    expect(modules.copy).toEqual(defaultHomePageCopy);
    expect(modules.spotlightStory?.slug).toBe("cms-ready-editorial-system");
    expect(modules.featurePanels.map((panel) => panel.slug)).toEqual([
      "feature-cards-need-clear-boundaries",
      "next-card-should-also-be-worth-reading",
    ]);
    expect(modules.sideFeatures.map((panel) => panel.href)).toEqual([
      "/articles/yellow-and-black-brand-skeleton",
      "/articles/density-fits-qdaily",
    ]);
  });

  it("extracts homepage copy blocks from dedicated slot keys", () => {
    const modules = mapHomepageModules([
      {
        slot_key: "home-curator-note",
        slot_type: "side_feature",
        sort_order: 1,
        article_slug: null,
        category_label: "本日导览",
        title: "导语标题不会用到",
        excerpt: "这一版首页导语来自数据库。",
        href: "/",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
      {
        slot_key: "home-curator-kicker",
        slot_type: "side_feature",
        sort_order: 2,
        article_slug: null,
        category_label: "",
        title: "Daily Brief",
        excerpt: "右侧策展说明来自数据库。",
        href: "/",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
      {
        slot_key: "home-editor-memo",
        slot_type: "side_feature",
        sort_order: 3,
        article_slug: null,
        category_label: "值班编辑",
        title: "",
        excerpt: "编者手记来自数据库。",
        href: "/",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
      {
        slot_key: "home-latest-meta",
        slot_type: "side_feature",
        sort_order: 4,
        article_slug: null,
        category_label: "刚刚更新",
        title: "同步于",
        excerpt: "",
        href: "/",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
      {
        slot_key: "home-login",
        slot_type: "side_feature",
        sort_order: 5,
        article_slug: null,
        category_label: "读者账户",
        title: "进入账户",
        excerpt: "账户模块说明来自数据库。",
        href: "/account/login",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
      {
        slot_key: "home-login-actions",
        slot_type: "side_feature",
        sort_order: 6,
        article_slug: null,
        category_label: "立即登录",
        title: "创建账户",
        excerpt: "",
        href: "/account/login",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
      {
        slot_key: "home-feed-heading",
        slot_type: "side_feature",
        sort_order: 7,
        article_slug: null,
        category_label: "Supabase Feed",
        title: "数据库驱动的首页文章流",
        excerpt: "这段说明也来自数据库。",
        href: "/",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
      {
        slot_key: "home-controls",
        slot_type: "side_feature",
        sort_order: 8,
        article_slug: null,
        category_label: "继续展开",
        title: "返回顶部",
        excerpt: "",
        href: "/",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
      {
        slot_key: "home-footer-brand",
        slot_type: "side_feature",
        sort_order: 9,
        article_slug: null,
        category_label: "数据库日报",
        title: "页脚品牌说明来自数据库。",
        excerpt: "",
        href: "/",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
      {
        slot_key: "home-search",
        slot_type: "side_feature",
        sort_order: 10,
        article_slug: null,
        category_label: "搜索数据库文章",
        title: "输入 Supabase 关键词",
        excerpt: "2026 Supabase-driven QDaily",
        href: "/search",
        palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      },
    ]);

    expect(modules.copy).toEqual({
      ...defaultHomePageCopy,
      curatorNote: {
        label: "本日导览",
        text: "这一版首页导语来自数据库。",
      },
      curatorKicker: {
        title: "Daily Brief",
        text: "右侧策展说明来自数据库。",
      },
      editorMemo: {
        label: "值班编辑",
        text: "编者手记来自数据库。",
      },
      latestMeta: {
        statusLabel: "刚刚更新",
        updatedAtPrefix: "同步于",
      },
      loginModule: {
        eyebrow: "读者账户",
        title: "进入账户",
        text: "账户模块说明来自数据库。",
        href: "/account/login",
      },
      loginActions: {
        loginLabel: "立即登录",
        registerLabel: "创建账户",
      },
      feedHeading: {
        eyebrow: "Supabase Feed",
        title: "数据库驱动的首页文章流",
        hint: "这段说明也来自数据库。",
      },
      controls: {
        loadMoreLabel: "继续展开",
        backToTopLabel: "返回顶部",
      },
      footerBrand: {
        title: "数据库日报",
        text: "页脚品牌说明来自数据库。",
      },
      footerSearch: {
        label: "搜索数据库文章",
        placeholder: "输入 Supabase 关键词",
        copyright: "2026 Supabase-driven QDaily",
      },
    });
  });

  it("builds top channel navigation from tags only while keeping categories in the footer", () => {
    const chrome = buildSiteChromeData(siteCategories, siteTags);

    expect(chrome.channelLinks.map((item) => item.label)).toEqual(["好文章", "好观点", "好家伙", "好论文"]);
    expect(chrome.channelLinks.some((item) => item.label === "商业")).toBe(false);
    expect(chrome.footerColumns[1]?.some((item) => item.label === "商业")).toBe(true);
  });
});
