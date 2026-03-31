import Link from "next/link";

import type { Article } from "@/lib/qdaily-data";

import { SiteHeader } from "./site-header";
import styles from "./search-page.module.css";

type SearchPageProps = {
  articles: Article[];
};

export function SearchPage({ articles }: SearchPageProps) {
  return (
    <div className={styles.page}>
      <SiteHeader currentLabel="搜索" />

      <main className={styles.main}>
        <section className={styles.intro}>
          <section className={styles.hero}>
            <span className={styles.eyebrow}>Search Index</span>
            <h1>搜索</h1>
            <p>当前先提供静态索引入口，统一保持和栏目页、辅助页一致的白底阅读结构，后续可以替换为真实全文搜索。</p>
          </section>

          <aside className={styles.note}>
            <span>检索提示</span>
            <p>先从标题浏览内容，再逐步接入真实搜索、筛选和专题索引能力。</p>
          </aside>
        </section>

        <section className={styles.list} aria-label="搜索结果">
          {articles.map((article) => (
            <article key={article.slug} className={styles.result}>
              <Link href={`/articles/${article.slug}`}>
                <div className={styles.resultMeta}>
                  <span>{article.category.name}</span>
                  <span>{article.publishedAt}</span>
                </div>
                <h2>{article.title}</h2>
                <p>{article.excerpt}</p>
              </Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
