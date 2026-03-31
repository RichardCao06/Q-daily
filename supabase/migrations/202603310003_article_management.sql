alter table public.articles
  add column if not exists status text not null default 'draft',
  add column if not exists updated_by uuid references public.profiles(id) on delete set null;

alter table public.articles
  alter column published_at drop not null;

alter table public.articles
  drop constraint if exists articles_status_check;

alter table public.articles
  add constraint articles_status_check check (status in ('draft', 'published'));

update public.articles
set
  status = 'published',
  published_at = coalesce(published_at, now())
where status is distinct from 'published';

create index if not exists articles_status_idx on public.articles (status, published_at desc);

create trigger articles_touch_updated_at
before update on public.articles
for each row execute procedure public.touch_updated_at();

drop policy if exists "Public read articles" on public.articles;
drop policy if exists "Public read article blocks" on public.article_blocks;
drop policy if exists "Public read article tags" on public.article_tags;

create policy "Public read published articles" on public.articles
for select using (status = 'published' or public.current_profile_is_admin());

create policy "Admins manage articles" on public.articles
for all using (public.current_profile_is_admin())
with check (public.current_profile_is_admin());

create policy "Public read published article blocks" on public.article_blocks
for select using (
  exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_blocks.article_slug
      and (public.articles.status = 'published' or public.current_profile_is_admin())
  )
);

create policy "Admins manage article blocks" on public.article_blocks
for all using (public.current_profile_is_admin())
with check (public.current_profile_is_admin());

create policy "Public read published article tags" on public.article_tags
for select using (
  exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_tags.article_slug
      and (public.articles.status = 'published' or public.current_profile_is_admin())
  )
);

create policy "Admins manage article tags" on public.article_tags
for all using (public.current_profile_is_admin())
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
) comments on comments.article_slug = articles.slug
where articles.status = 'published';

create or replace view public.public_article_comments as
select
  comments.id,
  comments.article_slug,
  comments.content,
  comments.created_at,
  profiles.display_name as author_name
from public.comments
join public.profiles on profiles.id = comments.user_id
join public.articles on public.articles.slug = comments.article_slug
where comments.status = 'approved'
  and public.articles.status = 'published';
