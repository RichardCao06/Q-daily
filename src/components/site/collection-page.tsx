import type { CSSProperties } from "react";
import Link from "next/link";

import { type Article } from "@/lib/qdaily-data";

import { SiteHeader } from "./site-header";
import styles from "./collection-page.module.css";

type CollectionPageProps = {
  title: string;
  description: string;
  stories: Article[];
};

export function CollectionPage({ title, description, stories }: CollectionPageProps) {
  return (
    <div className={styles.page}>
      <SiteHeader currentLabel={title} />

      <main className={styles.main}>
        <section className={styles.intro} aria-label="栏目页导语">
          <section className={styles.hero}>
            <span className={styles.eyebrow}>Collection</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </section>

          <aside className={styles.note}>
            <span>阅读索引</span>
            <p>把栏目、标签和文章列表统一放回白底的编辑秩序里，让它和首页、文章页保持同一套呼吸感与留白。</p>
          </aside>
        </section>

        <section className={styles.grid}>
          {stories.map((story) => {
            const cardStyle = {
              "--card-gradient": story.palette,
            } as CSSProperties;

            return (
              <article key={story.slug} className={styles.card}>
                <Link href={`/articles/${story.slug}`}>
                  <div className={styles.cardVisual} style={cardStyle} />
                  <div className={styles.cardBody}>
                    <span className={styles.cardCategory}>{story.category.name}</span>
                    <h2>{story.title}</h2>
                    <p>{story.excerpt}</p>
                    <div className={styles.meta}>
                      {story.publishedAt} / {story.comments} 评论
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
