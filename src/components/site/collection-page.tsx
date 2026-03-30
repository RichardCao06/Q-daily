import type { CSSProperties } from "react";
import Link from "next/link";

import { channelLinks, type Article } from "@/lib/qdaily-data";

import styles from "./collection-page.module.css";

type CollectionPageProps = {
  title: string;
  description: string;
  stories: Article[];
};

export function CollectionPage({ title, description, stories }: CollectionPageProps) {
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
          <nav className={styles.nav} aria-label="栏目导航">
            {channelLinks.map((item) => (
              <Link key={item.label} href={item.href} data-current={item.label === title}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>Collection</span>
          <h1>{title}</h1>
          <p>{description}</p>
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
                    <span>{story.category.name}</span>
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
