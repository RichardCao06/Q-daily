drop policy if exists "Admins manage articles" on public.articles;
drop policy if exists "Admins manage article blocks" on public.article_blocks;
drop policy if exists "Admins manage article tags" on public.article_tags;

create policy "Authenticated users insert articles" on public.articles
for insert
with check (auth.role() = 'authenticated' and updated_by = auth.uid());

create policy "Authenticated users update own articles" on public.articles
for update
using (auth.role() = 'authenticated' and updated_by = auth.uid())
with check (auth.role() = 'authenticated' and updated_by = auth.uid());

create policy "Authenticated users delete own articles" on public.articles
for delete
using (auth.role() = 'authenticated' and updated_by = auth.uid());

create policy "Authenticated users insert own article blocks" on public.article_blocks
for insert
with check (
  auth.role() = 'authenticated'
  and exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_blocks.article_slug
      and public.articles.updated_by = auth.uid()
  )
);

create policy "Authenticated users update own article blocks" on public.article_blocks
for update
using (
  auth.role() = 'authenticated'
  and exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_blocks.article_slug
      and public.articles.updated_by = auth.uid()
  )
)
with check (
  auth.role() = 'authenticated'
  and exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_blocks.article_slug
      and public.articles.updated_by = auth.uid()
  )
);

create policy "Authenticated users delete own article blocks" on public.article_blocks
for delete
using (
  auth.role() = 'authenticated'
  and exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_blocks.article_slug
      and public.articles.updated_by = auth.uid()
  )
);

create policy "Authenticated users insert own article tags" on public.article_tags
for insert
with check (
  auth.role() = 'authenticated'
  and exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_tags.article_slug
      and public.articles.updated_by = auth.uid()
  )
);

create policy "Authenticated users update own article tags" on public.article_tags
for update
using (
  auth.role() = 'authenticated'
  and exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_tags.article_slug
      and public.articles.updated_by = auth.uid()
  )
)
with check (
  auth.role() = 'authenticated'
  and exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_tags.article_slug
      and public.articles.updated_by = auth.uid()
  )
);

create policy "Authenticated users delete own article tags" on public.article_tags
for delete
using (
  auth.role() = 'authenticated'
  and exists (
    select 1
    from public.articles
    where public.articles.slug = public.article_tags.article_slug
      and public.articles.updated_by = auth.uid()
  )
);
