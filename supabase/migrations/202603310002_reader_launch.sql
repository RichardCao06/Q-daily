create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default 'Q-daily 读者',
  avatar_url text,
  bio text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_likes (
  article_slug text not null references public.articles(slug) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_slug, user_id)
);

create table public.article_bookmarks (
  article_slug text not null references public.articles(slug) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_slug, user_id)
);

create type public.comment_status as enum ('pending', 'approved', 'rejected', 'hidden');

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null references public.articles(slug) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  status public.comment_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index article_likes_user_id_idx on public.article_likes (user_id);
create index article_bookmarks_user_id_idx on public.article_bookmarks (user_id);
create index comments_article_slug_idx on public.comments (article_slug, created_at desc);
create index comments_user_id_idx on public.comments (user_id, created_at desc);
create index comments_status_idx on public.comments (status, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_profile_is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute procedure public.touch_updated_at();

create trigger comments_touch_updated_at
before update on public.comments
for each row execute procedure public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.article_likes enable row level security;
alter table public.article_bookmarks enable row level security;
alter table public.comments enable row level security;

create policy "Public read profiles" on public.profiles
for select using (true);

create policy "Users insert own profile" on public.profiles
for insert with check (auth.uid() = id);

create policy "Users update own profile" on public.profiles
for update using (auth.uid() = id or public.current_profile_is_admin())
with check (auth.uid() = id or public.current_profile_is_admin());

create policy "Readers view own likes" on public.article_likes
for select using (auth.uid() = user_id or public.current_profile_is_admin());

create policy "Readers manage own likes" on public.article_likes
for insert with check (auth.uid() = user_id);

create policy "Readers delete own likes" on public.article_likes
for delete using (auth.uid() = user_id or public.current_profile_is_admin());

create policy "Readers view own bookmarks" on public.article_bookmarks
for select using (auth.uid() = user_id or public.current_profile_is_admin());

create policy "Readers manage own bookmarks" on public.article_bookmarks
for insert with check (auth.uid() = user_id);

create policy "Readers delete own bookmarks" on public.article_bookmarks
for delete using (auth.uid() = user_id or public.current_profile_is_admin());

create policy "Public view approved comments and readers view own comments" on public.comments
for select using (status = 'approved' or auth.uid() = user_id or public.current_profile_is_admin());

create policy "Readers insert own comments" on public.comments
for insert with check (auth.uid() = user_id);

create policy "Admins moderate comments" on public.comments
for update using (public.current_profile_is_admin())
with check (public.current_profile_is_admin());

create or replace view public.public_article_engagement as
select
  articles.slug as article_slug,
  coalesce(likes.like_count, 0)::integer as like_count,
  coalesce(bookmarks.bookmark_count, 0)::integer as bookmark_count,
  coalesce(comments.approved_comment_count, 0)::integer as approved_comment_count
from public.articles
left join (
  select article_slug, count(*) as like_count
  from public.article_likes
  group by article_slug
) likes on likes.article_slug = articles.slug
left join (
  select article_slug, count(*) as bookmark_count
  from public.article_bookmarks
  group by article_slug
) bookmarks on bookmarks.article_slug = articles.slug
left join (
  select article_slug, count(*) as approved_comment_count
  from public.comments
  where status = 'approved'
  group by article_slug
) comments on comments.article_slug = articles.slug;

create or replace view public.public_article_comments as
select
  comments.id,
  comments.article_slug,
  comments.content,
  comments.created_at,
  profiles.display_name as author_name
from public.comments
join public.profiles on profiles.id = comments.user_id
where comments.status = 'approved';

create or replace view public.admin_article_engagement as
select
  articles.slug as article_slug,
  articles.title,
  coalesce(likes.like_count, 0)::integer as like_count,
  coalesce(bookmarks.bookmark_count, 0)::integer as bookmark_count,
  coalesce(comments.approved_comment_count, 0)::integer as approved_comment_count,
  coalesce(comments.pending_comment_count, 0)::integer as pending_comment_count
from public.articles
left join (
  select article_slug, count(*) as like_count
  from public.article_likes
  group by article_slug
) likes on likes.article_slug = articles.slug
left join (
  select article_slug, count(*) as bookmark_count
  from public.article_bookmarks
  group by article_slug
) bookmarks on bookmarks.article_slug = articles.slug
left join (
  select
    article_slug,
    count(*) filter (where status = 'approved') as approved_comment_count,
    count(*) filter (where status = 'pending') as pending_comment_count
  from public.comments
  group by article_slug
) comments on comments.article_slug = articles.slug;

create or replace view public.admin_user_overview as
select
  profiles.id,
  profiles.email,
  profiles.display_name,
  profiles.is_admin,
  profiles.created_at,
  coalesce(likes.like_count, 0)::integer as like_count,
  coalesce(bookmarks.bookmark_count, 0)::integer as bookmark_count,
  coalesce(comments.comment_count, 0)::integer as comment_count
from public.profiles
left join (
  select user_id, count(*) as like_count
  from public.article_likes
  group by user_id
) likes on likes.user_id = profiles.id
left join (
  select user_id, count(*) as bookmark_count
  from public.article_bookmarks
  group by user_id
) bookmarks on bookmarks.user_id = profiles.id
left join (
  select user_id, count(*) as comment_count
  from public.comments
  group by user_id
) comments on comments.user_id = profiles.id;
