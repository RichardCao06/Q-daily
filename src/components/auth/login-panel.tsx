"use client";

import { useState, useTransition } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

import styles from "./login-panel.module.css";

export function LoginPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("当前环境尚未配置 Supabase，暂时无法发送验证码。");
      return;
    }

    const browserClient = supabase;
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const { error: signInError } = await browserClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setMessage("验证码已发送，请前往邮箱继续登录。");
    });
  }

  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Account</p>
      <h1 className={styles.title}>邮箱验证码登录</h1>
      <p className={styles.description}>我们会向你的邮箱发送一次性验证码或登录链接。</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>邮箱地址</span>
          <input
            autoComplete="email"
            name="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <button disabled={isPending} type="submit">
          {isPending ? "发送中..." : "发送验证码"}
        </button>
      </form>

      {message ? <p className={styles.message}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}
