# Q-daily Markdown Longform Design

## Goal

Upgrade Q-daily so editorial longform articles can live as Markdown files in the repository while still rendering with a deliberate, magazine-like layout that preserves images, captions, section rhythm, and reading tone.

## Scope

In scope:
- Repository-backed Markdown article source under `content/articles`
- Frontmatter metadata for title, excerpt, slug, date, author, category, tags, reading time, palette, and hero media
- Controlled longform Markdown parser for headings, paragraphs, inline emphasis, links, images, and captions
- A dedicated longform article template for Q-daily-style feature stories
- Integration into the shared content source so longform Markdown articles appear in article detail routes, search, and related recommendations
- Import the Zhang Xue feature as the first real longform article

Out of scope:
- Arbitrary HTML in content files
- General MDX / arbitrary React components in content
- WYSIWYG editing for repository-based longform articles
- Video, audio, or embeddable widgets
- General-purpose rich text CMS authoring

## Content Model

Markdown longform articles are file-based, not stored in Supabase. Each file contains:

- Frontmatter
  - `title`
  - `slug`
  - `excerpt`
  - `publishedAt`
  - `author`
  - `readingTime`
  - `category`
  - `tags`
  - `palette`
  - `coverAlt`
  - `heroImage`
  - `heroCaption`
- Body markdown
  - paragraphs
  - `##` and `###` section headings
  - images via `![alt](src)`
  - captions as the italic paragraph immediately following an image
  - links and inline emphasis

The parser stays intentionally narrow. Unsupported Markdown is treated as plain paragraph text instead of introducing a partially broken rendering model.

## Rendering Strategy

Longform stories do not use the existing standard article template. They render through a new Q-daily longform page built around:

- a stronger hero block with image and caption
- a vertical reading rail for date / category / metadata
- wider paragraph rhythm
- section-heading pacing
- in-flow editorial image breaks
- separate caption styling
- a lighter recommendation block at the bottom

The regular article layout remains unchanged for seeded and database-backed standard stories.

## Content Repository

The content source becomes a merged repository:

- Seed fallback articles
- Supabase-backed standard articles
- File-backed markdown longform articles

Markdown articles are available even if Supabase is absent. When repository content and Supabase share a slug, file-backed longform content wins for that slug because it is the explicit editorial source of truth.

## UX Rules

- Longform stories must feel intentionally designed, not like a default blog renderer.
- Image captions should remain attached to their media block.
- The article list and search pages should surface longform stories without exposing internal implementation details.
- The first imported Zhang Xue feature should preserve all major images, captions, section breaks, and narrative pacing from the source markdown.

## Testing

Add coverage for:
- frontmatter parsing
- markdown block parsing for headings, images, captions, and paragraphs
- merged repository behavior
- longform article component rendering
- regression coverage so standard article routes still work
