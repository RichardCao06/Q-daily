# Q-daily Article CMS and Storage Design

## Goal

Make the admin area the canonical publishing workflow for Q-daily while preserving Markdown as the primary editing format and moving article images into public Supabase Storage.

## Scope

In scope:
- Markdown-first article editing in the admin area
- Supabase as the canonical published article store
- Public Supabase Storage bucket for article media
- Article create, edit, draft, publish, and unpublish flows
- Media upload from the admin area with Markdown insertion support
- Public site rendering from a unified content source

Out of scope:
- Editorial review stages beyond draft and published
- Rich text or block-based WYSIWYG editing
- Per-article revision history UI
- Image transformations, CDN tuning, and moderation workflows

## Chosen Approach

Editors write Markdown in the admin area. On save or publish, the server stores the original Markdown for future edits and also parses it into structured blocks for public rendering. Images upload to a public Supabase Storage bucket and are referenced by URL inside the Markdown and the parsed block payloads.

This keeps the editing experience simple and portable while preserving the structured article model already used by the public site.

## Content Model

### Canonical Published Data

Published and draft articles live in Supabase:
- `public.articles`
- `public.article_blocks`
- `public.article_tags`

`public.articles` remains the metadata table and gains the missing fields needed for editorial workflow:
- `status text not null default 'draft' check (status in ('draft', 'published'))`
- `updated_by uuid references public.profiles(id) on delete set null`
- `published_at timestamptz null`
- `source_markdown text not null default ''`
- `hero_image_url text`
- `hero_image_caption text`

`public.article_blocks` continues to store ordered, render-ready blocks. Supported kinds for this iteration:
- `paragraph`
- `heading`
- `image`

Hero media moves out of the special `hero_image` block and becomes article metadata, which simplifies editor loading, list card rendering, and sharing metadata generation.

### Media Storage

Supabase Storage becomes the canonical file store for article images.

Bucket:
- `article-media`

Object path convention:
- `articles/<slug>/hero/<timestamp>-<filename>`
- `articles/<slug>/inline/<timestamp>-<filename>`

The bucket is publicly readable. Upload, update, and delete operations are restricted to authenticated editors through storage policies.

## Permissions

The current article write policy allows any authenticated user to write their own articles. That is too broad for an internal CMS.

The new rule set:
- Public users can only read published articles and their blocks/tags
- Authenticated non-admin users cannot create or mutate articles
- Admin users can create, update, publish, unpublish, upload media, and delete article media

`public.profiles.is_admin` remains the source of truth for editorial permissions.

## App and API Shape

### Admin Article Editor

The editor keeps the current metadata form and changes the body input to Markdown-first editing:
- article metadata fields
- hero image URL and caption fields
- Markdown textarea
- inline upload button that returns a public URL and can append Markdown image syntax

### Route Handlers

Add or update admin APIs to support the new workflow:
- `GET /api/admin/articles`
- `POST /api/admin/articles`
- `GET /api/admin/articles/[slug]`
- `PATCH /api/admin/articles/[slug]`
- `POST /api/admin/articles/[slug]/publish`
- `POST /api/admin/articles/[slug]/unpublish`
- `POST /api/admin/articles/media`

The media route uploads a file to Storage and returns:
- `url`
- `alt`
- `path`

The article create and update routes accept Markdown source plus hero metadata, then persist:
1. article metadata
2. raw `source_markdown`
3. parsed structured blocks
4. tag relations

## Rendering Strategy

The public site keeps using the unified content-source layer. Repository Markdown remains a fallback and import source during migration, but the admin-published Supabase version becomes canonical when a slug exists in both places.

Public article rendering uses:
- `articles.hero_image_url` and `articles.hero_image_caption` for the hero area
- `article_blocks` for headings, paragraphs, and inline images

Home, collection, search, and metadata generation should all read the same hero URL field to keep cards and share images consistent.

## Migration Strategy

1. Add the new article fields and tighten article RLS.
2. Add storage bucket and storage policies for `article-media`.
3. Update TypeScript Supabase types to match the schema.
4. Update article parsing and persistence helpers to keep both `source_markdown` and structured blocks in sync.
5. Update admin UI to edit Markdown and upload media.
6. Keep repository-backed Markdown as fallback content until existing stories are imported.

## Risks and Mitigations

- Schema drift between local migrations and the live project:
  Mitigation: apply the missing article-management fields in a fresh migration and verify against the configured Supabase project before claiming completion.

- Data duplication between `source_markdown` and `article_blocks`:
  Mitigation: never hand-edit blocks in the admin UI; always regenerate them from Markdown on save.

- Media orphaning:
  Mitigation: start with deterministic article path prefixes so cleanup is possible even before adding a full `media_assets` table.

## Testing

Add or update tests for:
- article mutation validation with Markdown source and hero fields
- Markdown serialization into structured blocks
- content source loading published hero metadata from Supabase
- admin editor form submission and upload insertion behavior
- admin media upload route authorization
- published article rendering with hero metadata from database rows
