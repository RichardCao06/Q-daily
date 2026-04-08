# Q-daily

一个使用 Next.js 复刻 QDaily 编辑式新闻站点体验的项目。

## 本地开发

```bash
pnpm install
pnpm dev
```

默认访问 [http://localhost:3000](http://localhost:3000)。

## Supabase 集成

项目已经接入 Supabase 数据层。页面会优先从 Supabase 读取文章、分类、标签、首页策展模块；如果环境变量缺失，会自动回退到本地种子数据。读者侧的登录、点赞、收藏、评论功能则需要 Supabase 可用。

1. 复制环境变量模板

```bash
cp .env.example .env.local
```

2. 配置：

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. 在 Supabase 执行：

- `supabase/migrations/202603310001_initial_schema.sql`
- `supabase/migrations/202603310002_reader_launch.sql`
- `supabase/seed.sql`

4. 在 Supabase Auth 中启用邮箱 OTP / magic link 登录，并把站点 URL 配置到当前环境。

更详细的表结构设计见 [docs/supabase.md](./docs/supabase.md)。

## 质量检查

```bash
pnpm test
pnpm lint
pnpm build
```
