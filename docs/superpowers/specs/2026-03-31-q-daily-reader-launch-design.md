# Q-daily Reader Launch Design

## Goal

Upgrade Q-daily from a static editorial showcase into a reader-facing product that supports account login, article interactions, moderated comments, and a lightweight admin workspace for daily operations.

## Product Scope

### Reader-facing MVP

- Email OTP login with Supabase Auth
- Persistent reader profile linked to the auth user
- Article like / unlike
- Article bookmark / unbookmark
- Comment submission on article pages
- Comment moderation states: `pending`, `approved`, `rejected`, `hidden`
- Personal center with profile summary, likes, bookmarks, and comment status history

### Admin MVP

- Admin-only access gate
- Comment review queue with approve / reject / hide actions
- User overview with signup time and engagement counts
- Article engagement overview with likes, bookmarks, and approved comment counts

### Explicitly Deferred

- Full CMS / rich article editor
- Third-party social login
- Nested replies
- Notification center
- Recommendation engine
- Abuse reporting workflow beyond manual moderation

## Architecture

Q-daily remains a Next.js App Router application with Supabase as the backend. Read-only editorial content continues to support the existing seed-data fallback, while authenticated reader features require Supabase. Authentication is handled on the client with Supabase Auth email OTP. Mutations and privileged reads flow through Next.js Route Handlers using bearer tokens so Row Level Security stays authoritative in the database layer.

The UI stays split between presentational site components and focused data/auth helpers. Reader interactions are added to the article page as client islands. Personal center and admin surfaces are new routes that render from lightweight client-side data fetchers backed by authenticated route handlers.

## Data Model

### New tables

- `profiles`
  - `id uuid primary key`
  - `email text`
  - `display_name text`
  - `avatar_url text null`
  - `bio text null`
  - `is_admin boolean default false`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- `article_likes`
  - `user_id uuid`
  - `article_slug text`
  - `created_at timestamptz`
  - unique key on `user_id, article_slug`
- `article_bookmarks`
  - `user_id uuid`
  - `article_slug text`
  - `created_at timestamptz`
  - unique key on `user_id, article_slug`
- `comments`
  - `id uuid primary key`
  - `article_slug text`
  - `user_id uuid`
  - `content text`
  - `status text`
  - `reviewed_by uuid null`
  - `reviewed_at timestamptz null`
  - `created_at timestamptz`
  - `updated_at timestamptz`

### New views

- `reader_engagement_summary`
  - per-user counts for likes, bookmarks, pending comments, approved comments
- `admin_article_engagement`
  - per-article counts for likes, bookmarks, approved comments, pending comments
- `admin_user_overview`
  - per-user overview for admin listing

## Access Rules

- Anonymous readers can browse content only.
- Authenticated readers can manage only their own likes, bookmarks, comments, and profile.
- Submitted comments default to `pending`.
- Public article pages only show `approved` comments.
- Readers can view all of their own comments and moderation states in personal center.
- Admins can review all comments and query admin views.

## Route Plan

### Reader routes

- `/account/login`
- `/account`
- `/account/likes`
- `/account/bookmarks`
- `/account/comments`

### Admin routes

- `/admin`
- `/admin/comments`
- `/admin/users`
- `/admin/articles`

### API routes

- `/api/auth/profile`
- `/api/articles/[slug]/engagement`
- `/api/articles/[slug]/like`
- `/api/articles/[slug]/bookmark`
- `/api/articles/[slug]/comments`
- `/api/account/summary`
- `/api/admin/summary`
- `/api/admin/comments`
- `/api/admin/comments/[id]`
- `/api/admin/users`
- `/api/admin/articles`

## UX Notes

- Article pages keep the editorial reading layout and add a compact interaction bar instead of social-heavy chrome.
- Logged-out users see clear prompts to sign in before interacting.
- Comments present moderation expectations before submission.
- Admin pages prioritize queue clarity over dashboard complexity.

## Testing Strategy

- Unit tests for auth/session helpers and engagement payload shaping
- Component tests for login CTA, article interaction modules, and moderation states
- Route handler tests for authorization failures and happy-path mutations where practical
- Regression coverage for anonymous fallback behavior so editorial pages still render without Supabase

## Delivery Plan

### Phase 1

- Email OTP auth
- Profile bootstrap
- Likes / bookmarks / comments schema and policies
- Article page interactions

### Phase 2

- Personal center pages
- Admin dashboard, comment moderation, user overview, article overview

### Phase 3

- QA pass, copy polish, deploy checklist, production handoff
