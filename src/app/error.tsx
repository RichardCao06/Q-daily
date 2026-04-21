"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry: retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 24px",
        background: "#f8f8f5",
      }}
    >
      <section
        style={{
          width: "min(100%, 720px)",
          display: "grid",
          gap: "16px",
          padding: "32px",
          border: "1px solid var(--line-soft)",
          borderRadius: "28px",
          background: "#fff",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <span
          style={{
            color: "var(--brand-yellow)",
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Supabase Content Error
        </span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 0.98 }}>
          内容服务暂时不可用
        </h1>
        <p style={{ color: "var(--ink-muted)", lineHeight: 1.72 }}>
          当前页面依赖 Supabase 实时内容。请检查数据库连接、RLS 配置和前台读取权限后再重试。
        </p>
        <p style={{ color: "var(--ink-muted)", lineHeight: 1.72 }}>{error.message}</p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            width: "fit-content",
            minHeight: "42px",
            padding: "0 16px",
            border: "1px solid var(--line-soft)",
            borderRadius: "999px",
            background: "#fff",
            color: "var(--ink-strong)",
          }}
        >
          重试
        </button>
      </section>
    </main>
  );
}
