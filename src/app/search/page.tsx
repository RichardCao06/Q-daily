import Link from "next/link";

import { articles } from "@/lib/qdaily-data";

export default function SearchRoute() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "72px 24px" }}>
      <h1 style={{ fontSize: "3rem", fontFamily: "var(--font-display)" }}>搜索</h1>
      <p style={{ marginTop: 12, color: "var(--ink-muted)", lineHeight: 1.8 }}>
        当前先提供静态索引入口，后续可以替换为真实全文搜索。
      </p>
      <ul style={{ marginTop: 24, display: "grid", gap: 12, listStyle: "none" }}>
        {articles.map((article) => (
          <li key={article.slug} style={{ padding: 18, background: "rgba(255,255,255,0.82)" }}>
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
