"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { buildReaderEngagementState, type PublicComment, type ReaderEngagementState } from "@/lib/reader-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

import styles from "./article-engagement.module.css";

type ArticleEngagementProps = {
  articleSlug: string;
  initialLikeCount: number;
  initialCommentCount: number;
};

type EngagementResponse = {
  configured: boolean;
  state: ReaderEngagementState;
};

const defaultComments: PublicComment[] = [];

export function ArticleEngagement({ articleSlug, initialLikeCount, initialCommentCount }: ArticleEngagementProps) {
  const [state, setState] = useState(
    buildReaderEngagementState({
      articleSlug,
      likeCount: initialLikeCount,
      bookmarkCount: 0,
      approvedComments: defaultComments,
    }),
  );
  const [isConfigured, setIsConfigured] = useState(() => Boolean(getSupabaseBrowserClient()));
  const [commentDraft, setCommentDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
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

      const response = await fetch(`/api/articles/${articleSlug}/engagement`, {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });

      if (!response.ok || !isMounted) {
        return;
      }

      const payload = (await response.json()) as EngagementResponse;

      setIsConfigured(payload.configured);
      setState(payload.state);
    }

    void loadState();

    return () => {
      isMounted = false;
    };
  }, [articleSlug]);

  async function withSession<T>(callback: (accessToken: string) => Promise<T>) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setIsConfigured(false);
      return null;
    }

    const browserClient = supabase;

    const {
      data: { session },
    } = await browserClient.auth.getSession();

    if (!session?.access_token) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/login";
      }
      return null;
    }

    return callback(session.access_token);
  }

  function submitMutation(path: string, body: Record<string, unknown>, successMessage?: string) {
    startTransition(async () => {
      const result = await withSession(async (accessToken) => {
        const response = await fetch(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "请求失败");
        }

        return (await response.json()) as EngagementResponse;
      });

      if (!result) {
        return;
      }

      setState(result.state);
      setFeedback(successMessage ?? null);
    });
  }

  return (
    <section className={styles.panel}>
      <div className={styles.summary}>
        <div>
          <p className={styles.eyebrow}>互动</p>
          <h2 className={styles.heading}>评论区</h2>
          <p className={styles.description}>评论会在审核通过后公开显示。</p>
        </div>

        <div className={styles.actions}>
          <button
            aria-pressed={state.viewer.hasLiked}
            disabled={!isConfigured || isPending}
            type="button"
            onClick={() =>
              submitMutation(`/api/articles/${articleSlug}/like`, {
                active: !state.viewer.hasLiked,
              })
            }
          >
            点赞
            <span>{state.likeCount}</span>
          </button>
          <button
            aria-pressed={state.viewer.hasBookmarked}
            disabled={!isConfigured || isPending}
            type="button"
            onClick={() =>
              submitMutation(`/api/articles/${articleSlug}/bookmark`, {
                active: !state.viewer.hasBookmarked,
              })
            }
          >
            收藏
            <span>{state.bookmarkCount}</span>
          </button>
        </div>
      </div>

      <div className={styles.commentComposer}>
        <textarea
          aria-label="评论内容"
          disabled={!isConfigured || isPending}
          placeholder="写下你的看法，审核通过后会公开显示。"
          value={commentDraft}
          onChange={(event) => setCommentDraft(event.target.value)}
        />
        <div className={styles.composerFooter}>
          <span>{initialCommentCount} 条历史评论记录在旧数据层中，新的公开评论将从真实用户互动累计。</span>
          <button
            disabled={!isConfigured || isPending || commentDraft.trim().length === 0}
            type="button"
            onClick={() => {
              const content = commentDraft.trim();
              if (!content) {
                return;
              }

              submitMutation(
                `/api/articles/${articleSlug}/comments`,
                {
                  content,
                },
                "评论已提交，等待审核。",
              );
              setCommentDraft("");
            }}
          >
            提交评论
          </button>
        </div>
      </div>

      {!isConfigured ? (
        <p className={styles.notice}>当前环境尚未配置 Supabase，互动功能暂时不可用。</p>
      ) : null}
      {feedback ? <p className={styles.notice}>{feedback}</p> : null}

      {state.viewer.isLoggedIn ? null : (
        <p className={styles.loginHint}>
          想参与互动？
          <Link href="/account/login">前往登录</Link>
        </p>
      )}

      <ul className={styles.commentList}>
        {state.publicComments.length === 0 ? (
          <li className={styles.emptyState}>还没有通过审核的评论，欢迎成为第一位留言的人。</li>
        ) : (
          state.publicComments.map((comment) => (
            <li key={comment.id}>
              <span>{comment.authorName}</span>
              <p>{comment.content}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
