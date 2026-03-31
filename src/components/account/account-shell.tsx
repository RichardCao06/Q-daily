"use client";

import Link from "next/link";

import { SiteHeader } from "@/components/site/site-header";

import styles from "./account-shell.module.css";

export type AccountState = {
  configured: boolean;
  isLoggedIn: boolean;
  profile: {
    displayName: string;
    email: string;
  } | null;
  likes: Array<{
    articleSlug: string;
    title: string;
  }>;
  bookmarks: Array<{
    articleSlug: string;
    title: string;
  }>;
  comments: Array<{
    id: string;
    articleSlug: string;
    articleTitle: string;
    content: string;
    status: "pending" | "approved" | "rejected" | "hidden";
    createdAt: string;
  }>;
};

const statusLabels: Record<AccountState["comments"][number]["status"], string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
  hidden: "已隐藏",
};

type AccountShellProps = {
  state: AccountState;
};

export function AccountShell({ state }: AccountShellProps) {
  return (
    <div className={styles.page}>
      <SiteHeader currentLabel="个人中心" />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Account</p>
          <h1>个人中心</h1>
          <p className={styles.description}>
            {state.isLoggedIn ? "查看你的点赞、收藏和评论审核进度。" : "登录后即可查看你的点赞、收藏和评论进度。"}
          </p>
        </section>

        {!state.configured ? (
          <section className={styles.notice}>当前环境尚未配置 Supabase，个人中心暂时不可用。</section>
        ) : null}

        {!state.isLoggedIn ? (
          <section className={styles.guestCard}>
            <p>登录后可以跨设备保存喜欢的文章、查看收藏清单，并跟踪评论审核状态。</p>
            <Link href="/account/login">去登录</Link>
          </section>
        ) : (
          <>
            <section className={styles.profileCard}>
              <div>
                <p className={styles.profileName}>{state.profile?.displayName}</p>
                <p className={styles.profileEmail}>{state.profile?.email}</p>
              </div>
              <div className={styles.stats}>
                <span>{state.likes.length} 篇点赞</span>
                <span>{state.bookmarks.length} 篇收藏</span>
                <span>{state.comments.length} 条评论</span>
              </div>
            </section>

            <div className={styles.grid}>
              <section className={styles.panel}>
                <h2>我的点赞</h2>
                <ul>
                  {state.likes.length === 0 ? <li>还没有点赞记录。</li> : null}
                  {state.likes.map((like) => (
                    <li key={like.articleSlug}>
                      <Link href={`/articles/${like.articleSlug}`}>{like.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={styles.panel}>
                <h2>我的收藏</h2>
                <ul>
                  {state.bookmarks.length === 0 ? <li>还没有收藏记录。</li> : null}
                  {state.bookmarks.map((bookmark) => (
                    <li key={bookmark.articleSlug}>
                      <Link href={`/articles/${bookmark.articleSlug}`}>{bookmark.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className={styles.panel}>
              <h2>我的评论</h2>
              <ul className={styles.comments}>
                {state.comments.length === 0 ? <li>还没有评论记录。</li> : null}
                {state.comments.map((comment) => (
                  <li key={comment.id}>
                    <div className={styles.commentMeta}>
                      <Link href={`/articles/${comment.articleSlug}`}>{comment.articleTitle}</Link>
                      <span>{statusLabels[comment.status]}</span>
                    </div>
                    <p>{comment.content}</p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
