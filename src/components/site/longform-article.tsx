import Link from "next/link";

import { getRelatedArticles, type Article } from "@/lib/qdaily-data";

import styles from "./longform-article.module.css";

type LongformArticlePageProps = {
  article: Article;
  relatedStories?: Article[];
};

export function LongformArticlePage({ article, relatedStories = getRelatedArticles(article.slug, 4) }: LongformArticlePageProps) {
  return (
    <div className={styles.page}>
      <main className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.metaRail}>
            <p className={styles.eyebrow}>{article.category.name}</p>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.excerpt}>{article.excerpt}</p>
            <div className={styles.meta}>
              <span>{article.author}</span>
              <span>{article.publishedAt}</span>
              <span>{article.readingTime}</span>
            </div>
          </div>

          {article.heroImage ? (
            <figure className={styles.heroFigure}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.heroImage} src={article.heroImage.src} alt={article.heroImage.alt} />
              {article.heroImage.caption ? <figcaption className={styles.caption}>{article.heroImage.caption}</figcaption> : null}
            </figure>
          ) : null}
        </section>

        <section className={styles.bodyGrid}>
          <aside className={styles.rail}>
            <div className={styles.railCard}>
              <strong>栏目</strong>
              <Link href={article.category.href}>{article.category.name}</Link>
            </div>
            <div className={styles.railCard}>
              <strong>标签</strong>
              <div className={styles.railTags}>
                {article.tags.map((tag) => (
                  <Link key={tag.slug} href={tag.href}>
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <article className={styles.story}>
            {(article.longformBlocks ?? []).map((block, index) => {
              if (block.type === "paragraph") {
                return (
                  <p key={`${block.type}-${index}`} className={styles.paragraph}>
                    {block.content}
                  </p>
                );
              }

              if (block.type === "heading") {
                const HeadingTag = block.level === 3 ? "h3" : "h2";
                return (
                  <HeadingTag key={`${block.type}-${index}`} className={styles.sectionHeading}>
                    {block.content}
                  </HeadingTag>
                );
              }

              return (
                <figure key={`${block.type}-${index}`} className={styles.media}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={block.src} alt={block.alt} />
                  {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
                </figure>
              );
            })}
          </article>
        </section>

        <footer className={styles.footer}>
          <h2 className={styles.sectionHeading}>相关阅读</h2>
          <div className={styles.related}>
            {relatedStories.map((story) => (
              <article key={story.slug}>
                <Link href={`/articles/${story.slug}`}>
                  <strong>{story.title}</strong>
                  <p>{story.excerpt}</p>
                </Link>
              </article>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}
