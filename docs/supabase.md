# Supabase Data Design

## Why this schema

- `articles` uses `slug` as the primary key because the whole site is route-driven by slugs.
- `article_blocks` stores正文段落，避免把长文内容塞成单一大字段，后续也方便扩展成图片、引言、分隔标题等 block。
- `article_tags` is a join table so标签可以复用，查询分类页、标签页和相关推荐都更直接。
- `homepage_modules` stores首页的策展模块位置信息和文案覆盖，保证首页不是单纯“按时间列文章”，而是可编辑的版面。

## Tables

- `authors`
- `categories`
- `tags`
- `articles`
- `article_blocks`
- `article_tags`
- `homepage_modules`
- `profiles`
- `article_likes`
- `article_bookmarks`
- `comments`

## Reader launch additions

- `profiles` 把 Supabase Auth 用户和站内读者档案关联起来，也承担管理员标记。
- `article_likes` 和 `article_bookmarks` 分别记录互动关系，避免把用户行为直接塞回文章主表。
- `comments` 使用 `pending / approved / rejected / hidden` 状态来支撑先审后发。
- `public_article_engagement` 与 `public_article_comments` 视图给前台互动读取提供稳定入口。
- `admin_article_engagement` 与 `admin_user_overview` 为后续后台页面准备聚合数据。

## Article management additions

- `articles.status` 区分 `draft` 和 `published`，让后台可以先保存草稿再决定是否上线。
- `articles.published_at` 允许为空，未发布文章不会被前台文章页、分类页、标签页和搜索页读取到。
- `articles.updated_by` 记录最近一次编辑该文章的管理员。
- `article_blocks` 继续作为正文段落存储层，编辑器以“多段落文本”方式回写这一张表。
- `article_tags` 继续负责文章与标签的关系，编辑器保存时会整批重写当前文章的标签集合。
- `articles` / `article_blocks` / `article_tags` 的 RLS 现在只对公众暴露已发布内容，管理员才有完整管理权限。

## Integration contract

- 页面默认优先读取 Supabase。
- 当 `NEXT_PUBLIC_SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 未配置，仓储会自动回退到本地种子数据。
- 这样本地开发、测试、Vercel 预览和正式接库可以共存，不会让页面在缺环境变量时直接失效。

## Setup

1. 在 Supabase 新项目里依次执行：
   - `supabase/migrations/202603310001_initial_schema.sql`
   - `supabase/migrations/202603310002_reader_launch.sql`
   - `supabase/migrations/202603310003_article_management.sql`
2. 执行 `supabase/seed.sql`
3. 配置环境变量：
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 在 Supabase Auth 中启用邮箱 OTP / magic link 登录。
5. 重新启动 Next.js
