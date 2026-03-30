import type { CSSProperties } from "react";

import {
  channelLinks,
  featurePanels,
  feedStories,
  footerColumns,
  primaryLinks,
  sideFeatures,
  spotlightStory,
  utilityLinks,
} from "@/lib/qdaily-data";

import styles from "./home-page.module.css";

type StoryCardProps = {
  category: string;
  title: string;
  excerpt: string;
  publishedAt?: string;
  comments?: number;
  likes?: number;
  palette: string;
  emphasis?: "lead" | "feature" | "compact";
};

function StoryCard({
  category,
  title,
  excerpt,
  publishedAt,
  comments,
  likes,
  palette,
  emphasis = "compact",
}: StoryCardProps) {
  const cardStyle = {
    "--card-gradient": palette,
  } as CSSProperties;

  return (
    <article className={`${styles.storyCard} ${styles[emphasis]}`} style={cardStyle}>
      <div className={styles.storyVisual}>
        <span className={styles.storyCategory}>{category}</span>
      </div>
      <div className={styles.storyBody}>
        <h2 className={styles.storyTitle}>{title}</h2>
        <p className={styles.storyExcerpt}>{excerpt}</p>
      </div>
      {(publishedAt || comments || likes) && (
        <footer className={styles.storyMeta}>
          <span>{publishedAt}</span>
          <span>
            {comments ?? 0} 评论 / {likes ?? 0} 喜欢
          </span>
        </footer>
      )}
    </article>
  );
}

export function HomePage() {
  return (
    <div className={styles.page} id="top">
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <a className={styles.logo} href="#top" aria-label="QDaily 首页">
              <span className={styles.logoMark}>Q</span>
              <span className={styles.logoText}>
                <strong>好奇心日报</strong>
                <span>QDaily</span>
              </span>
            </a>
            <nav aria-label="主导航">
              <ul className={styles.mainNav}>
                {primaryLinks.map((item) => (
                  <li key={item.label}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <nav className={styles.headerCenter} aria-label="频道导航">
            <ul className={styles.categoryNav}>
              {channelLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.headerRight}>
            {utilityLinks.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroGrid} aria-label="首页主编排">
          <a href={`/articles/${spotlightStory.slug}`} className={styles.cardLink}>
            <StoryCard {...spotlightStory} emphasis="lead" />
          </a>

          <div className={styles.sideRail}>
            {sideFeatures.map((item) => (
              <a key={item.id} href={item.href} className={styles.cardLink}>
                <StoryCard category={item.category} title={item.title} excerpt={item.excerpt} palette={item.palette} emphasis="feature" />
              </a>
            ))}
          </div>

          <div className={styles.heroSplit}>
            {featurePanels.map((item) => (
              <a key={item.id} href={item.href} className={styles.cardLink}>
                <StoryCard category={item.category} title={item.title} excerpt={item.excerpt} palette={item.palette} emphasis="feature" />
              </a>
            ))}
          </div>
        </section>

        <section className={styles.feedSection} aria-labelledby="latest-feed">
          <div className={styles.sectionHeading}>
            <p>继续阅读</p>
            <h2 id="latest-feed">编辑挑选的首页文章流</h2>
          </div>
          <div className={styles.feedGrid}>
            {feedStories.map((story) => (
              <a key={story.id} href={`/articles/${story.slug}`} className={styles.cardLink}>
                <StoryCard {...story} />
              </a>
            ))}
          </div>
        </section>

        <section className={styles.paginationSection} aria-label="分页">
          <a href="#top" className={styles.paginationCurrent}>
            1
          </a>
          <a href="#page-2">2</a>
          <a href="#page-3">3</a>
          <a href="#page-4">4</a>
          <span>...</span>
          <a href="#page-2595">2595</a>
        </section>
      </main>

      <a className={styles.toTop} href="#top">
        回到顶部
      </a>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerColumns}>
            {footerColumns.map((column, index) => (
              <ul key={index} className={styles.footerColumn}>
                {column.map((item) => (
                  <li key={item.label}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className={styles.footerBottom}>
            <p>2014 - 2026 QDaily Recreation Studio</p>
            <form className={styles.searchBox}>
              <label className={styles.searchLabel} htmlFor="footer-search">
                搜索文章
              </label>
              <input id="footer-search" name="search" placeholder="输入关键词" type="search" />
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
