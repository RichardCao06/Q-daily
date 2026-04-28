import Link from "next/link";

import { channelLinks, primaryLinks, siteColumns, utilityLinks } from "@/lib/qdaily-data";

import styles from "./site-header.module.css";

type SiteHeaderProps = {
  currentLabel?: string;
};

export function SiteHeader({ currentLabel }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <Link className={styles.logo} href="/" aria-label="好有趣日报 首页">
            <span className={styles.logoMark}>趣</span>
            <span className={styles.logoText}>
              <strong>好有趣日报</strong>
              <span>FunDaily</span>
            </span>
          </Link>
          <nav aria-label="主导航">
            <ul className={styles.mainNav}>
              {primaryLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} data-current={item.label === currentLabel}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <nav className={styles.headerCenter} aria-label="频道导航">
          <ul className={styles.categoryNav}>
            {siteColumns.map((item) => (
              <li key={`column-${item.slug}`} className={styles.columnNavItem}>
                <Link href={item.href} data-current={item.name === currentLabel}>
                  {item.name}
                </Link>
              </li>
            ))}
            <li aria-hidden="true" className={styles.navDivider} />
            {channelLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} data-current={item.label === currentLabel}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.headerRight}>
          {utilityLinks.map((item) => (
            <Link key={item.label} href={item.href} data-current={item.label === currentLabel}>
              {item.label}
            </Link>
          ))}
          <Link href="/account" data-current={currentLabel === "登录"}>
            登录
          </Link>
        </div>
      </div>
    </header>
  );
}
