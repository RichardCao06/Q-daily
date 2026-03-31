"use client";

import styles from "./admin-shell.module.css";

export type AdminState = {
  configured: boolean;
  isAdmin: boolean;
  summary: {
    pendingCount: number;
    approvedCount: number;
  };
  users: Array<{
    id: string;
    displayName: string;
    email: string;
    likeCount: number;
    bookmarkCount: number;
    commentCount: number;
  }>;
  articles: Array<{
    articleSlug: string;
    title: string;
    likeCount: number;
    bookmarkCount: number;
    approvedCommentCount: number;
    pendingCommentCount: number;
  }>;
  comments: Array<{
    id: string;
    articleSlug: string;
    articleTitle: string;
    authorName: string;
    content: string;
    status: "pending" | "approved" | "rejected" | "hidden";
    createdAt: string;
  }>;
};

type AdminShellProps = {
  state: AdminState;
  onModerate?: (commentId: string, status: "approved" | "rejected" | "hidden") => void;
};

export function AdminShell({ state, onModerate }: AdminShellProps) {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Admin</p>
        <h1>评论审核后台</h1>
        <p className={styles.description}>优先处理待审核评论，保证前台讨论区保持克制和可读。</p>
      </section>

      {!state.configured ? <section className={styles.notice}>当前环境尚未配置 Supabase，后台暂时不可用。</section> : null}

      {!state.isAdmin ? (
        <section className={styles.notice}>当前账号没有后台访问权限。</section>
      ) : (
        <>
          <section className={styles.summary}>
            <span>{state.summary.pendingCount} 条待审核</span>
            <span>{state.summary.approvedCount} 条已通过</span>
          </section>

          <section className={styles.queue}>
            <h2 className={styles.sectionHeading}>用户概览</h2>
            <ul>
              {state.users.length === 0 ? <li className={styles.empty}>当前还没有可展示的用户数据。</li> : null}
              {state.users.map((user) => (
                <li key={user.id} className={styles.card}>
                  <div className={styles.meta}>
                    <strong>{user.displayName}</strong>
                    <span>{user.email}</span>
                  </div>
                  <p>{user.likeCount} 赞 / {user.bookmarkCount} 收藏 / {user.commentCount} 评论</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.queue}>
            <h2 className={styles.sectionHeading}>文章互动统计</h2>
            <ul>
              {state.articles.length === 0 ? <li className={styles.empty}>当前还没有文章互动数据。</li> : null}
              {state.articles.map((article) => (
                <li key={article.articleSlug} className={styles.card}>
                  <div className={styles.meta}>
                    <strong>{article.title}</strong>
                    <span>{article.articleSlug}</span>
                  </div>
                  <p>
                    {article.likeCount} 赞 / {article.bookmarkCount} 收藏 / {article.approvedCommentCount} 已通过 / {article.pendingCommentCount} 待审核
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.queue}>
            <h2 className={styles.sectionHeading}>评论审核队列</h2>
            <ul>
              {state.comments.length === 0 ? <li className={styles.empty}>当前没有待处理评论。</li> : null}
              {state.comments.map((comment) => (
                <li key={comment.id} className={styles.card}>
                  <div className={styles.meta}>
                    <strong>{comment.authorName}</strong>
                    <span>{comment.articleTitle}</span>
                  </div>
                  <p>{comment.content}</p>
                  <div className={styles.actions}>
                    <button type="button" onClick={() => onModerate?.(comment.id, "approved")}>
                      通过
                    </button>
                    <button type="button" onClick={() => onModerate?.(comment.id, "rejected")}>
                      拒绝
                    </button>
                    <button type="button" onClick={() => onModerate?.(comment.id, "hidden")}>
                      隐藏
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
