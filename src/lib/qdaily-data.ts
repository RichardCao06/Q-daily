export type Story = {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryHref: string;
  excerpt: string;
  publishedAt: string;
  comments: number;
  likes: number;
  palette: string;
};

export type SpotlightStory = {
  slug: string;
  category: string;
  categoryHref: string;
  title: string;
  excerpt: string;
  palette: string;
};

export type FeaturePanel = {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  palette: string;
  href: string;
};

export type SideFeature = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  palette: string;
  href: string;
};

export type HomePageData = {
  spotlightStory: SpotlightStory;
  sideFeatures: SideFeature[];
  featurePanels: FeaturePanel[];
  feedStories: Story[];
};

export type SiteLink = {
  label: string;
  href: string;
};

export type SiteCategory = {
  slug: string;
  name: string;
  href: string;
};

export type SiteTag = {
  slug: string;
  name: string;
  href: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  comments: number;
  likes: number;
  palette: string;
  author: string;
  readingTime: string;
  coverAlt: string;
  body: string[];
  category: SiteCategory;
  tags: SiteTag[];
  layout?: "standard" | "longform";
  source?: "seed" | "supabase" | "markdown";
  heroImage?: {
    src: string;
    alt: string;
    caption?: string;
  };
  longformBlocks?: ArticleLongformBlock[];
};

export type ArticleLongformBlock =
  | {
      type: "paragraph";
      content: string;
    }
  | {
      type: "heading";
      level: 2 | 3;
      content: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    };

const categorySeed = [
  { slug: "business", name: "商业" },
  { slug: "smart", name: "智能" },
  { slug: "design", name: "设计" },
  { slug: "fashion", name: "时尚" },
  { slug: "entertainment", name: "娱乐" },
  { slug: "culture", name: "文化" },
  { slug: "gaming", name: "游戏" },
] as const;

const tagSeed = [
  { slug: "longform", name: "长文章" },
  { slug: "ten-photos", name: "10 个图" },
  { slug: "top-15", name: "Top 15" },
  { slug: "editorial-design", name: "编辑设计" },
  { slug: "product-thinking", name: "产品思考" },
  { slug: "newsroom", name: "新闻编辑部" },
  { slug: "culture-shift", name: "文化观察" },
] as const;

export const siteCategories: SiteCategory[] = categorySeed.map((item) => ({
  ...item,
  href: `/categories/${item.slug}`,
}));

export const siteTags: SiteTag[] = tagSeed.map((item) => ({
  ...item,
  href: `/tags/${item.slug}`,
}));

const categoryMap = new Map(siteCategories.map((item) => [item.slug, item]));
const tagMap = new Map(siteTags.map((item) => [item.slug, item]));

const resolveCategory = (slug: string) => {
  const category = categoryMap.get(slug);
  if (!category) {
    throw new Error(`Unknown category slug: ${slug}`);
  }
  return category;
};

const resolveTags = (slugs: string[]) =>
  slugs.map((slug) => {
    const tag = tagMap.get(slug);
    if (!tag) {
      throw new Error(`Unknown tag slug: ${slug}`);
    }
    return tag;
  });

const articleSeed = [
  {
    id: "story-1",
    slug: "rebuild-a-newsroom-wall",
    title: "把首页当成品牌封面来设计，而不是普通的信息列表。",
    excerpt: "醒目的分类角标、密集标题和强对比色块，是这个版本 QDaily 最鲜明的记忆点。",
    publishedAt: "2026-03-30 10:24",
    comments: 20,
    likes: 56,
    palette: "linear-gradient(135deg, #d16a3b 0%, #3d231a 100%)",
    author: "Richard Cao",
    readingTime: "8 分钟",
    coverAlt: "黄黑色块与编辑墙拼贴",
    categorySlug: "business",
    tagSlugs: ["longform", "editorial-design", "product-thinking"],
    body: [
      "复刻 QDaily 的关键不是把卡片数量堆到足够多，而是重新建立一种被编辑过的阅读秩序。首页像封面，栏位像版面，用户进入之后首先感知到的是气质而不是模块清单。",
      "这也是为什么头部、Hero 和文章流必须共用同一套视觉语言。黄色是抓手，黑色是骨架，白色和灰色留给内容本身，三者一起把品牌感钉住。",
      "当我们把站点数据层独立出来之后，后续无论接 CMS、接数据库还是继续做专题页，视觉表达都不会被数据来源反向牵着走。",
    ],
  },
  {
    id: "story-2",
    slug: "editorial-rhythm-and-density",
    title: "头部导航像新闻纸页眉，首屏混排像编辑在版面上排兵布阵。",
    excerpt: "这次复刻会优先保留这种编辑感，而不是追求一个现代模板式首页。",
    publishedAt: "2026-03-30 11:08",
    comments: 12,
    likes: 34,
    palette: "linear-gradient(135deg, #29353f 0%, #10161a 100%)",
    author: "Richard Cao",
    readingTime: "6 分钟",
    coverAlt: "暗色纸张与标题条块",
    categorySlug: "culture",
    tagSlugs: ["editorial-design", "culture-shift", "newsroom"],
    body: [
      "QDaily 的头部不是普通导航栏，它更像纸媒页眉的数字版本。每个入口都要短、硬、直接，留给内容区更多张力。",
      "首页首屏则像一本杂志被摊开之后的第一个跨页，Hero 不是单纯的大图，而是编辑立场最直接的展示。",
      "这种气质决定了页面不能被平均化设计稀释，否则用户很快就会把它和任何信息流站点混为一谈。",
    ],
  },
  {
    id: "story-3",
    slug: "micro-differences-between-cards",
    title: "每张卡片都需要自己的节奏，统一里要有细小而明确的差别。",
    excerpt: "卡片的图片区、角标、标题行长和底部统计共同决定阅读速度。",
    publishedAt: "2026-03-30 11:39",
    comments: 9,
    likes: 28,
    palette: "linear-gradient(135deg, #efc13c 0%, #5a4512 100%)",
    author: "Richard Cao",
    readingTime: "5 分钟",
    coverAlt: "亮黄卡片与黑色边条",
    categorySlug: "design",
    tagSlugs: ["editorial-design", "product-thinking"],
    body: [
      "统一视觉系统不等于所有卡片都长得一样。真正决定首页节奏的，往往是标题的粗细、图片区比例和底部统计行的密度变化。",
      "这种细差异能让用户在快速滚动中仍然感知到节奏变化，从而保持继续阅读的动力。",
    ],
  },
  {
    id: "story-4",
    slug: "density-fits-qdaily",
    title: "不是所有新闻站都适合这种密度，但 QDaily 的气质恰好需要它。",
    excerpt: "在秩序清晰的前提下，越密越能形成一种被编辑过的饱满感。",
    publishedAt: "2026-03-30 12:15",
    comments: 14,
    likes: 43,
    palette: "linear-gradient(135deg, #1b2e36 0%, #385d63 100%)",
    author: "Richard Cao",
    readingTime: "7 分钟",
    coverAlt: "蓝灰色信息墙",
    categorySlug: "smart",
    tagSlugs: ["newsroom", "product-thinking"],
    body: [
      "高密度编排的前提是足够强的结构控制，否则它只会变成拥挤。QDaily 的成功恰恰在于它把密度和秩序同时做到了。",
      "技术实现上我们会用可控的 grid 和数据映射，而不是把一切都交给随机瀑布流算法。",
    ],
  },
  {
    id: "story-5",
    slug: "yellow-and-black-brand-skeleton",
    title: "黄与黑不是点缀，而是整个界面的品牌骨架。",
    excerpt: "按钮、分隔线、数据卡和 hover 状态都围绕这组颜色建立辨识度。",
    publishedAt: "2026-03-30 12:48",
    comments: 8,
    likes: 31,
    palette: "linear-gradient(135deg, #f3d967 0%, #6c4a06 100%)",
    author: "Richard Cao",
    readingTime: "4 分钟",
    coverAlt: "高对比黄黑视觉",
    categorySlug: "fashion",
    tagSlugs: ["editorial-design", "culture-shift"],
    body: [
      "品牌色如果只停留在 Logo 上，页面会很快失去识别度。QDaily 的黄黑色真正有效，是因为它参与了界面结构本身。",
      "因此我们在组件层也需要把这种颜色关系抽成 token，而不是在 CSS 里到处写字面量。",
    ],
  },
  {
    id: "story-6",
    slug: "next-card-should-also-be-worth-reading",
    title: "好的杂志式首页会让用户觉得下一张卡片也值得看。",
    excerpt: "信息瀑布必须有节奏变化，否则它只会变成长长的疲劳滚动。",
    publishedAt: "2026-03-30 13:10",
    comments: 17,
    likes: 37,
    palette: "linear-gradient(135deg, #512f45 0%, #181017 100%)",
    author: "Richard Cao",
    readingTime: "5 分钟",
    coverAlt: "暗色娱乐版面",
    categorySlug: "entertainment",
    tagSlugs: ["newsroom", "culture-shift"],
    body: [
      "一张卡片真正的作用，不只是让用户点开自己，还要暗示下一张卡片也会有意思。这种期待感来自整体节奏，而不是单条内容。",
      "所以首页的信息组织必须像播放列表一样，内容之间彼此接力。",
    ],
  },
  {
    id: "story-7",
    slug: "feature-cards-need-clear-boundaries",
    title: "专题卡和常规文章卡的边界要明显，这样首屏才会像一份刊物。",
    excerpt: "专题使用更厚重的视觉和更长的文字区，常规卡片则更利落、重复、清晰。",
    publishedAt: "2026-03-30 13:40",
    comments: 7,
    likes: 24,
    palette: "linear-gradient(135deg, #7f7a55 0%, #262212 100%)",
    author: "Richard Cao",
    readingTime: "6 分钟",
    coverAlt: "专题卡与杂志跨页",
    categorySlug: "culture",
    tagSlugs: ["longform", "editorial-design", "newsroom"],
    body: [
      "专题卡承担的是“解释这个站点是谁”的责任，它们需要更明显的排版重量、更大的呼吸感和更高的识别度。",
      "常规卡片则负责维持阅读流速，两者不能混成同一种声音，否则首屏会失去层次。",
    ],
  },
  {
    id: "story-8",
    slug: "cms-ready-editorial-system",
    title: "如果后续接 CMS，这套首页只需要换数据源，不需要推倒重来。",
    excerpt: "组件拆分会围绕栏目、专题、文章和编辑推荐这些稳定内容模型来做。",
    publishedAt: "2026-03-30 14:05",
    comments: 11,
    likes: 29,
    palette: "linear-gradient(135deg, #8b431f 0%, #21130d 100%)",
    author: "Richard Cao",
    readingTime: "6 分钟",
    coverAlt: "编辑系统与内容模型",
    categorySlug: "business",
    tagSlugs: ["product-thinking", "newsroom", "editorial-design"],
    body: [
      "真正值得复用的是内容模型，而不是某一个页面截图。只要文章、分类、标签和首页编排之间的关系是稳定的，数据源随时可以替换。",
      "这也是为什么我们先做共享数据层，再做详情页和分类页模板。",
    ],
  },
] as const;

export const articles: Article[] = articleSeed.map((article) => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt,
  publishedAt: article.publishedAt,
  comments: article.comments,
  likes: article.likes,
  palette: article.palette,
  author: article.author,
  readingTime: article.readingTime,
  coverAlt: article.coverAlt,
  body: [...article.body],
  category: resolveCategory(article.categorySlug),
  tags: resolveTags([...article.tagSlugs]),
}));

const sortByPublishedAt = (left: Article, right: Article) =>
  new Date(right.publishedAt.replace(" ", "T")).getTime() - new Date(left.publishedAt.replace(" ", "T")).getTime();

export const channelLinks: SiteLink[] = [
  ...siteTags.slice(0, 3).map((item) => ({ label: item.name, href: item.href })),
  ...siteCategories.map((item) => ({ label: item.name, href: item.href })),
];

export const mainCategories = channelLinks.map((item) => item.label);

export const primaryLinks: SiteLink[] = [
  { label: "好奇心研究所", href: "/labs" },
  { label: "栏目中心", href: "/special-columns" },
];

export const utilityLinks: SiteLink[] = [
  { label: "APP", href: "/about" },
  { label: "搜索", href: "/search" },
  { label: "关于我们", href: "/about" },
];

export const spotlightStory: SpotlightStory = {
  slug: articles[0].slug,
  category: "精选专题",
  categoryHref: articles[0].category.href,
  title: "QDaily Edition #001: A newsroom rebuilt as a magazine wall.",
  excerpt: "用高密度卡片、醒目的分类标签和强节奏的编排，把首页重新做成一面值得停留的编辑墙。",
  palette: "linear-gradient(135deg, #0f1316 0%, #30373d 45%, #ffc81f 100%)",
};

export const sideFeatures: SideFeature[] = [
  {
    id: "latest",
    category: "今日要闻",
    title: "24",
    excerpt: "一页里值得打开的内容更新",
    palette: "linear-gradient(180deg, #1d262a 0%, #111517 100%)",
    href: "/categories/business",
  },
  {
    id: "download",
    category: "QDaily App",
    title: "保持黄黑色的锋利感",
    excerpt: "下载入口、品牌说明和次级 CTA 放在首屏右侧，延续原站的编辑产品感。",
    palette: "linear-gradient(135deg, #f7d21b 0%, #ffea93 100%)",
    href: "/about",
  },
];

export const featurePanels: FeaturePanel[] = [articles[6], articles[2]].map((article) => ({
  id: article.id,
  slug: article.slug,
  category: article.category.name,
  title: article.title,
  excerpt: article.excerpt,
  palette: article.palette,
  href: `/articles/${article.slug}`,
}));

export const feedStories: Story[] = [...articles].sort(sortByPublishedAt).map((article) => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  category: article.category.name,
  categoryHref: article.category.href,
  excerpt: article.excerpt,
  publishedAt: article.publishedAt,
  comments: article.comments,
  likes: article.likes,
  palette: article.palette,
}));

export const footerColumns: SiteLink[][] = [
  [
    { label: "首页", href: "/" },
    { label: "长文章", href: "/tags/longform" },
    { label: "TOP 15", href: "/tags/top-15" },
    { label: "10 个图", href: "/tags/ten-photos" },
    { label: "好奇心研究所", href: "/labs" },
    { label: "Medium", href: "/tags/editorial-design" },
  ],
  [
    { label: "商业", href: "/categories/business" },
    { label: "智能", href: "/categories/smart" },
    { label: "设计", href: "/categories/design" },
    { label: "时尚", href: "/categories/fashion" },
    { label: "娱乐", href: "/categories/entertainment" },
    { label: "文化", href: "/categories/culture" },
  ],
  [
    { label: "下载 APP", href: "/about" },
    { label: "登录 / 注册", href: "/account" },
    { label: "订阅", href: "/feed.xml" },
    { label: "微博", href: "https://weibo.com/qdaily" },
    { label: "微信", href: "/about#wechat" },
    { label: "关于我们", href: "/about" },
  ],
];

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return siteCategories.find((category) => category.slug === slug);
}

export function getTagBySlug(slug: string) {
  return siteTags.find((tag) => tag.slug === slug);
}

export function getAllArticleSlugs() {
  return articles.map((article) => article.slug);
}

export function getAllCategorySlugs() {
  return siteCategories.map((category) => category.slug);
}

export function getAllTagSlugs() {
  return siteTags.map((tag) => tag.slug);
}

export function getArticlesByCategory(categorySlug: string) {
  return articles.filter((article) => article.category.slug === categorySlug).sort(sortByPublishedAt);
}

export function getArticlesByTag(tagSlug: string) {
  return articles
    .filter((article) => article.tags.some((tag) => tag.slug === tagSlug))
    .sort(sortByPublishedAt);
}

export function getRelatedArticles(slug: string, count = 3) {
  const current = getArticleBySlug(slug);
  if (!current) {
    return [];
  }

  return articles
    .filter((article) => article.slug !== slug)
    .map((article) => {
      const sharedTagCount = article.tags.filter((tag) => current.tags.some((currentTag) => currentTag.slug === tag.slug)).length;
      const sameCategoryBoost = article.category.slug === current.category.slug ? 10 : 0;

      return {
        article,
        score: sameCategoryBoost + sharedTagCount,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return sortByPublishedAt(left.article, right.article);
    })
    .slice(0, count)
    .map((item) => item.article);
}
