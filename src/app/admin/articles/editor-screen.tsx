"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ArticleEditor } from "@/components/admin/article-editor";
import type { ArticleMutationInput } from "@/lib/article-management";
import type { AdminArticleEditorState } from "@/lib/article-management-service";
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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

        <ArticleEditor
          key={`${slug ?? "new"}:${state.authors.map((author) => author.slug).join(",")}:${state.article?.slug ?? "blank"}`}
          mode={slug ? "edit" : "create"}
          categories={state.categories}
          authors={state.authors}
          tags={state.tags}
          initialValue={state.article ?? undefined}
          onSave={handleSave}
          onUnpublish={slug ? handleUnpublish : undefined}
        />

        {isPending ? <p style={{ color: "var(--ink-muted)" }}>正在保存文章…</p> : null}
      </main>
    </div>
  );
}
