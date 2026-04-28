"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  buildReaderEngagementState,
  COMMENT_MAX_LENGTH,
  type PublicComment,
  type ReaderEngagementState,
} from "@/lib/reader-data";
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

const FEEDBACK_DISMISS_MS = 4000;

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path
        d="M12 20.6s-7.2-4.3-9.4-9.1c-1.4-3.1.4-6.6 3.8-6.6 2 0 3.5 1 4.5 2.7 1-1.7 2.5-2.7 4.5-2.7 3.4 0 5.2 3.5 3.8 6.6-2.2 4.8-9.4 9.1-9.4 9.1Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path
        d="M6.5 3.5h11a.5.5 0 0 1 .5.5v16.5l-6-3.4-6 3.4V4a.5.5 0 0 1 .5-.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "·";
  }
  // Grab first visible glyph (handles Chinese, emoji, latin)
  return Array.from(trimmed)[0]?.toUpperCase() ?? "·";
}

function formatRelativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return "";
  }
  const diffSeconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSeconds < 60) return "刚刚";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} 分钟前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} 小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} 天前`;
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type CommentItem = PublicComment & { isPendingOptimistic?: boolean };

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
  const [feedback, setFeedback] = useState<{ kind: "info" | "error"; text: string } | null>(null);
  const [optimisticPending, setOptimisticPending] = useState<CommentItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Server's pending list now authoritative — drop optimistic shadows.
      setOptimisticPending([]);
    }

    void loadState();

    return () => {
      isMounted = false;
    };
  }, [articleSlug]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), FEEDBACK_DISMISS_MS);
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [feedback]);

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

  function submitMutation(
    path: string,
    body: Record<string, unknown>,
    successMessage?: string,
    onAfter?: () => void,
  ) {
    startTransition(async () => {
      try {
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
        // Server now reflects the change — drop optimistic placeholders.
        setOptimisticPending([]);
        if (successMessage) {
          setFeedback({ kind: "info", text: successMessage });
        }
        onAfter?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : "请求失败";
        setFeedback({ kind: "error", text: message });
        // Roll back any optimistic placeholders on failure.
        setOptimisticPending([]);
      }
    });
  }

  const draftLength = commentDraft.length;
  const overLimit = draftLength > COMMENT_MAX_LENGTH;
  const trimmedDraft = commentDraft.trim();
  const submitDisabled = !isConfigured || isPending || trimmedDraft.length === 0 || overLimit;

  const pendingComments = useMemo<CommentItem[]>(() => {
    // Server-known pending + locally-optimistic, deduped by id.
    const seen = new Set<string>();
    const merged: CommentItem[] = [];
    for (const item of optimisticPending) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
    for (const item of state.viewerPendingComments ?? []) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
    return merged;
  }, [optimisticPending, state.viewerPendingComments]);

  function handleSubmitComment() {
    if (!trimmedDraft || overLimit) return;

    const optimistic: CommentItem = {
      id: `optimistic-${Date.now()}`,
      authorName: "你",
      content: trimmedDraft,
      createdAt: new Date().toISOString(),
      status: "pending",
      isPendingOptimistic: true,
    };
    setOptimisticPending((prev) => [optimistic, ...prev]);
    setCommentDraft("");

    submitMutation(
      `/api/articles/${articleSlug}/comments`,
      { content: trimmedDraft },
      "评论已提交，等待审核。",
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.summary}>
        <div className={styles.summaryHeading}>
          <p className={styles.eyebrow}>互动</p>
          <h2 className={styles.heading}>评论区</h2>
          <p className={styles.description}>评论会在审核通过后公开显示。</p>
        </div>

        <div className={styles.actions} role="group" aria-label="文章互动">
          <button
            className={styles.actionButton}
            data-active={state.viewer.hasLiked}
            aria-pressed={state.viewer.hasLiked}
            aria-label={`点赞，当前 ${state.likeCount}`}
            disabled={!isConfigured || isPending}
            type="button"
            onClick={() =>
              submitMutation(`/api/articles/${articleSlug}/like`, {
                active: !state.viewer.hasLiked,
              })
            }
          >
            <HeartIcon filled={state.viewer.hasLiked} />
            <span className={styles.actionLabel}>赞</span>
            <span className={styles.actionCount}>{state.likeCount}</span>
          </button>
          <button
            className={styles.actionButton}
            data-active={state.viewer.hasBookmarked}
            aria-pressed={state.viewer.hasBookmarked}
            aria-label={`收藏，当前 ${state.bookmarkCount}`}
            disabled={!isConfigured || isPending}
            type="button"
            onClick={() =>
              submitMutation(`/api/articles/${articleSlug}/bookmark`, {
                active: !state.viewer.hasBookmarked,
              })
            }
          >
            <BookmarkIcon filled={state.viewer.hasBookmarked} />
            <span className={styles.actionLabel}>藏</span>
            <span className={styles.actionCount}>{state.bookmarkCount}</span>
          </button>
        </div>
      </header>

      <div className={styles.commentComposer}>
        <textarea
          aria-label="评论内容"
          aria-invalid={overLimit || undefined}
          disabled={!isConfigured || isPending}
          placeholder={isConfigured ? "写下你的看法，审核通过后会公开显示。" : "评论暂不可用。"}
          value={commentDraft}
          maxLength={COMMENT_MAX_LENGTH * 2}
          onChange={(event) => setCommentDraft(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              handleSubmitComment();
            }
          }}
        />
        <div className={styles.composerFooter}>
          <span className={styles.composerHint}>
            <span className={overLimit ? styles.counterOver : styles.counter}>
              {draftLength}/{COMMENT_MAX_LENGTH}
            </span>
            <span className={styles.shortcutHint}>· ⌘/Ctrl + Enter 提交</span>
          </span>
          <button
            className={styles.submitButton}
            disabled={submitDisabled}
            type="button"
            onClick={handleSubmitComment}
          >
            {isPending ? "提交中…" : "提交评论"}
          </button>
        </div>
      </div>

      {!isConfigured ? (
        <p className={styles.notice} data-kind="info">
          当前环境尚未配置 Supabase，互动功能暂时不可用。
        </p>
      ) : null}
      {feedback ? (
        <p className={styles.notice} data-kind={feedback.kind} role="status">
          {feedback.text}
        </p>
      ) : null}

      {state.viewer.isLoggedIn ? null : (
        <p className={styles.loginHint}>
          想参与互动？
          <Link href="/account/login">前往登录</Link>
        </p>
      )}

      {pendingComments.length > 0 ? (
        <section className={styles.pendingSection} aria-label="审核中的评论">
          <p className={styles.pendingHeading}>审核中（仅你可见）</p>
          <ul className={styles.commentList}>
            {pendingComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} pending />
            ))}
          </ul>
        </section>
      ) : null}

      <ul className={styles.commentList} aria-label="读者评论">
        {state.publicComments.length === 0 ? (
          <li className={styles.emptyState}>
            <span className={styles.emptyMark} aria-hidden="true">
              ❝
            </span>
            <span>还没有公开评论 — 欢迎成为第一位留言的人。</span>
            <span className={styles.emptyHint}>
              累计历史互动 {initialCommentCount}，新评论将从这里重新开始。
            </span>
          </li>
        ) : (
          state.publicComments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
        )}
      </ul>
    </section>
  );
}

function CommentCard({ comment, pending = false }: { comment: CommentItem; pending?: boolean }) {
  return (
    <li className={styles.commentItem} data-pending={pending || undefined}>
      <span className={styles.avatar} aria-hidden="true">
        {getInitial(comment.authorName)}
      </span>
      <div className={styles.commentBody}>
        <div className={styles.commentMeta}>
          <span className={styles.authorName}>{comment.authorName}</span>
          <span className={styles.metaDot} aria-hidden="true">
            ·
          </span>
          <time className={styles.commentTime} dateTime={comment.createdAt}>
            {formatRelativeTime(comment.createdAt)}
          </time>
          {pending ? <span className={styles.pendingTag}>审核中</span> : null}
        </div>
        <p className={styles.commentContent}>{comment.content}</p>
      </div>
    </li>
  );
}
