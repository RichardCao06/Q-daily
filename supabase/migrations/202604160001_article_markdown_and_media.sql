alter table public.articles
  add column if not exists status text not null default 'draft',
  add column if not exists updated_by uuid references public.profiles(id) on delete set null,
  add column if not exists source_markdown text not null default '',
  add column if not exists hero_image_url text,
  add column if not exists hero_image_caption text;

alter table public.articles
  alter column published_at drop not null;

alter table public.articles
  drop constraint if exists articles_status_check;

alter table public.articles
  add constraint articles_status_check check (status in ('draft', 'published'));

update public.articles
set
  status = 'published',
  published_at = coalesce(published_at, now()),
  source_markdown = coalesce(source_markdown, '')
where status is distinct from 'published'
   or source_markdown is null;

create index if not exists articles_status_idx on public.articles (status, published_at desc);

drop trigger if exists articles_touch_updated_at on public.articles;
create trigger articles_touch_updated_at
before update on public.articles
for each row execute procedure public.touch_updated_at();

drop policy if exists "Public read articles" on public.articles;
drop policy if exists "Public read published articles" on public.articles;
drop policy if exists "Admins manage articles" on public.articles;
drop policy if exists "Authenticated users insert articles" on public.articles;
drop policy if exists "Authenticated users update own articles" on public.articles;
drop policy if exists "Authenticated users delete own articles" on public.articles;

drop policy if exists "Public read article blocks" on public.article_blocks;
drop policy if exists "Public read published article blocks" on public.article_blocks;
drop policy if exists "Admins manage article blocks" on public.article_blocks;
drop policy if exists "Authenticated users insert own article blocks" on public.article_blocks;
drop policy if exists "Authenticated users update own article blocks" on public.article_blocks;
drop policy if exists "Authenticated users delete own article blocks" on public.article_blocks;

drop policy if exists "Public read article tags" on public.article_tags;
drop policy if exists "Public read published article tags" on public.article_tags;
drop policy if exists "Admins manage article tags" on public.article_tags;
drop policy if exists "Authenticated users insert own article tags" on public.article_tags;
drop policy if exists "Authenticated users update own article tags" on public.article_tags;
drop policy if exists "Authenticated users delete own article tags" on public.article_tags;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-media',
  'article-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read article media" on storage.objects;
drop policy if exists "Admins upload article media" on storage.objects;
drop policy if exists "Admins update article media" on storage.objects;
drop policy if exists "Admins delete article media" on storage.objects;

create policy "Public read article media" on storage.objects
for select using (bucket_id = 'article-media');

create policy "Admins upload article media" on storage.objects
for insert with check (bucket_id = 'article-media' and public.current_profile_is_admin());

create policy "Admins update article media" on storage.objects
for update using (bucket_id = 'article-media' and public.current_profile_is_admin())
with check (bucket_id = 'article-media' and public.current_profile_is_admin());

create policy "Admins delete article media" on storage.objects
for delete using (bucket_id = 'article-media' and public.current_profile_is_admin());
