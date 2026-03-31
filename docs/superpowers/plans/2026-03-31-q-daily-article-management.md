# Q-daily Article Management Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight admin CMS so Q-daily editors can create drafts, edit articles, and publish or unpublish stories from the app itself.

**Architecture:** Extend the Supabase article schema with editorial status fields, keep paragraph content in `article_blocks`, and add admin-only route handlers plus focused editor screens inside the existing App Router admin area. Public content loading will filter to published articles only, while admin routes use the service layer for full-record access and mutations.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Vitest, Testing Library

---

### Task 1: Extend article schema and public filtering

**Files:**
- Create: `supabase/migrations/202603310003_article_management.sql`
- Modify: `src/lib/supabase/database.types.ts`
- Modify: `src/lib/content-source.ts`
- Test: `src/lib/content-source.test.ts`

- [ ] Step 1: Write failing tests for draft filtering and new article fields.
- [ ] Step 2: Run `pnpm test src/lib/content-source.test.ts` and confirm the new expectations fail.
- [ ] Step 3: Add the migration and generated type updates for article status management.
- [ ] Step 4: Update public content loading to return only published articles while preserving fallback seed behavior.
- [ ] Step 5: Run `pnpm test src/lib/content-source.test.ts` and confirm it passes.

### Task 2: Add admin article management service and APIs

**Files:**
- Modify: `src/lib/reader-service.ts`
- Create: `src/app/api/admin/articles/route.ts`
- Create: `src/app/api/admin/articles/[slug]/route.ts`
- Create: `src/app/api/admin/articles/[slug]/publish/route.ts`
- Create: `src/app/api/admin/articles/[slug]/unpublish/route.ts`
- Test: `src/lib/reader-data.test.ts`

- [ ] Step 1: Write failing tests for admin article listing, detail loading, create/update, publish, and unpublish helpers.
- [ ] Step 2: Run `pnpm test src/lib/reader-data.test.ts` and confirm the new expectations fail.
- [ ] Step 3: Implement the minimal service helpers and route handlers with admin checks.
- [ ] Step 4: Re-run `pnpm test src/lib/reader-data.test.ts` and confirm it passes.

### Task 3: Build the article editor UI

**Files:**
- Create: `src/components/admin/article-editor.tsx`
- Create: `src/components/admin/article-editor.module.css`
- Create: `src/components/admin/article-editor.test.tsx`
- Modify: `src/components/admin/admin-shell.tsx`
- Modify: `src/components/admin/admin-shell.module.css`
- Create: `src/app/admin/articles/page.tsx`
- Create: `src/app/admin/articles/new/page.tsx`
- Create: `src/app/admin/articles/[slug]/page.tsx`

- [ ] Step 1: Write failing component tests for the admin article list and editor states.
- [ ] Step 2: Run `pnpm test src/components/admin/article-editor.test.tsx src/components/admin/admin-shell.test.tsx` and confirm failures.
- [ ] Step 3: Build the article list cards, draft/published state, and create/edit form with paragraph serialization.
- [ ] Step 4: Re-run the targeted component tests and confirm they pass.

### Task 4: Verify the complete publishing flow

**Files:**
- Modify: `docs/supabase.md`
- Modify: `docs/superpowers/plans/2026-03-31-q-daily-article-management.md`

- [ ] Step 1: Add the new article management schema notes to `docs/supabase.md`.
- [ ] Step 2: Run `pnpm test`.
- [ ] Step 3: Run `pnpm lint`.
- [ ] Step 4: Run `pnpm build`.
- [ ] Step 5: Sync status and verification results back to Notion tasks and bug tracking.
