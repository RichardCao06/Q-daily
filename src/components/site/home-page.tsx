import type { CSSProperties } from "react";

import {
  defaultHomePageCopy,
  type HomePageData,
  type HomePageCopy,
} from "@/lib/qdaily-data";

import styles from "./home-page.module.css";

type VisualCardProps = {
  category: string;
  title: string;
  excerpt: string;
  palette: string;
  coverImage?: {
    src: string;
    alt: string;
  };
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
  coverImage,
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
        {coverImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.visualCover} src={coverImage.src} alt={coverImage.alt} />
            <div className={styles.visualScrim} />
          </>
        ) : null}
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

function formatLatestPublishedAt(publishedAt?: string) {
  if (!publishedAt) {
    return null;
  }

  const match = publishedAt.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (!match) {
    return publishedAt;
  }

  return `${match[1]} / ${match[2]}`;
}

function LatestModule({
  latestStory,
  meta,
  latestPublishedAt,
}: {
  latestStory: HomePageData["sideFeatures"][0];
  meta: HomePageCopy["latestMeta"];
  latestPublishedAt?: string;
}) {
  const formattedLatestPublishedAt = formatLatestPublishedAt(latestPublishedAt);

  return (
    <a className={styles.latestLink} href={latestStory.href}>
      <article className={styles.latestModule}>
        <div className={styles.latestHeader}>
          <span>{latestStory.category}</span>
          <span>{meta.statusLabel}</span>
        </div>
        <h2 className={styles.latestDigits}>{latestStory.title}</h2>
        <p className={styles.latestCopy}>{latestStory.excerpt}</p>
        {formattedLatestPublishedAt ? (
          <div className={styles.latestFooter}>
            {meta.updatedAtPrefix} {formattedLatestPublishedAt}
          </div>
        ) : null}
      </article>
    </a>
  );
}

function LoginModule({
  moduleCopy,
  actionCopy,
}: {
  moduleCopy: HomePageCopy["loginModule"];
  actionCopy: HomePageCopy["loginActions"];
}) {
  return (
    <section className={styles.loginModule} aria-label="登录模块">
      <p className={styles.moduleEyebrow}>{moduleCopy.eyebrow}</p>
      <h2 className={styles.loginTitle}>{moduleCopy.title}</h2>
      <p className={styles.loginCopy}>{moduleCopy.text}</p>
      <div className={styles.loginActions}>
        <a href={moduleCopy.href}>{actionCopy.loginLabel}</a>
        <a href={moduleCopy.href}>{actionCopy.registerLabel}</a>
      </div>
    </section>
  );
}

type HomePageProps = {
  data: HomePageData;
};

export function HomePage({ data }: HomePageProps) {
  const emphasizedStoryIds = new Set(data.feedStories.slice(0, 2).map((story) => story.id));
  const hasRenderableHomePage = !data.isEmpty && Boolean(data.spotlightStory) && data.feedStories.length > 0;
  const copy = data.copy ?? defaultHomePageCopy;

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
                {data.primaryLinks.map((item) => (
                  <li key={item.label}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <nav className={styles.headerCenter} aria-label="频道导航">
            <ul className={styles.categoryNav}>
              {data.channelLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.headerRight}>
            {data.utilityLinks.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
            <a href="/account">登录</a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {!hasRenderableHomePage ? (
          <section className={styles.emptyState} aria-label="首页空状态">
            <span className={styles.emptyEyebrow}>Supabase Homepage</span>
            <h1>首页内容暂未配置</h1>
            <p>请先在 Supabase 中发布文章并配置首页模块，首页才会显示正式内容。</p>
          </section>
        ) : (
          <>
            <section className={styles.heroBoard} aria-label="首页主编排">
              <div className={styles.heroMasthead}>
                <section className={styles.curatorNote} aria-label="首页导语">
                  <span>{copy.curatorNote.label}</span>
                  <p>{copy.curatorNote.text}</p>
                </section>

                <div className={styles.curatorKicker}>
                  <strong>{copy.curatorKicker.title}</strong>
                  <p>{copy.curatorKicker.text}</p>
                  <div className={styles.editorMemo}>
                    <span>{copy.editorMemo.label}</span>
                    <p>{copy.editorMemo.text}</p>
                  </div>
                </div>
              </div>
              <div className={styles.heroEditorialColumn}>
                {data.spotlightStory ? (
                  <a href={`/articles/${data.spotlightStory.slug}`} className={`${styles.heroSlot} ${styles.heroLead}`.trim()}>
                    <VisualCard {...data.spotlightStory} className={styles.leadCard} titleLevel="h2" accent="light" />
                  </a>
                ) : null}

                {data.featurePanels.length > 0 ? (
                  <div className={styles.heroFeatureRow}>
                    {data.featurePanels[0] ? (
                      <a href={data.featurePanels[0].href} className={`${styles.heroSlot} ${styles.heroFeatureLarge}`.trim()}>
                        <VisualCard {...data.featurePanels[0]} className={styles.featureLargeCard} />
                      </a>
                    ) : null}

                    {data.featurePanels[1] ? (
                      <a href={data.featurePanels[1].href} className={`${styles.heroSlot} ${styles.heroFeatureSmall}`.trim()}>
                        <VisualCard {...data.featurePanels[1]} className={styles.featureSmallCard} />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className={styles.heroRail}>
                {data.sideFeatures[0] ? (
                  <div className={`${styles.heroSlot} ${styles.heroLatest}`.trim()}>
                    <LatestModule
                      latestStory={data.sideFeatures[0]}
                      meta={copy.latestMeta}
                      latestPublishedAt={data.feedStories[0]?.publishedAt}
                    />
                  </div>
                ) : null}

                <div className={`${styles.heroSlot} ${styles.heroLogin}`.trim()}>
                  <LoginModule moduleCopy={copy.loginModule} actionCopy={copy.loginActions} />
                </div>

                {data.sideFeatures[1] ? (
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
                ) : null}
              </div>
            </section>

            <section className={styles.feedSection} aria-labelledby="latest-feed">
              <div className={styles.sectionHeading}>
                <div>
                  <p>{copy.feedHeading.eyebrow}</p>
                  <h2 id="latest-feed">{copy.feedHeading.title}</h2>
                </div>
                <span className={styles.sectionHint}>{copy.feedHeading.hint}</span>
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
                {copy.controls.loadMoreLabel}
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
          </>
        )}
      </main>

      <a className={styles.toTop} href="#top">
        {hasRenderableHomePage ? copy.controls.backToTopLabel : "回到顶部"}
      </a>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerBadge}>Q</span>
            <div>
              <strong>{hasRenderableHomePage ? copy.footerBrand.title : "好奇心日报"}</strong>
              <p>{hasRenderableHomePage ? copy.footerBrand.text : "用更接近 2019 年原站的黄黑骨架，重新排一份可读的数字杂志。"}</p>
            </div>
          </div>

          <div className={styles.footerMain}>
            <div className={styles.footerColumns}>
              {data.footerColumns.map((column, index) => (
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
                  {hasRenderableHomePage ? copy.footerSearch.label : "搜索文章"}
                </label>
                <input
                  id="footer-search"
                  name="search"
                  placeholder={hasRenderableHomePage ? copy.footerSearch.placeholder : "输入关键词"}
                  type="search"
                />
              </form>
              <p className={styles.footerCopy}>
                {hasRenderableHomePage ? copy.footerSearch.copyright : "2014 - 2026 QDaily Recreation Studio"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
