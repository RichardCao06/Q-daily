# Q-daily Reader Launch Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first reader-facing production layer to Q-daily with OTP auth, profiles, article interactions, moderated comments, and the admin foundations needed to operate them.

**Architecture:** Keep editorial rendering in the existing App Router structure, add authenticated reader features through Supabase-backed route handlers and client islands, and rely on Row Level Security to protect data ownership. Ship the backend schema and the first interaction surfaces before expanding into full account and admin management screens.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Auth, Supabase Postgres, Vitest, Testing Library

---

## Chunk 1: Auth And Data Foundations

### Task 1: Extend Supabase schema for reader product data

**Files:**
- Create: `supabase/migrations/202603310002_reader_launch.sql`
- Modify: `src/lib/supabase/database.types.ts`
- Test: `src/lib/reader-data.test.ts`

- [ ] Write a failing test covering the new typed table and status unions expected by the reader data layer.
- [ ] Run the targeted test to verify the missing types fail for the expected reason.
- [ ] Add the SQL migration for `profiles`, `article_likes`, `article_bookmarks`, `comments`, admin views, helper functions, and RLS policies.
- [ ] Update `database.types.ts` with the new tables and view row types.
- [ ] Run the targeted test again and confirm it passes.

### Task 2: Add Supabase browser and token-aware server clients

**Files:**
- Create: `src/lib/supabase/browser.ts`
- Modify: `src/lib/supabase/server.ts`
- Create: `src/lib/auth/session.ts`
- Test: `src/lib/auth/session.test.ts`

- [ ] Write a failing test for extracting a bearer token and rejecting missing auth.
- [ ] Run the targeted test and confirm the failure is about missing helpers.
- [ ] Add the browser client and token-aware server helpers.
- [ ] Implement session parsing helpers for route handlers.
- [ ] Run the targeted test and confirm it passes.

## Chunk 2: Reader Interactions

### Task 3: Build reader engagement repository and route handlers

**Files:**
- Create: `src/lib/reader-data.ts`
- Create: `src/app/api/articles/[slug]/engagement/route.ts`
- Create: `src/app/api/articles/[slug]/like/route.ts`
- Create: `src/app/api/articles/[slug]/bookmark/route.ts`
- Create: `src/app/api/articles/[slug]/comments/route.ts`
- Test: `src/lib/reader-data.test.ts`

- [ ] Write failing tests for engagement payload shaping and comment visibility rules.
- [ ] Run the targeted tests and confirm they fail correctly.
- [ ] Implement the repository helpers and article interaction route handlers.
- [ ] Re-run the targeted tests until green.

### Task 4: Add login flow and article interaction UI

**Files:**
- Create: `src/components/auth/login-panel.tsx`
- Create: `src/components/auth/login-panel.module.css`
- Create: `src/components/site/article-engagement.tsx`
- Create: `src/components/site/article-engagement.module.css`
- Modify: `src/components/site/article-page.tsx`
- Create: `src/app/account/login/page.tsx`
- Test: `src/components/site/article-page.test.tsx`
- Test: `src/components/auth/login-panel.test.tsx`

- [ ] Write failing component tests for the login panel and article interaction module.
- [ ] Run the targeted tests and confirm the current article page is missing the new UI.
- [ ] Implement the OTP login panel and interactive article engagement island.
- [ ] Update the article page to render real interaction sections instead of static placeholder comments.
- [ ] Re-run the targeted tests until green.

## Chunk 3: Account And Admin Foundations

### Task 5: Add personal center data endpoints and pages

**Files:**
- Create: `src/app/api/account/summary/route.ts`
- Create: `src/components/account/account-shell.tsx`
- Create: `src/components/account/account-shell.module.css`
- Create: `src/app/account/page.tsx`
- Create: `src/app/account/likes/page.tsx`
- Create: `src/app/account/bookmarks/page.tsx`
- Create: `src/app/account/comments/page.tsx`
- Test: `src/components/account/account-shell.test.tsx`

- [ ] Write failing tests for rendering account sections and comment moderation states.
- [ ] Run the targeted tests to confirm the pages are not implemented yet.
- [ ] Implement account summary APIs and the account route set.
- [ ] Re-run the targeted tests until green.

### Task 6: Add admin overview and moderation routes

**Files:**
- Create: `src/app/api/admin/summary/route.ts`
- Create: `src/app/api/admin/comments/route.ts`
- Create: `src/app/api/admin/comments/[id]/route.ts`
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/articles/route.ts`
- Create: `src/components/admin/admin-shell.tsx`
- Create: `src/components/admin/admin-shell.module.css`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/comments/page.tsx`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/articles/page.tsx`
- Test: `src/components/admin/admin-shell.test.tsx`

- [ ] Write failing tests for admin empty/loading states and moderation actions.
- [ ] Run the targeted tests and confirm the new admin UI is absent.
- [ ] Implement admin route handlers and pages with admin-only access checks.
- [ ] Re-run the targeted tests until green.

## Chunk 4: Verification And Documentation

### Task 7: Refresh docs, Notion status, and production checks

**Files:**
- Modify: `README.md`
- Modify: `docs/supabase.md`
- Modify: `docs/superpowers/specs/2026-03-31-q-daily-reader-launch-design.md`
- Modify: `docs/superpowers/plans/2026-03-31-q-daily-reader-launch.md`

- [ ] Update the repository docs with auth and reader-launch setup notes.
- [ ] Mirror the requirements and execution task list into the Notion `Q-daily` project.
- [ ] Mark completed tasks in Notion as implementation lands and move the project status to match reality.
- [ ] Run `pnpm test`, `pnpm lint`, and `pnpm build` before calling the milestone complete.
