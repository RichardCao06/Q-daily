import type { CSSProperties } from "react";

import {
  channelLinks,
  featurePanels,
  feedStories,
  footerColumns,
  type HomePageData,
  primaryLinks,
  sideFeatures,
  spotlightStory,
  utilityLinks,
} from "@/lib/qdaily-data";

import styles from "./home-page.module.css";

type VisualCardProps = {
  category: string;
  title: string;
  excerpt: string;
  palette: string;
  publishedAt?: string;
  comments?: number;
  likes?: number;
  className?: string;
  titleLevel?: "h2" | "h3";
  accent?: "dark" | "light";
};

function VisualCard({
  category,
  title,
  excerpt,
  palette,
  publishedAt,
  comments,
  likes,
  className,
  titleLevel = "h3",
  accent = "dark",
}: VisualCardProps) {
  const Title = titleLevel;
  const cardStyle = {
    "--card-gradient": palette,
  } as CSSProperties;

  return (
    <article className={`${styles.visualCard} ${className ?? ""}`.trim()} style={cardStyle}>
      <div className={styles.visualImage}>
        <span className={`${styles.visualCategory} ${accent === "light" ? styles.visualCategoryLight : ""}`.trim()}>
          {category}
        </span>
      </div>
      <div className={styles.visualBody}>
        <Title className={styles.visualTitle}>{title}</Title>
        <p className={styles.visualExcerpt}>{excerpt}</p>
      </div>
      {(publishedAt || comments || likes) && (
        <footer className={styles.visualMeta}>
          <span>{publishedAt}</span>
          <span>
            {comments ?? 0} 评论 / {likes ?? 0} 喜欢
          </span>
        </footer>
      )}
    </article>
  );
}

function LatestModule({ latestStory }: { latestStory: HomePageData["sideFeatures"][0] }) {
  return (
    <a className={styles.latestLink} href={latestStory.href}>
      <article className={styles.latestModule}>
        <div className={styles.latestHeader}>
          <span>{latestStory.category}</span>
          <span>最新</span>
        </div>
        <div className={styles.latestDigits}>24</div>
        <p className={styles.latestCopy}>{latestStory.excerpt}</p>
        <div className={styles.latestFooter}>更新于 03 / 30</div>
      </article>
    </a>
  );
}

function LoginModule() {
  return (
    <section className={styles.loginModule} aria-label="登录模块">
      <p className={styles.moduleEyebrow}>QDaily 会员</p>
      <h2 className={styles.loginTitle}>登录 / 注册</h2>
      <p className={styles.loginCopy}>收藏文章、参与评论、同步阅读进度，保持和原版 QDaily 一样紧凑的个人入口节奏。</p>
      <div className={styles.loginActions}>
        <a href="/account">登录</a>
        <a href="/account">注册</a>
      </div>
    </section>
  );
}

type HomePageProps = {
  data?: HomePageData;
};

export function HomePage({
  data = {
    spotlightStory,
    sideFeatures,
    featurePanels,
    feedStories,
  },
}: HomePageProps) {
  const emphasizedStoryIds = new Set(data.feedStories.slice(0, 2).map((story) => story.id));

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
            <a href="/account">登录</a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.curatorIntro} aria-label="首页导语">
          <div className={styles.curatorNote}>
            <span>今日策展</span>
            <p>像一本被翻开的周末杂志，留下呼吸感，也留下值得细看的新闻。</p>
          </div>
          <div className={styles.curatorKicker}>
            <strong>Fresh Reading</strong>
            <p>在保持首页编排效率的同时，把内容重新摆回更轻、更安静、更有策展感的视觉秩序里。</p>
            <div className={styles.editorMemo}>
              <span>编者手记</span>
              <p>今天的首页故意把节奏放慢一点，让重要内容像展墙上的作品说明，而不是被挤进一面过度喧闹的信息墙。</p>
            </div>
          </div>
        </section>

        <section className={styles.heroBoard} aria-label="首页主编排">
          <a href={`/articles/${data.spotlightStory.slug}`} className={`${styles.heroSlot} ${styles.heroLead}`.trim()}>
            <VisualCard {...data.spotlightStory} className={styles.leadCard} titleLevel="h2" accent="light" />
          </a>

          <div className={`${styles.heroSlot} ${styles.heroLogin}`.trim()}>
            <LoginModule />
          </div>

          <div className={`${styles.heroSlot} ${styles.heroLatest}`.trim()}>
            <LatestModule latestStory={data.sideFeatures[0]} />
          </div>

          <a href={data.featurePanels[0].href} className={`${styles.heroSlot} ${styles.heroFeatureLarge}`.trim()}>
            <VisualCard {...data.featurePanels[0]} className={styles.featureLargeCard} />
          </a>

          <a href={data.featurePanels[1].href} className={`${styles.heroSlot} ${styles.heroFeatureSmall}`.trim()}>
            <VisualCard {...data.featurePanels[1]} className={styles.featureSmallCard} />
          </a>

          <a href={data.sideFeatures[1].href} className={`${styles.heroSlot} ${styles.heroDownload}`.trim()}>
            <VisualCard
              category={data.sideFeatures[1].category}
              title={data.sideFeatures[1].title}
              excerpt={data.sideFeatures[1].excerpt}
              palette={data.sideFeatures[1].palette}
              className={styles.downloadCard}
              accent="light"
            />
          </a>
        </section>

        <section className={styles.feedSection} aria-labelledby="latest-feed">
          <div className={styles.sectionHeading}>
            <div>
              <p>Latest Stories</p>
              <h2 id="latest-feed">编辑挑选的首页文章流</h2>
            </div>
            <span className={styles.sectionHint}>不再强调压迫式信息墙，而让每一条内容都像被认真摆放过的展签。</span>
          </div>
          <div className={styles.feedGrid}>
            {data.feedStories.map((story) => (
              <a
                key={story.id}
                href={`/articles/${story.slug}`}
                className={`${styles.feedLink} ${emphasizedStoryIds.has(story.id) ? styles.feedWide : ""}`.trim()}
              >
                <VisualCard {...story} className={styles.feedCard} />
              </a>
            ))}
          </div>
        </section>

        <section className={styles.loadMoreSection} aria-label="继续浏览">
          <a href="#page-2" className={styles.loadMoreLink}>
            加载更多
          </a>
          <div className={styles.paginationSection}>
            <a href="#top" className={styles.paginationCurrent}>
              1
            </a>
            <a href="#page-2">2</a>
            <a href="#page-3">3</a>
            <a href="#page-4">4</a>
            <span>...</span>
            <a href="#page-2595">2595</a>
          </div>
        </section>
      </main>

      <a className={styles.toTop} href="#top">
        回到顶部
      </a>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerBadge}>Q</span>
            <div>
              <strong>好奇心日报</strong>
              <p>用更接近 2019 年原站的黄黑骨架，重新排一份可读的数字杂志。</p>
            </div>
          </div>

          <div className={styles.footerMain}>
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

            <div className={styles.footerTools}>
              <form className={styles.searchBox}>
                <label className={styles.searchLabel} htmlFor="footer-search">
                  搜索文章
                </label>
                <input id="footer-search" name="search" placeholder="输入关键词" type="search" />
              </form>
              <p className={styles.footerCopy}>2014 - 2026 QDaily Recreation Studio</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
