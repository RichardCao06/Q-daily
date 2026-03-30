import type { CSSProperties } from "react";
import Link from "next/link";

import { getRelatedArticles, type Article } from "@/lib/qdaily-data";

import styles from "./article-page.module.css";

type ArticlePageProps = {
  article: Article;
};

export function ArticlePage({ article }: ArticlePageProps) {
  const relatedStories = getRelatedArticles(article.slug);
  const heroStyle = {
    "--article-gradient": article.palette,
  } as CSSProperties;

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
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero} style={heroStyle}>
          <Link className={styles.heroCategory} href={article.category.href}>
            {article.category.name}
          </Link>
          <h1 className={styles.heroTitle}>{article.title}</h1>
          <p className={styles.heroExcerpt}>{article.excerpt}</p>
          <div className={styles.heroMeta}>
            <span>{article.author}</span>
            <span>{article.publishedAt}</span>
            <span>{article.readingTime}</span>
            <span>
              {article.comments} 评论 / {article.likes} 喜欢
            </span>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.body}>
            {article.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <aside className={styles.sidebar}>
            <section className={styles.sidebarCard}>
              <h2>文章标签</h2>
              <ul className={styles.tagList}>
                {article.tags.map((tag) => (
                  <li key={tag.slug}>
                    <Link href={tag.href}>{tag.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
            <section className={styles.sidebarCard}>
              <h2>编辑备注</h2>
              <p>这一页延续了 QDaily 文章页的“标题先立住、正文再舒展、右侧给辅助信息”的节奏。</p>
            </section>
          </aside>
        </div>

        <section className={styles.relatedSection}>
          <h2 className={styles.relatedHeading}>相关阅读</h2>
          <div className={styles.relatedGrid}>
            {relatedStories.map((story) => {
              const cardStyle = {
                "--card-gradient": story.palette,
              } as CSSProperties;

              return (
                <article key={story.slug} className={styles.relatedCard}>
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
