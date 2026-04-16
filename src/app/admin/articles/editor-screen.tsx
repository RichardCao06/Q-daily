"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ArticleEditor } from "@/components/admin/article-editor";
import type { ArticleMutationInput } from "@/lib/article-management";
import type { AdminArticleEditorState } from "@/lib/article-management-service";
import type { Article } from "@/lib/qdaily-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SiteHeader } from "@/components/site/site-header";

type AdminArticleEditorScreenProps = {
  slug?: string;
};

const initialState: AdminArticleEditorState = {
  configured: Boolean(getSupabaseBrowserClient()),
  isAdmin: false,
  authors: [],
  categories: [],
  tags: [],
  article: null,
};

export function AdminArticleEditorScreen({ slug }: AdminArticleEditorScreenProps) {
  const [state, setState] = useState<AdminArticleEditorState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [importAuthorSlug, setImportAuthorSlug] = useState("");
  const [markdownImportFile, setMarkdownImportFile] = useState<File | null>(null);
  const [markdownImportSource, setMarkdownImportSource] = useState("");
  const [markdownPreviewArticle, setMarkdownPreviewArticle] = useState<Article | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const resolvedImportAuthorSlug = state.authors.some((author) => author.slug === importAuthorSlug) ? importAuthorSlug : (state.authors[0]?.slug ?? "");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const browserClient = supabase;
    let isMounted = true;

    async function loadState() {
      const {
        data: { session },
      } = await browserClient.auth.getSession();

      const response = await fetch(slug ? `/api/admin/articles/${slug}` : "/api/admin/articles/new", {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });

      const payload = (await response.json()) as AdminArticleEditorState | { error: string };

      if (!isMounted) {
        return;
      }

      if (!response.ok || "error" in payload) {
        setError("error" in payload ? payload.error : "无法加载文章编辑器");
        return;
      }

      setState(payload);
    }

    void loadState();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  function handleSave(value: ArticleMutationInput) {
    startTransition(async () => {
      setError(null);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase 未配置");
        return;
      }

      const browserClient = supabase;

      const {
        data: { session },
      } = await browserClient.auth.getSession();

      if (!session?.access_token) {
        setError("请先登录管理员账号");
        return;
      }

      const response = await fetch(slug ? `/api/admin/articles/${slug}` : "/api/admin/articles", {
        method: slug ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(value),
      });

      const payload = (await response.json()) as { slug?: string; error?: string };

      if (!response.ok) {
        setError(payload.error ?? "保存失败");
        return;
      }

      router.push(`/admin/articles/${payload.slug ?? slug ?? value.slug}`);
      router.refresh();
    });
  }

  function handleImportRepositoryMarkdown() {
    startTransition(async () => {
      setError(null);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase 未配置");
        return;
      }

      const browserClient = supabase;
      const authorSlug = state.authors[0]?.slug;

      if (!authorSlug) {
        setError("当前没有可用作者，无法导入仓库文章");
        return;
      }

      const {
        data: { session },
      } = await browserClient.auth.getSession();

      if (!session?.access_token) {
        setError("请先登录管理员账号");
        return;
      }

      const response = await fetch("/api/admin/articles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          authorSlug,
        }),
      });

      const payload = (await response.json()) as { imported?: string[]; error?: string };

      if (!response.ok) {
        setError(payload.error ?? "导入失败");
        return;
      }

      router.push("/admin/articles");
      router.refresh();
    });
  }

  function handlePreviewLocalMarkdown() {
    startTransition(async () => {
      setError(null);
      setMarkdownPreviewArticle(null);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase 未配置");
        return;
      }

      if (!markdownImportFile) {
        setError("请先选择一个 Markdown 文件");
        return;
      }

      const authorSlug = resolvedImportAuthorSlug;
      if (!authorSlug) {
        setError("当前没有可用作者，无法导入 Markdown");
        return;
      }

      const markdown = await markdownImportFile.text();
      const browserClient = supabase;
      const {
        data: { session },
      } = await browserClient.auth.getSession();

      if (!session?.access_token) {
        setError("请先登录管理员账号");
        return;
      }

      const response = await fetch("/api/admin/articles/import/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          markdown,
          authorSlug,
        }),
      });

      const payload = (await response.json()) as { article?: Article; error?: string };

      if (!response.ok || !payload.article) {
        setError(payload.error ?? "Markdown 预览失败");
        return;
      }

      setMarkdownImportSource(markdown);
      setMarkdownPreviewArticle(payload.article);
    });
  }

  function handleImportLocalMarkdown() {
    startTransition(async () => {
      setError(null);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase 未配置");
        return;
      }

      const authorSlug = resolvedImportAuthorSlug;
      if (!authorSlug) {
        setError("当前没有可用作者，无法导入 Markdown");
        return;
      }

      if (!markdownImportSource || !markdownPreviewArticle) {
        setError("请先生成导入预览，再确认发布");
        return;
      }

      const browserClient = supabase;
      const {
        data: { session },
      } = await browserClient.auth.getSession();

      if (!session?.access_token) {
        setError("请先登录管理员账号");
        return;
      }

      const response = await fetch("/api/admin/articles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          markdown: markdownImportSource,
          authorSlug,
          status: "published",
        }),
      });

      const payload = (await response.json()) as { slug?: string; error?: string };

      if (!response.ok || !payload.slug) {
        setError(payload.error ?? "Markdown 导入失败");
        return;
      }

      setMarkdownImportFile(null);
      setMarkdownImportSource("");
      setMarkdownPreviewArticle(null);
      router.push(`/admin/articles/${payload.slug}`);
      router.refresh();
    });
  }

  async function handleUploadInlineImage(file: File, alt: string, currentSlug?: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      throw new Error("Supabase 未配置");
    }

    const resolvedSlug = currentSlug?.trim();
    if (!resolvedSlug) {
      throw new Error("请先填写文章 slug，再上传图片");
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("请先登录管理员账号");
    }

    const formData = new FormData();
    formData.set("slug", resolvedSlug);
    formData.set("kind", "inline");
    formData.set("alt", alt);
    formData.set("file", file);

    const response = await fetch("/api/admin/articles/media", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    const payload = (await response.json()) as { url?: string; alt?: string; error?: string };

    if (!response.ok || !payload.url) {
      throw new Error(payload.error ?? "图片上传失败");
    }

    return {
      url: payload.url,
      alt: payload.alt ?? alt,
    };
  }

  function handleUnpublish() {
    if (!slug) {
      return;
    }

    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        return;
      }

      const browserClient = supabase;

      const {
        data: { session },
      } = await browserClient.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const response = await fetch(`/api/admin/articles/${slug}/unpublish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        setError("下线失败");
        return;
      }

      setState((current) => ({
        ...current,
        article: current.article
          ? {
              ...current.article,
              status: "draft",
              publishedAt: "",
            }
          : current.article,
      }));
    });
  }

  return (
    <div>
      <SiteHeader currentLabel="文章编辑" />
      <main style={{ width: "min(100%, 1120px)", margin: "0 auto", padding: "32px 24px 80px", display: "grid", gap: "16px" }}>
        {error ? (
          <p
            style={{
              border: "1px solid #d07a52",
              borderRadius: "18px",
              background: "#fff4ed",
              color: "#8d3f1d",
              padding: "14px 16px",
            }}
          >
            {error}
          </p>
        ) : null}

        {!slug ? (
          <section
            style={{
              border: "1px solid var(--line-soft)",
              borderRadius: "20px",
              background: "#fffdf6",
              padding: "18px 20px",
              display: "grid",
              gap: "10px",
            }}
          >
            <div>
              <strong style={{ display: "block", marginBottom: "4px" }}>Markdown 导入</strong>
              <p style={{ margin: 0, color: "var(--ink-muted)" }}>可以上传本地 `.md` 文件直接导入并发布，也可以把 `content/articles` 里的现有文章一次性同步到 Supabase。</p>
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <label style={{ display: "grid", gap: "6px" }}>
                <span>导入作者</span>
                <select value={resolvedImportAuthorSlug} onChange={(event) => setImportAuthorSlug(event.target.value)} disabled={isPending || state.authors.length === 0}>
                  {state.authors.map((author) => (
                    <option key={author.slug} value={author.slug}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span>上传本地 Markdown 文件</span>
                <input
                  type="file"
                  accept=".md,text/markdown"
                  onChange={(event) => {
                    setMarkdownImportFile(event.target.files?.[0] ?? null);
                    setMarkdownImportSource("");
                    setMarkdownPreviewArticle(null);
                  }}
                />
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handlePreviewLocalMarkdown}
                  disabled={isPending || state.authors.length === 0 || !markdownImportFile}
                  style={{
                    borderRadius: "999px",
                    padding: "10px 18px",
                    font: "inherit",
                    border: "1px solid var(--line-soft)",
                    background: "#111",
                    color: "#fff",
                    cursor: isPending ? "progress" : "pointer",
                  }}
                >
                  生成导入预览
                </button>
                <button
                  type="button"
                  onClick={handleImportLocalMarkdown}
                  disabled={isPending || state.authors.length === 0 || !markdownPreviewArticle}
                  style={{
                    borderRadius: "999px",
                    padding: "10px 18px",
                    font: "inherit",
                    border: "1px solid var(--line-soft)",
                    background: "#d16a3b",
                    color: "#fff",
                    cursor: isPending ? "progress" : "pointer",
                  }}
                >
                  确认导入并发布
                </button>
                <button
                  type="button"
                  onClick={handleImportRepositoryMarkdown}
                  disabled={isPending || state.authors.length === 0}
                  style={{
                    borderRadius: "999px",
                    padding: "10px 18px",
                    font: "inherit",
                    border: "1px solid var(--line-soft)",
                    background: "#fff",
                    cursor: isPending ? "progress" : "pointer",
                  }}
                >
                  从仓库导入现有 Markdown
                </button>
              </div>
            </div>
            <div>
              <p style={{ margin: 0, color: "var(--ink-muted)", fontSize: "0.95rem" }}>
                本地文件会先走服务端解析预览，确认后再以发布状态写入 Supabase。
              </p>
            </div>
          </section>
        ) : null}

        {!slug && markdownPreviewArticle ? <MarkdownImportPreview article={markdownPreviewArticle} /> : null}

        <ArticleEditor
          key={`${slug ?? "new"}:${state.authors.map((author) => author.slug).join(",")}:${state.article?.slug ?? "blank"}`}
          mode={slug ? "edit" : "create"}
          categories={state.categories}
          authors={state.authors}
          tags={state.tags}
          initialValue={state.article ?? undefined}
          onSave={handleSave}
          onUploadInlineImage={handleUploadInlineImage}
          onUnpublish={slug ? handleUnpublish : undefined}
        />

        {isPending ? <p style={{ color: "var(--ink-muted)" }}>正在处理文章…</p> : null}
      </main>
    </div>
  );
}

function MarkdownImportPreview({ article }: { article: Article }) {
  return (
    <section
      style={{
        border: "1px solid var(--line-soft)",
        borderRadius: "24px",
        background: "#fff",
        padding: "24px",
        display: "grid",
        gap: "18px",
      }}
    >
      <div style={{ display: "grid", gap: "8px" }}>
        <strong style={{ fontSize: "1.05rem" }}>预览文章</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", color: "var(--ink-muted)", fontSize: "0.95rem" }}>
          <span>{article.category.name}</span>
          <span>{article.publishedAt}</span>
          <span>{article.author}</span>
          <span>{article.readingTime}</span>
          <span>{article.slug}</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.15 }}>{article.title}</h2>
        <p style={{ margin: 0, color: "var(--ink-muted)", fontSize: "1rem", lineHeight: 1.7 }}>{article.excerpt}</p>
      </div>

      {article.heroImage ? (
        <figure style={{ margin: 0, display: "grid", gap: "8px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            style={{ width: "100%", borderRadius: "18px", objectFit: "cover", maxHeight: "420px" }}
          />
          {article.heroImage.caption ? <figcaption style={{ color: "var(--ink-muted)", fontSize: "0.95rem" }}>{article.heroImage.caption}</figcaption> : null}
        </figure>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {article.tags.map((tag) => (
          <span
            key={tag.slug}
            style={{
              borderRadius: "999px",
              padding: "6px 12px",
              background: "#f6f0e8",
              color: "#6f5747",
              fontSize: "0.9rem",
            }}
          >
            {tag.name}
          </span>
        ))}
      </div>

      <article style={{ display: "grid", gap: "16px" }}>
        {(article.longformBlocks ?? []).map((block, index) => {
          if (block.type === "paragraph") {
            return (
              <p key={`${block.type}-${index}`} style={{ margin: 0, lineHeight: 1.9, fontSize: "1rem" }}>
                {block.content}
              </p>
            );
          }

          if (block.type === "heading") {
            const HeadingTag = block.level === 3 ? "h3" : "h2";

            return (
              <HeadingTag key={`${block.type}-${index}`} style={{ margin: 0, fontSize: block.level === 3 ? "1.2rem" : "1.45rem" }}>
                {block.content}
              </HeadingTag>
            );
          }

          return (
            <figure key={`${block.type}-${index}`} style={{ margin: 0, display: "grid", gap: "8px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.src} alt={block.alt} style={{ width: "100%", borderRadius: "16px", objectFit: "cover" }} />
              {block.caption ? <figcaption style={{ color: "var(--ink-muted)", fontSize: "0.95rem" }}>{block.caption}</figcaption> : null}
            </figure>
          );
        })}
      </article>
    </section>
  );
}
