import type { CSSProperties } from "react";
import Link from "next/link";

import { getRelatedArticles, type Article } from "@/lib/qdaily-data";

import { ArticleEngagement } from "./article-engagement";
import styles from "./article-page.module.css";

type ArticlePageProps = {
  article: Article;
  relatedStories?: Article[];
};

export function ArticlePage({ article, relatedStories = getRelatedArticles(article.slug, 4) }: ArticlePageProps) {
  const highlightedQuote = article.body[1] ?? article.excerpt;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.logo} href="/">
            <span className={styles.logoMark}>Q</span>
            <span className={styles.logoText}>
              <strong>好奇心日报</strong>
              <span>QDaily</span>
            </span>
          </Link>
          <nav className={styles.nav} aria-label="文章页导航">
            <Link href="/">首页</Link>
            <Link href={article.category.href}>{article.category.name}</Link>
            <Link href="/tags/longform">长文章</Link>
            <Link href="/search">搜索</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.articleLayout}>
          <div className={styles.mainColumn}>
            <section className={styles.storyPaper}>
              <header className={styles.storyHeader}>
                <div className={styles.storyTopMeta}>
                  <Link className={styles.storyCategory} href={article.category.href}>
                    {article.category.name}
                  </Link>
                  <span>{article.publishedAt}</span>
                </div>
                <h1 className={styles.storyTitle}>{article.title}</h1>
                <div className={styles.storyGuide}>
                  <span>导读</span>
                  <p>把重要观点先轻轻放在前面，像策展说明一样，为读者建立进入文章的第一层语境。</p>
                </div>
                <p className={styles.storyExcerpt}>{article.excerpt}</p>
                <aside className={styles.storyQuote} aria-label="文章摘录">
                  <span>摘录</span>
                  <p>{highlightedQuote}</p>
                </aside>
                <div className={styles.storyMeta}>
                  <span>{article.author}</span>
                  <span>{article.readingTime}</span>
                  <span>
                    {article.comments} 评论 / {article.likes} 喜欢
                  </span>
                </div>
                <div
                  className={styles.storyVisual}
                  style={
                    {
                      "--article-gradient": article.palette,
                    } as CSSProperties
                  }
                >
                  <span>{article.coverAlt}</span>
                </div>
              </header>

              <section className={styles.storyBody}>
                {article.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            </section>

            <section className={styles.commentsSection}>
              <div className={styles.commentsIntro}>
                <strong>把互动收束在正文之后</strong>
                <p>第一版正式上线会把点赞、收藏和评论放在正文之后，保留杂志式留白，同时让登录用户能留下真实反馈。</p>
              </div>
              <ArticleEngagement articleSlug={article.slug} initialCommentCount={article.comments} initialLikeCount={article.likes} />
            </section>
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.sidebarLogin}>
              <p className={styles.sidebarEyebrow}>账户</p>
              <h2>登录后参与评论</h2>
              <p>保留右侧窄栏的入口感，让账户、互动和推荐都停留在正文之外。</p>
              <div className={styles.sidebarActions}>
                <Link href="/account/login">登录</Link>
                <Link href="/account/login">注册</Link>
              </div>
            </section>

            <section className={styles.sidebarCard}>
              <p className={styles.sidebarLabel}>延伸阅读索引</p>
              <h2 className={styles.sectionHeading}>编辑推荐</h2>
              <ol className={styles.recommendationList}>
                {relatedStories.slice(0, 3).map((story) => (
                  <li key={story.slug}>
                    <Link href={`/articles/${story.slug}`}>{story.title}</Link>
                    <span>{story.category.name}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.sidebarCard}>
              <h2 className={styles.sectionHeading}>文章标签</h2>
              <ul className={styles.tagList}>
                {article.tags.map((tag) => (
                  <li key={tag.slug}>
                    <Link href={tag.href}>{tag.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        <section className={styles.relatedSection}>
          <h2 className={styles.sectionHeading}>相关阅读</h2>
          <div className={styles.relatedGrid}>
            {relatedStories.map((story, index) => {
              const cardStyle = {
                "--card-gradient": story.palette,
              } as CSSProperties;

              return (
                <article key={story.slug} className={`${styles.relatedCard} ${index === 0 ? styles.relatedWide : ""}`.trim()}>
                  <Link href={`/articles/${story.slug}`}>
                    <div className={styles.relatedVisual} style={cardStyle} />
                    <div className={styles.relatedBody}>
                      <span>{story.category.name}</span>
                      <h3>{story.title}</h3>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
