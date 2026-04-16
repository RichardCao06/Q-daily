# Q-daily Article CMS and Storage Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin area the canonical Q-daily publishing workflow with Markdown editing, public Supabase Storage media uploads, and structured article rendering from Supabase.

**Architecture:** Extend the article schema with raw Markdown and hero media metadata, parse Markdown into ordered render blocks on every save, and add an admin media upload route that stores article images in a public Storage bucket. The public site continues reading through the shared content-source layer so article pages, collection cards, and metadata remain consistent.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Database, Supabase Storage, Vitest, Testing Library

---

## Chunk 1: Schema and Persistence

### Task 1: Add failing tests for markdown-backed article persistence

**Files:**
- Modify: `src/lib/article-management.test.ts`
- Modify: `src/lib/markdown-import.test.ts`
- Modify: `src/lib/content-source.test.ts`

- [x] **Step 1: Write the failing tests**

Add expectations that article mutations carry `sourceMarkdown`, hero image URL, and hero caption, and that content loading prefers Supabase hero metadata over legacy block-embedded hero images.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/article-management.test.ts src/lib/markdown-import.test.ts src/lib/content-source.test.ts`
Expected: FAIL because the new article fields and loading behavior do not exist yet.

- [x] **Step 3: Write minimal implementation**

Update validation and import helpers so they accept Markdown source, serialize hero and inline image metadata, and expose the new persistence payload shape.

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/article-management.test.ts src/lib/markdown-import.test.ts src/lib/content-source.test.ts`
Expected: PASS

### Task 2: Add database and storage migrations

**Files:**
- Create: `supabase/migrations/202604160001_article_markdown_and_media.sql`
- Modify: `src/lib/supabase/database.types.ts`

- [x] **Step 1: Write the failing test surrogate**

Document the required schema changes in tests or typed usage first so `database.types.ts` fails type-check expectations without the new columns.

- [x] **Step 2: Run verification to confirm the mismatch**

Run: `npm test -- src/lib/content-source.test.ts`
Expected: FAIL or type expectations remain unmet because the generated types lack `source_markdown` and hero media fields.

- [x] **Step 3: Write minimal implementation**

Add the migration for article fields, tighter RLS, storage bucket creation, and storage policies. Update local Supabase types to match.

- [x] **Step 4: Run verification**

Run: `npm test -- src/lib/content-source.test.ts`
Expected: PASS for the targeted coverage.

## Chunk 2: Admin Services and Routes

### Task 3: Update article management services for Markdown and hero metadata

**Files:**
- Modify: `src/lib/article-management.ts`
- Modify: `src/lib/article-management-service.ts`
- Modify: `src/lib/content-source.ts`

- [x] **Step 1: Write the failing tests**

Add service-level expectations that admin article create/update payloads store `source_markdown`, `hero_image_url`, and `hero_image_caption`, and that public reads map those fields back into `Article.heroImage`.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/article-management.test.ts src/lib/content-source.test.ts`
Expected: FAIL with missing fields or mismatched article shape.

- [x] **Step 3: Write minimal implementation**

Persist the new fields in article service helpers, regenerate blocks from Markdown on every save, and update content loading to support the new hero metadata columns while staying backward compatible with old block data.

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/article-management.test.ts src/lib/content-source.test.ts`
Expected: PASS

### Task 4: Add admin media upload route

**Files:**
- Create: `src/app/api/admin/articles/media/route.ts`
- Create: `src/app/api/admin/articles/media/route.test.ts`
- Modify: `src/lib/article-auth.ts`

- [x] **Step 1: Write the failing test**

Add route-handler tests covering unauthorized requests, non-admin access, and successful upload request shaping.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/api/admin/articles/media/route.test.ts`
Expected: FAIL because the route does not exist.

- [x] **Step 3: Write minimal implementation**

Implement the route handler with admin auth checks, slug-based storage paths, upload to `article-media`, and JSON response containing the public URL.

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/api/admin/articles/media/route.test.ts`
Expected: PASS

## Chunk 3: Admin UI and Verification

### Task 5: Upgrade the admin editor UI to Markdown-first editing

**Files:**
- Modify: `src/components/admin/article-editor.tsx`
- Modify: `src/components/admin/article-editor.test.tsx`
- Modify: `src/app/admin/articles/editor-screen.tsx`

- [x] **Step 1: Write the failing tests**

Add component coverage for hero URL/caption fields, Markdown body editing, and upload callback insertion.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/admin/article-editor.test.tsx`
Expected: FAIL because the new fields and interactions are missing.

- [x] **Step 3: Write minimal implementation**

Update the form model and editor UI so editors can manage hero media fields, edit raw Markdown, upload inline media, and save the resulting payloads.

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/admin/article-editor.test.tsx`
Expected: PASS

### Task 6: Verify the integrated workflow

**Files:**
- Modify: `docs/superpowers/plans/2026-04-16-q-daily-article-cms-storage.md`

- [x] **Step 1: Run the focused article/admin test suite**

Run: `npm test -- src/lib/article-management.test.ts src/lib/markdown-import.test.ts src/lib/content-source.test.ts src/components/admin/article-editor.test.tsx src/app/api/admin/articles/media/route.test.ts`
Expected: PASS

- [x] **Step 2: Run the project verification commands**

Run: `npm test`
Expected: PASS

Run: `npm run lint`
Expected: PASS

- [x] **Step 3: Record verification status in this plan**

Update the checkboxes and add a short verification note once the implementation is complete.

**Verification note:** `pnpm test`, `pnpm run lint`, and `pnpm build` all passed in the isolated worktree on 2026-04-16. The new migration was written locally, but it was not applied to the remote Supabase project from this session because the Supabase CLI is not installed or linked in the workspace.
