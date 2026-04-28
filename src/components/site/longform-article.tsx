import Link from "next/link";

import { renderInlineMarkdown } from "@/lib/inline-markdown";
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
        <article className={styles.story}>
          <header className={styles.header}>
            <Link className={styles.category} href={article.category.href}>
              {article.category.name}
            </Link>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.excerpt}>{article.excerpt}</p>
            <div className={styles.meta}>
              <span>{article.author}</span>
              <span>{article.publishedAt}</span>
              <span>{article.readingTime}</span>
            </div>
          </header>

          {article.heroImage ? (
            <figure className={styles.media}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.heroImage} src={article.heroImage.src} alt={article.heroImage.alt} />
              {article.heroImage.caption ? <figcaption className={styles.caption}>{article.heroImage.caption}</figcaption> : null}
            </figure>
          ) : null}

          <div className={styles.content}>
            {(article.longformBlocks ?? []).map((block, index) => {
              if (block.type === "paragraph") {
                return (
                  <p key={`${block.type}-${index}`} className={styles.paragraph}>
                    {renderInlineMarkdown(block.content, `p-${index}`)}
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

              if (block.type === "list") {
                const ListTag = block.ordered ? "ol" : "ul";
                return (
                  <ListTag key={`${block.type}-${index}`} className={styles.list}>
                    {block.items.map((item, itemIndex) => (
                      <li key={`item-${itemIndex}`}>
                        {renderInlineMarkdown(item, `list-${index}-${itemIndex}`)}
                      </li>
                    ))}
                  </ListTag>
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
          </div>

          <footer className={styles.storyFooter}>
            <div className={styles.storyMetaGroup}>
              <Link href={article.category.href}>{article.category.name}</Link>
            </div>
            <div className={styles.storyMetaGroup}>
              <div className={styles.tagList}>
                {article.tags.map((tag) => (
                  <Link key={tag.slug} href={tag.href}>
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </footer>
        </article>

        {relatedStories.length > 0 ? (
          <footer className={styles.footer}>
            <h2 className={styles.relatedHeading}>相关阅读</h2>
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
        ) : null}
      </main>
    </div>
  );
}
