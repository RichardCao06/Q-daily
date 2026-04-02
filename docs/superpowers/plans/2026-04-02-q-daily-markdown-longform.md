# Q-daily Markdown Longform Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add repository-backed Markdown longform articles with a dedicated editorial template and import the Zhang Xue feature into Q-daily.

**Architecture:** Keep existing seed and Supabase article pipelines for standard stories, add a file-backed markdown content loader for longform stories, and branch the article detail route by article layout type. Longform rendering uses a controlled parser and dedicated components so design intent stays tight while content remains easy to author in Markdown.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Node filesystem APIs, Vitest, Testing Library

---

### Task 1: Add the longform content parser

**Files:**
- Create: `src/lib/markdown-articles.ts`
- Create: `src/lib/markdown-articles.test.ts`
- Create: `content/articles/zhangxue-profile-editorial-reillustrated.md`
- Create: `public/editorial/zhangxue/*`

- [ ] Step 1: Write failing parser tests for frontmatter, headings, images, captions, and paragraph grouping.
- [ ] Step 2: Run `pnpm test src/lib/markdown-articles.test.ts` and confirm the parser tests fail.
- [ ] Step 3: Implement the minimal frontmatter and block parser.
- [ ] Step 4: Import the Zhang Xue article and copy its media assets into `public/editorial/zhangxue`.
- [ ] Step 5: Re-run `pnpm test src/lib/markdown-articles.test.ts` and confirm it passes.

### Task 2: Merge markdown longform stories into the shared repository

**Files:**
- Modify: `src/lib/qdaily-data.ts`
- Modify: `src/lib/content-source.ts`
- Modify: `src/lib/content-source.test.ts`
- Modify: `src/lib/metadata.ts`

- [ ] Step 1: Write failing repository tests for merged markdown + existing article sources.
- [ ] Step 2: Run `pnpm test src/lib/content-source.test.ts` and confirm the new expectations fail.
- [ ] Step 3: Extend the article model with longform-specific fields and merge file-backed stories into the shared content source.
- [ ] Step 4: Update article metadata generation to support longform hero content.
- [ ] Step 5: Re-run `pnpm test src/lib/content-source.test.ts` and confirm it passes.

### Task 3: Build the longform article template

**Files:**
- Create: `src/components/site/longform-article.tsx`
- Create: `src/components/site/longform-article.module.css`
- Create: `src/components/site/longform-article.test.tsx`
- Modify: `src/components/site/article-page.tsx`
- Modify: `src/components/site/article-page.test.tsx`

- [ ] Step 1: Write failing component tests for the longform hero, in-flow media blocks, and captions.
- [ ] Step 2: Run `pnpm test src/components/site/longform-article.test.tsx src/components/site/article-page.test.tsx` and confirm failures.
- [ ] Step 3: Implement the longform article template and branch the article page by layout type.
- [ ] Step 4: Re-run the targeted component tests and confirm they pass.

### Task 4: Verify end-to-end article visibility

**Files:**
- Modify: `docs/superpowers/plans/2026-04-02-q-daily-markdown-longform.md`

- [ ] Step 1: Run `pnpm test`.
- [ ] Step 2: Run `pnpm lint`.
- [ ] Step 3: Run `pnpm build`.
- [ ] Step 4: Update project tracking and summarize any bugs found during verification.
