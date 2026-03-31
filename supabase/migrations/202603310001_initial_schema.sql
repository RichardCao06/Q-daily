create type public.homepage_module_type as enum ('spotlight', 'feature', 'side_feature');

create table public.authors (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.categories (
  slug text primary key,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.tags (
  slug text primary key,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.articles (
  slug text primary key,
  legacy_id text unique,
  title text not null,
  excerpt text not null,
  published_at timestamptz not null,
  comments_count integer not null default 0,
  likes_count integer not null default 0,
  palette text not null,
  author_slug text not null references public.authors(slug) on update cascade,
  reading_time text not null,
  cover_alt text not null,
  category_slug text not null references public.categories(slug) on update cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_blocks (
  article_slug text not null references public.articles(slug) on delete cascade,
  position integer not null,
  kind text not null default 'paragraph',
  content text not null,
  primary key (article_slug, position)
);

create table public.article_tags (
  article_slug text not null references public.articles(slug) on delete cascade,
  tag_slug text not null references public.tags(slug) on delete cascade,
  primary key (article_slug, tag_slug)
);

create table public.homepage_modules (
  slot_key text primary key,
  slot_type public.homepage_module_type not null,
  sort_order integer not null default 0,
  article_slug text references public.articles(slug) on delete set null,
  category_label text not null,
  title text not null,
  excerpt text not null,
  href text not null,
  palette text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_category_slug_idx on public.articles (category_slug);
create index articles_published_at_idx on public.articles (published_at desc);
create index article_blocks_article_slug_idx on public.article_blocks (article_slug, position);
create index article_tags_tag_slug_idx on public.article_tags (tag_slug);
create index homepage_modules_slot_type_idx on public.homepage_modules (slot_type, sort_order);

alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_blocks enable row level security;
alter table public.article_tags enable row level security;
alter table public.homepage_modules enable row level security;

create policy "Public read authors" on public.authors for select using (true);
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read tags" on public.tags for select using (true);
create policy "Public read articles" on public.articles for select using (true);
create policy "Public read article blocks" on public.article_blocks for select using (true);
create policy "Public read article tags" on public.article_tags for select using (true);
create policy "Public read homepage modules" on public.homepage_modules for select using (true);
