import { buildArticleMutation, joinArticleBody, type ArticleMutationInput, type ArticleStatus } from "./article-management";
import { buildMarkdownImportPayload } from "./markdown-import";
import { getSupabaseServerClient } from "./supabase/server";

type Option = {
  slug: string;
  name: string;
};

export type AdminArticleListState = {
  configured: boolean;
  isAdmin: boolean;
  articles: Array<{
    slug: string;
    title: string;
    excerpt: string;
    status: ArticleStatus;
    publishedAt: string | null;
    updatedAt: string | null;
    categoryName: string;
    authorName: string;
  }>;
};

export type AdminArticleEditorState = {
  configured: boolean;
  isAdmin: boolean;
  authors: Option[];
  categories: Option[];
  tags: Option[];
  article: ArticleMutationInput | null;
};

type AdminContext =
  | {
      configured: false;
      isAdmin: false;
    }
  | {
      configured: true;
      isAdmin: false;
    }
  | {
      configured: true;
      isAdmin: true;
      userId: string;
      supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>;
    };

async function getAdminContext(accessToken?: string): Promise<AdminContext> {
  const supabase = getSupabaseServerClient(accessToken ? { accessToken } : {});

  if (!supabase) {
    return {
      configured: false,
      isAdmin: false,
    };
  }

  if (!accessToken) {
    return {
      configured: true,
      isAdmin: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);

  if (!user) {
    return {
      configured: true,
      isAdmin: false,
    };
  }

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const profileResult = await db.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();

  if (!profileResult.data?.is_admin) {
    return {
      configured: true,
      isAdmin: false,
    };
  }

  return {
    configured: true,
    isAdmin: true,
    userId: user.id,
    supabase,
  };
}

async function requireAdminContext(accessToken?: string) {
  const context = await getAdminContext(accessToken);

  if (!context.configured) {
    throw new Error("Supabase unavailable");
  }

  if (!context.isAdmin) {
    throw new Error("Forbidden");
  }

  return context;
}

async function persistArticleRecords(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  userId: string,
  payload: {
    article: {
      slug: string;
      title: string;
      excerpt: string;
      status: ArticleStatus;
      publishedAt: string | null;
      palette: string;
      authorSlug: string;
      readingTime: string;
      coverAlt: string;
      categorySlug: string;
    };
    tagSlugs: string[];
    blocks: Array<{
      position: number;
      kind: string;
      content: string;
    }>;
  },
) {
  const articleResult = await db.from("articles").insert({
    slug: payload.article.slug,
    legacy_id: null,
    title: payload.article.title,
    excerpt: payload.article.excerpt,
    status: payload.article.status,
    published_at: payload.article.publishedAt,
    comments_count: 0,
    likes_count: 0,
    palette: payload.article.palette,
    author_slug: payload.article.authorSlug,
    reading_time: payload.article.readingTime,
    cover_alt: payload.article.coverAlt,
    category_slug: payload.article.categorySlug,
    updated_by: userId,
  });

  if (articleResult.error) {
    throw new Error(articleResult.error.message);
  }

  const blocksResult = await db.from("article_blocks").insert(
    payload.blocks.map((block) => ({
      article_slug: payload.article.slug,
      position: block.position,
      content: block.content,
      kind: block.kind,
    })),
  );

  if (blocksResult.error) {
    throw new Error(blocksResult.error.message);
  }

  if (payload.tagSlugs.length > 0) {
    const tagsResult = await db.from("article_tags").insert(
      payload.tagSlugs.map((tagSlug) => ({
        article_slug: payload.article.slug,
        tag_slug: tagSlug,
      })),
    );

    if (tagsResult.error) {
      throw new Error(tagsResult.error.message);
    }
  }
}

async function loadEditorOptions(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
) {
  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [authorsResult, categoriesResult, tagsResult] = await Promise.all([
    db.from("authors").select("slug,name").order("name", { ascending: true }),
    db.from("categories").select("slug,name").order("name", { ascending: true }),
    db.from("tags").select("slug,name").order("name", { ascending: true }),
  ]);

  return {
    authors: ((authorsResult.data ?? []) as Option[]).map((author) => ({
      slug: author.slug,
      name: author.name,
    })),
    categories: ((categoriesResult.data ?? []) as Option[]).map((category) => ({
      slug: category.slug,
      name: category.name,
    })),
    tags: ((tagsResult.data ?? []) as Option[]).map((tag) => ({
      slug: tag.slug,
      name: tag.name,
    })),
  };
}

export async function loadAdminArticleList(accessToken?: string): Promise<AdminArticleListState> {
  const context = await getAdminContext(accessToken);

  if (!context.configured) {
    return {
      configured: false,
      isAdmin: false,
      articles: [],
    };
  }

  if (!context.isAdmin) {
    return {
      configured: true,
      isAdmin: false,
      articles: [],
    };
  }

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = context.supabase as any;
  const [articlesResult, authorsResult, categoriesResult] = await Promise.all([
    db
      .from("articles")
      .select("slug,title,excerpt,status,published_at,updated_at,author_slug,category_slug")
      .order("updated_at", { ascending: false }),
    db.from("authors").select("slug,name"),
    db.from("categories").select("slug,name"),
  ]);

  const authors = new Map(((authorsResult.data ?? []) as Array<Option>).map((author) => [author.slug, author.name]));
  const categories = new Map(((categoriesResult.data ?? []) as Array<Option>).map((category) => [category.slug, category.name]));

  return {
    configured: true,
    isAdmin: true,
    articles: ((articlesResult.data ?? []) as Array<{
      slug: string;
      title: string;
      excerpt: string;
      status: ArticleStatus;
      published_at: string | null;
      updated_at: string | null;
      author_slug: string;
      category_slug: string;
    }>).map((article) => ({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      status: article.status,
      publishedAt: article.published_at,
      updatedAt: article.updated_at,
      categoryName: categories.get(article.category_slug) ?? article.category_slug,
      authorName: authors.get(article.author_slug) ?? article.author_slug,
    })),
  };
}

export async function loadAdminArticleEditor(slug: string | null, accessToken?: string): Promise<AdminArticleEditorState> {
  const context = await getAdminContext(accessToken);

  if (!context.configured) {
    return {
      configured: false,
      isAdmin: false,
      authors: [],
      categories: [],
      tags: [],
      article: null,
    };
  }

  const options = await loadEditorOptions(context.isAdmin ? context.supabase : getSupabaseServerClient()!);

  if (!context.isAdmin) {
    return {
      configured: true,
      isAdmin: false,
      ...options,
      article: null,
    };
  }

  if (!slug) {
    return {
      configured: true,
      isAdmin: true,
      ...options,
      article: null,
    };
  }

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = context.supabase as any;
  const [articleResult, blocksResult, tagsResult] = await Promise.all([
    db
      .from("articles")
      .select("slug,title,excerpt,status,published_at,author_slug,category_slug,reading_time,cover_alt,palette")
      .eq("slug", slug)
      .maybeSingle(),
    db.from("article_blocks").select("position,content").eq("article_slug", slug).order("position", { ascending: true }),
    db.from("article_tags").select("tag_slug").eq("article_slug", slug),
  ]);

  if (!articleResult.data) {
    throw new Error("Not found");
  }

  const article = articleResult.data as {
    slug: string;
    title: string;
    excerpt: string;
    status: ArticleStatus;
    published_at: string | null;
    author_slug: string;
    category_slug: string;
    reading_time: string;
    cover_alt: string;
    palette: string;
  };

  return {
    configured: true,
    isAdmin: true,
    ...options,
    article: {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      authorSlug: article.author_slug,
      categorySlug: article.category_slug,
      readingTime: article.reading_time,
      coverAlt: article.cover_alt,
      palette: article.palette,
      tagSlugs: ((tagsResult.data ?? []) as Array<{ tag_slug: string }>).map((tag) => tag.tag_slug),
      bodyInput: joinArticleBody(((blocksResult.data ?? []) as Array<{ content: string }>).map((block) => block.content)),
      status: article.status,
      publishedAt: article.published_at ?? "",
    },
  };
}

export async function createAdminArticle(input: ArticleMutationInput, accessToken?: string) {
  const context = await requireAdminContext(accessToken);
  const payload = buildArticleMutation(input);

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = context.supabase as any;

  await persistArticleRecords(db, context.userId, {
    article: payload.article,
    tagSlugs: payload.tagSlugs,
    blocks: payload.body.map((paragraph, index) => ({
      position: index + 1,
      content: paragraph,
      kind: "paragraph",
    })),
  });

  return {
    slug: payload.article.slug,
  };
}

export async function importMarkdownAdminArticle(
  input: {
    markdown: string;
    authorSlug: string;
    status?: ArticleStatus;
  },
  accessToken?: string,
) {
  const context = await requireAdminContext(accessToken);
  const payload = buildMarkdownImportPayload(input.markdown, {
    authorSlug: input.authorSlug,
    status: input.status,
  });

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = context.supabase as any;

  await persistArticleRecords(db, context.userId, payload);

  return {
    slug: payload.article.slug,
  };
}

export async function updateAdminArticle(slug: string, input: ArticleMutationInput, accessToken?: string) {
  const context = await requireAdminContext(accessToken);
  const payload = buildArticleMutation(input);

  if (payload.article.slug !== slug) {
    throw new Error("Slug cannot change for an existing article");
  }

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = context.supabase as any;

  const articleResult = await db
    .from("articles")
    .update({
      title: payload.article.title,
      excerpt: payload.article.excerpt,
      status: payload.article.status,
      published_at: payload.article.publishedAt,
      palette: payload.article.palette,
      author_slug: payload.article.authorSlug,
      reading_time: payload.article.readingTime,
      cover_alt: payload.article.coverAlt,
      category_slug: payload.article.categorySlug,
      updated_by: context.userId,
    })
    .eq("slug", slug);

  if (articleResult.error) {
    throw new Error(articleResult.error.message);
  }

  const [deleteBlocksResult, deleteTagsResult] = await Promise.all([
    db.from("article_blocks").delete().eq("article_slug", slug),
    db.from("article_tags").delete().eq("article_slug", slug),
  ]);

  if (deleteBlocksResult.error || deleteTagsResult.error) {
    throw new Error(deleteBlocksResult.error?.message ?? deleteTagsResult.error?.message ?? "Unable to reset article relations");
  }

  const blocksResult = await db.from("article_blocks").insert(
    payload.body.map((paragraph, index) => ({
      article_slug: slug,
      position: index + 1,
      content: paragraph,
      kind: "paragraph",
    })),
  );

  if (blocksResult.error) {
    throw new Error(blocksResult.error.message);
  }

  if (payload.tagSlugs.length > 0) {
    const tagsResult = await db.from("article_tags").insert(
      payload.tagSlugs.map((tagSlug) => ({
        article_slug: slug,
        tag_slug: tagSlug,
      })),
    );

    if (tagsResult.error) {
      throw new Error(tagsResult.error.message);
    }
  }

  return {
    slug,
  };
}

export async function setAdminArticleStatus(slug: string, status: ArticleStatus, accessToken?: string) {
  const context = await requireAdminContext(accessToken);

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = context.supabase as any;
  const publishedAt = status === "published" ? new Date().toISOString() : null;

  const result = await db
    .from("articles")
    .update({
      status,
      published_at: publishedAt,
      updated_by: context.userId,
    })
    .eq("slug", slug);

  if (result.error) {
    throw new Error(result.error.message);
  }
}
