import Link from "next/link";

import { SiteHeader } from "@/components/site/site-header";

export default function AdminIndexPage() {
  return (
    <div>
      <SiteHeader currentLabel="后台" />
      <main style={{ width: "min(100%, 1120px)", margin: "0 auto", padding: "32px 24px 80px" }}>
        <section
          style={{
            border: "1px solid var(--line-soft)",
            borderRadius: "24px",
            background: "#fff",
            boxShadow: "var(--shadow-soft)",
            padding: "24px",
          }}
        >
          <p style={{ color: "var(--brand-yellow)", fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>Admin</p>
          <h1 style={{ marginTop: "14px", fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>后台工作台</h1>
          <p style={{ marginTop: "14px", color: "var(--ink-muted)", lineHeight: 1.75 }}>
            当前已提供评论审核、用户概览和文章互动统计，适合作为 Q-daily 正式上线第一版的轻量运营后台。
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "18px", flexWrap: "wrap" }}>
            <Link href="/admin/comments">进入评论审核台</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
