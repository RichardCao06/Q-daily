# Q-daily Article Management Design

## Goal

Add the first internal content workflow to Q-daily so admins can create article drafts, edit article metadata and body paragraphs, and publish or unpublish stories without touching seed files or the Supabase dashboard directly.

## Scope

In scope:
- Admin-only article management workspace
- Article list with status, publish time, and quick actions
- Create article form
- Edit article metadata, tags, and body paragraphs
- Draft and published states
- Publish and unpublish actions
- Public site reads only published articles from Supabase

Out of scope for this iteration:
- Image upload
- Rich text / block editor beyond ordered paragraphs
- Scheduled publishing
- Multi-step editorial review
- Revision history

## Product Shape

The lightweight CMS lives inside the existing `/admin` area and keeps the editorial tone of the current project. Admins get a list view for all articles, a create page, and an edit page. Each article stores:
- Title
- Slug
- Excerpt
- Author
- Category
- Tags
- Reading time
- Cover alt text
- Palette
- Body paragraphs
- Status (`draft` or `published`)
- Published timestamp

Drafts are never visible on public article routes, category pages, tag pages, or search results. Publishing changes visibility immediately. Unpublishing moves an article back to draft while preserving its content.

## Data Model

The existing `articles`, `article_blocks`, and `article_tags` tables stay in place and gain the minimum fields required for editorial workflow:
- `articles.status text check in ('draft', 'published') default 'draft'`
- `articles.updated_by uuid references public.profiles(id) on delete set null`
- `articles.published_at timestamptz null`

Public reads must filter to `status = 'published'`. Admin reads can access all records.

Body editing continues to use `article_blocks` with paragraph rows ordered by `position`. The editor writes the full ordered paragraph set for a story on save, replacing existing paragraph rows for that article. Tag editing continues through `article_tags`.

## App Structure

New admin routes:
- `/admin/articles`
  - list all articles with status chips and action links
- `/admin/articles/new`
  - create article draft
- `/admin/articles/[slug]`
  - edit existing article

New route handlers:
- `GET /api/admin/articles`
  - list articles for admins
- `POST /api/admin/articles`
  - create draft article
- `GET /api/admin/articles/[slug]`
  - load editor data
- `PATCH /api/admin/articles/[slug]`
  - update article draft or published article
- `POST /api/admin/articles/[slug]/publish`
  - publish article
- `POST /api/admin/articles/[slug]/unpublish`
  - move article back to draft

## Permissions

- Visitors: can only read published content
- Logged-in non-admins: no access to article management APIs or pages
- Admins: full access to article management routes and mutations

Supabase Row Level Security remains the source of truth. Route handlers still verify admin access before any mutation.

## UX Notes

The editor should favor speed over decoration:
- metadata fields grouped first
- a textarea for paragraphs, using one paragraph per line block separated by blank lines
- inline validation for missing required fields and malformed slugs
- clear draft/published state indicator
- explicit publish and unpublish buttons

## Testing

Add coverage for:
- public content source filtering drafts out
- admin article list and editor pages
- create/update/publish/unpublish route handlers
- form serialization and validation helpers
- regression coverage that published articles still render through existing public routes
