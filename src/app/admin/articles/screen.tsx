"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import type { AdminArticleListState } from "@/lib/article-management-service";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SiteHeader } from "@/components/site/site-header";

const initialState: AdminArticleListState = {
  configured: Boolean(getSupabaseBrowserClient()),
  isAdmin: false,
  articles: [],
};

export function AdminArticlesScreen() {
  const [state, setState] = useState<AdminArticleListState>(initialState);
  const [isPending, startTransition] = useTransition();

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

      const response = await fetch("/api/admin/articles", {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });

      if (!response.ok || !isMounted) {
        return;
      }

      setState((await response.json()) as AdminArticleListState);
    }

    void loadState();

    return () => {
      isMounted = false;
    };
  }, []);

  function mutateStatus(slug: string, status: "published" | "draft") {
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

      await fetch(`/api/admin/articles/${slug}/${status === "published" ? "publish" : "unpublish"}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      setState((current) => ({
        ...current,
        articles: current.articles.map((article) =>
          article.slug === slug
            ? {
                ...article,
                status,
                publishedAt: status === "published" ? new Date().toISOString() : null,
              }
            : article,
        ),
      }));
    });
  }

  return (
    <div>
      <SiteHeader currentLabel="文章管理" />
      <main style={{ width: "min(100%, 1120px)", margin: "0 auto", padding: "32px 24px 80px" }}>
        <section
          style={{
            border: "1px solid var(--line-soft)",
            borderRadius: "24px",
            background: "#fff",
            boxShadow: "var(--shadow-soft)",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <p style={{ color: "var(--brand-yellow)", fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>CMS</p>
              <h1 style={{ marginTop: "14px", fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>文章管理</h1>
              <p style={{ marginTop: "14px", color: "var(--ink-muted)", lineHeight: 1.75 }}>
                现在可以在站内创建草稿、编辑正文段落，并直接发布或下线文章。
              </p>
            </div>
            <Link href="/admin/articles/new">新建文章</Link>
          </div>

          {!state.configured ? <p style={{ marginTop: "24px" }}>当前环境尚未配置 Supabase，文章管理暂时不可用。</p> : null}
          {state.configured && !state.isAdmin ? <p style={{ marginTop: "24px" }}>当前账号没有文章管理权限。</p> : null}

          {state.isAdmin ? (
            <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "grid", gap: "16px" }}>
              {state.articles.map((article) => (
                <li
                  key={article.slug}
                  style={{
                    border: "1px solid var(--line-soft)",
                    borderRadius: "18px",
                    padding: "18px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ display: "block", fontSize: "1.05rem" }}>{article.title}</strong>
                      <span style={{ color: "var(--ink-muted)" }}>
                        {article.slug} / {article.categoryName} / {article.authorName}
                      </span>
                    </div>
                    <span>{article.status === "published" ? "已发布" : "草稿"}</span>
                  </div>
                  <p style={{ margin: 0, color: "var(--ink-muted)", lineHeight: 1.7 }}>{article.excerpt}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ color: "var(--ink-muted)" }}>
                      {article.publishedAt ? `发布时间 ${new Date(article.publishedAt).toLocaleString("zh-CN")}` : "尚未发布"}
                    </span>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <Link href={`/admin/articles/${article.slug}`}>编辑</Link>
                      <button type="button" disabled={isPending} onClick={() => mutateStatus(article.slug, article.status === "published" ? "draft" : "published")}>
                        {article.status === "published" ? "下线" : "发布"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {state.articles.length === 0 ? <li>当前还没有文章，请先创建第一篇草稿。</li> : null}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  );
}
