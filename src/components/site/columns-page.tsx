import Link from "next/link";

import { SiteHeader } from "./site-header";
import styles from "./columns-page.module.css";

type ColumnStory = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

export type ColumnCategorySummary = {
  slug: string;
  name: string;
  href: string;
  description: string;
  articleCount: number;
};

export type FeaturedColumnCategory = ColumnCategorySummary & {
  featuredStory: ColumnStory | null;
};

type ColumnsPageProps = {
  categorySummaries: ColumnCategorySummary[];
  featuredCategories: FeaturedColumnCategory[];
  highlight: {
    busiest: string;
    reflective: string;
    freshest: string;
  };
};

function formatArticleCount(articleCount: number) {
  return `${articleCount} 篇文章`;
}

function formatArchiveCount(articleCount: number) {
  return `共 ${articleCount} 篇`;
}

function formatPublishedAt(publishedAt: string) {
  const matched = publishedAt.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!matched) {
    return publishedAt;
  }

  return `${matched[1]}.${matched[2]}.${matched[3]}`;
}

export function ColumnsPage({ categorySummaries, featuredCategories, highlight }: ColumnsPageProps) {
  return (
    <div className={styles.page}>
      <SiteHeader currentLabel="栏目中心" />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Columns Atlas</span>
            <h1>栏目中心</h1>
            <p className={styles.lead}>从栏目进入，而不是从时间进入</p>
            <p className={styles.description}>
              首页负责给出当天的阅读气候，栏目中心则把站点里的长期主题重新铺开。你可以先判断自己想进入哪类问题，再决定读哪篇文章。
            </p>
          </div>

          <aside className={styles.guideBoard} aria-label="今日导览">
            <span className={styles.guideLabel}>今日导览</span>
            <ul className={styles.guideList}>
              <li>更新最多：{highlight.busiest}</li>
              <li>慢读首选：{highlight.reflective}</li>
              <li>最近值得进入：{highlight.freshest}</li>
            </ul>
          </aside>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>Category Index</span>
            <h2>栏目索引</h2>
            <p>所有栏目都按主题展开，先看方向，再进入栏目页继续读。</p>
          </div>

          <div className={styles.indexGrid}>
            {categorySummaries.map((category) => (
              <article key={category.slug} className={styles.indexCard}>
                <div className={styles.indexMeta}>
                  <span>{formatArticleCount(category.articleCount)}</span>
                  <span className={styles.indexSlug}>/{category.slug}</span>
                </div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <Link href={category.href} aria-label={`进入${category.name}栏目`}>
                  进入{category.name}栏目
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>Featured Columns</span>
            <h2>重点栏目</h2>
            <p>先从一个代表栏目切入，看到它此刻最能代表自身气质的一篇。</p>
          </div>

          <div className={styles.featuredGrid}>
            {featuredCategories.map((category) => (
              <article key={category.slug} className={styles.featuredCard}>
                <div className={styles.featuredTop}>
                  <div>
                    <span className={styles.featuredCount}>{formatArchiveCount(category.articleCount)}</span>
                    <h3>{category.name}</h3>
                  </div>
                  <Link href={category.href} className={styles.categoryLink}>
                    查看栏目
                  </Link>
                </div>

                <p className={styles.featuredDescription}>{category.description}</p>

                {category.featuredStory ? (
                  <Link
                    href={`/articles/${category.featuredStory.slug}`}
                    className={styles.storyCard}
                    aria-label={`阅读代表文章：${category.featuredStory.title}`}
                  >
                    <span className={styles.storyMeta}>{formatPublishedAt(category.featuredStory.publishedAt)}</span>
                    <h4>{category.featuredStory.title}</h4>
                    <p>{category.featuredStory.excerpt}</p>
                  </Link>
                ) : (
                  <div className={styles.storyEmpty}>
                    <span>代表文章稍后补齐</span>
                    <p>这个栏目已经建立，但当前还没有可展示的代表文章。</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
