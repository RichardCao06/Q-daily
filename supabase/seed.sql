insert into public.authors (slug, name)
values ('richard-cao', 'Richard Cao')
on conflict (slug) do update set name = excluded.name;

insert into public.categories (slug, name, description)
values
  ('business', '商业', '商业栏目'),
  ('smart', '智能', '智能栏目'),
  ('design', '设计', '设计栏目'),
  ('fashion', '时尚', '时尚栏目'),
  ('entertainment', '娱乐', '娱乐栏目'),
  ('culture', '文化', '文化栏目'),
  ('gaming', '游戏', '游戏栏目')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.tags (slug, name, description)
values
  ('longform', '长文章', '长文章集合'),
  ('ten-photos', '10 个图', '图集内容'),
  ('top-15', 'Top 15', '榜单内容'),
  ('editorial-design', '编辑设计', '编辑设计主题'),
  ('product-thinking', '产品思考', '产品主题'),
  ('newsroom', '新闻编辑部', '新闻编辑部主题'),
  ('culture-shift', '文化观察', '文化观察主题')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.articles (
  slug,
  legacy_id,
  title,
  excerpt,
  published_at,
  comments_count,
  likes_count,
  palette,
  author_slug,
  reading_time,
  cover_alt,
  category_slug
)
values
  ('rebuild-a-newsroom-wall', 'story-1', '把首页当成品牌封面来设计，而不是普通的信息列表。', '醒目的分类角标、密集标题和强对比色块，是这个版本 QDaily 最鲜明的记忆点。', '2026-03-30T10:24:00+08:00', 20, 56, 'linear-gradient(135deg, #d16a3b 0%, #3d231a 100%)', 'richard-cao', '8 分钟', '黄黑色块与编辑墙拼贴', 'business'),
  ('editorial-rhythm-and-density', 'story-2', '头部导航像新闻纸页眉，首屏混排像编辑在版面上排兵布阵。', '这次复刻会优先保留这种编辑感，而不是追求一个现代模板式首页。', '2026-03-30T11:08:00+08:00', 12, 34, 'linear-gradient(135deg, #29353f 0%, #10161a 100%)', 'richard-cao', '6 分钟', '暗色纸张与标题条块', 'culture'),
  ('micro-differences-between-cards', 'story-3', '每张卡片都需要自己的节奏，统一里要有细小而明确的差别。', '卡片的图片区、角标、标题行长和底部统计共同决定阅读速度。', '2026-03-30T11:39:00+08:00', 9, 28, 'linear-gradient(135deg, #efc13c 0%, #5a4512 100%)', 'richard-cao', '5 分钟', '亮黄卡片与黑色边条', 'design'),
  ('density-fits-qdaily', 'story-4', '不是所有新闻站都适合这种密度，但 QDaily 的气质恰好需要它。', '在秩序清晰的前提下，越密越能形成一种被编辑过的饱满感。', '2026-03-30T12:15:00+08:00', 14, 43, 'linear-gradient(135deg, #1b2e36 0%, #385d63 100%)', 'richard-cao', '7 分钟', '蓝灰色信息墙', 'smart'),
  ('yellow-and-black-brand-skeleton', 'story-5', '黄与黑不是点缀，而是整个界面的品牌骨架。', '按钮、分隔线、数据卡和 hover 状态都围绕这组颜色建立辨识度。', '2026-03-30T12:48:00+08:00', 8, 31, 'linear-gradient(135deg, #f3d967 0%, #6c4a06 100%)', 'richard-cao', '4 分钟', '高对比黄黑视觉', 'fashion'),
  ('next-card-should-also-be-worth-reading', 'story-6', '好的杂志式首页会让用户觉得下一张卡片也值得看。', '信息瀑布必须有节奏变化，否则它只会变成长长的疲劳滚动。', '2026-03-30T13:10:00+08:00', 17, 37, 'linear-gradient(135deg, #512f45 0%, #181017 100%)', 'richard-cao', '5 分钟', '暗色娱乐版面', 'entertainment'),
  ('feature-cards-need-clear-boundaries', 'story-7', '专题卡和常规文章卡的边界要明显，这样首屏才会像一份刊物。', '专题使用更厚重的视觉和更长的文字区，常规卡片则更利落、重复、清晰。', '2026-03-30T13:40:00+08:00', 7, 24, 'linear-gradient(135deg, #7f7a55 0%, #262212 100%)', 'richard-cao', '6 分钟', '专题卡与杂志跨页', 'culture'),
  ('cms-ready-editorial-system', 'story-8', '如果后续接 CMS，这套首页只需要换数据源，不需要推倒重来。', '组件拆分会围绕栏目、专题、文章和编辑推荐这些稳定内容模型来做。', '2026-03-30T14:05:00+08:00', 11, 29, 'linear-gradient(135deg, #8b431f 0%, #21130d 100%)', 'richard-cao', '6 分钟', '编辑系统与内容模型', 'business')
on conflict (slug) do update set
  legacy_id = excluded.legacy_id,
  title = excluded.title,
  excerpt = excluded.excerpt,
  published_at = excluded.published_at,
  comments_count = excluded.comments_count,
  likes_count = excluded.likes_count,
  palette = excluded.palette,
  author_slug = excluded.author_slug,
  reading_time = excluded.reading_time,
  cover_alt = excluded.cover_alt,
  category_slug = excluded.category_slug;

delete from public.article_blocks;
insert into public.article_blocks (article_slug, position, kind, content)
values
  ('rebuild-a-newsroom-wall', 1, 'paragraph', '复刻 QDaily 的关键不是把卡片数量堆到足够多，而是重新建立一种被编辑过的阅读秩序。首页像封面，栏位像版面，用户进入之后首先感知到的是气质而不是模块清单。'),
  ('rebuild-a-newsroom-wall', 2, 'paragraph', '这也是为什么头部、Hero 和文章流必须共用同一套视觉语言。黄色是抓手，黑色是骨架，白色和灰色留给内容本身，三者一起把品牌感钉住。'),
  ('rebuild-a-newsroom-wall', 3, 'paragraph', '当我们把站点数据层独立出来之后，后续无论接 CMS、接数据库还是继续做专题页，视觉表达都不会被数据来源反向牵着走。'),
  ('editorial-rhythm-and-density', 1, 'paragraph', 'QDaily 的头部不是普通导航栏，它更像纸媒页眉的数字版本。每个入口都要短、硬、直接，留给内容区更多张力。'),
  ('editorial-rhythm-and-density', 2, 'paragraph', '首页首屏则像一本杂志被摊开之后的第一个跨页，Hero 不是单纯的大图，而是编辑立场最直接的展示。'),
  ('editorial-rhythm-and-density', 3, 'paragraph', '这种气质决定了页面不能被平均化设计稀释，否则用户很快就会把它和任何信息流站点混为一谈。'),
  ('micro-differences-between-cards', 1, 'paragraph', '统一视觉系统不等于所有卡片都长得一样。真正决定首页节奏的，往往是标题的粗细、图片区比例和底部统计行的密度变化。'),
  ('micro-differences-between-cards', 2, 'paragraph', '这种细差异能让用户在快速滚动中仍然感知到节奏变化，从而保持继续阅读的动力。'),
  ('density-fits-qdaily', 1, 'paragraph', '高密度编排的前提是足够强的结构控制，否则它只会变成拥挤。QDaily 的成功恰恰在于它把密度和秩序同时做到了。'),
  ('density-fits-qdaily', 2, 'paragraph', '技术实现上我们会用可控的 grid 和数据映射，而不是把一切都交给随机瀑布流算法。'),
  ('yellow-and-black-brand-skeleton', 1, 'paragraph', '品牌色如果只停留在 Logo 上，页面会很快失去识别度。QDaily 的黄黑色真正有效，是因为它参与了界面结构本身。'),
  ('yellow-and-black-brand-skeleton', 2, 'paragraph', '因此我们在组件层也需要把这种颜色关系抽成 token，而不是在 CSS 里到处写字面量。'),
  ('next-card-should-also-be-worth-reading', 1, 'paragraph', '一张卡片真正的作用，不只是让用户点开自己，还要暗示下一张卡片也会有意思。这种期待感来自整体节奏，而不是单条内容。'),
  ('next-card-should-also-be-worth-reading', 2, 'paragraph', '所以首页的信息组织必须像播放列表一样，内容之间彼此接力。'),
  ('feature-cards-need-clear-boundaries', 1, 'paragraph', '专题卡承担的是“解释这个站点是谁”的责任，它们需要更明显的排版重量、更大的呼吸感和更高的识别度。'),
  ('feature-cards-need-clear-boundaries', 2, 'paragraph', '常规卡片则负责维持阅读流速，两者不能混成同一种声音，否则首屏会失去层次。'),
  ('cms-ready-editorial-system', 1, 'paragraph', '真正值得复用的是内容模型，而不是某一个页面截图。只要文章、分类、标签和首页编排之间的关系是稳定的，数据源随时可以替换。'),
  ('cms-ready-editorial-system', 2, 'paragraph', '这也是为什么我们先做共享数据层，再做详情页和分类页模板。');

delete from public.article_tags;
insert into public.article_tags (article_slug, tag_slug)
values
  ('rebuild-a-newsroom-wall', 'longform'),
  ('rebuild-a-newsroom-wall', 'editorial-design'),
  ('rebuild-a-newsroom-wall', 'product-thinking'),
  ('editorial-rhythm-and-density', 'editorial-design'),
  ('editorial-rhythm-and-density', 'culture-shift'),
  ('editorial-rhythm-and-density', 'newsroom'),
  ('micro-differences-between-cards', 'editorial-design'),
  ('micro-differences-between-cards', 'product-thinking'),
  ('density-fits-qdaily', 'newsroom'),
  ('density-fits-qdaily', 'product-thinking'),
  ('yellow-and-black-brand-skeleton', 'editorial-design'),
  ('yellow-and-black-brand-skeleton', 'culture-shift'),
  ('next-card-should-also-be-worth-reading', 'newsroom'),
  ('next-card-should-also-be-worth-reading', 'culture-shift'),
  ('feature-cards-need-clear-boundaries', 'longform'),
  ('feature-cards-need-clear-boundaries', 'editorial-design'),
  ('feature-cards-need-clear-boundaries', 'newsroom'),
  ('cms-ready-editorial-system', 'product-thinking'),
  ('cms-ready-editorial-system', 'newsroom'),
  ('cms-ready-editorial-system', 'editorial-design');

insert into public.homepage_modules (
  slot_key,
  slot_type,
  sort_order,
  article_slug,
  category_label,
  title,
  excerpt,
  href,
  palette
)
values
  ('home-spotlight', 'spotlight', 10, 'rebuild-a-newsroom-wall', '精选专题', 'QDaily Edition #001: A newsroom rebuilt as a magazine wall.', '用高密度卡片、醒目的分类标签和强节奏的编排，把首页重新做成一面值得停留的编辑墙。', '/categories/business', 'linear-gradient(135deg, #0f1316 0%, #30373d 45%, #ffc81f 100%)'),
  ('home-feature-1', 'feature', 20, 'feature-cards-need-clear-boundaries', '文化', '专题卡和常规文章卡的边界要明显，这样首屏才会像一份刊物。', '专题使用更厚重的视觉和更长的文字区，常规卡片则更利落、重复、清晰。', '/articles/feature-cards-need-clear-boundaries', 'linear-gradient(135deg, #7f7a55 0%, #262212 100%)'),
  ('home-feature-2', 'feature', 30, 'micro-differences-between-cards', '设计', '每张卡片都需要自己的节奏，统一里要有细小而明确的差别。', '卡片的图片区、角标、标题行长和底部统计共同决定阅读速度。', '/articles/micro-differences-between-cards', 'linear-gradient(135deg, #efc13c 0%, #5a4512 100%)'),
  ('home-side-latest', 'side_feature', 40, null, '今日要闻', '24', '一页里值得打开的内容更新', '/categories/business', 'linear-gradient(180deg, #1d262a 0%, #111517 100%)'),
  ('home-side-download', 'side_feature', 50, null, 'QDaily App', '保持黄黑色的锋利感', '下载入口、品牌说明和次级 CTA 放在首屏右侧，延续原站的编辑产品感。', '/about', 'linear-gradient(135deg, #f7d21b 0%, #ffea93 100%)')
on conflict (slot_key) do update set
  slot_type = excluded.slot_type,
  sort_order = excluded.sort_order,
  article_slug = excluded.article_slug,
  category_label = excluded.category_label,
  title = excluded.title,
  excerpt = excluded.excerpt,
  href = excluded.href,
  palette = excluded.palette;
