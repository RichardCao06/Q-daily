"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

import styles from "./login-panel.module.css";

export function LoginPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function ensureProfileAndRedirect(accessToken?: string | null) {
    if (!accessToken) {
      setMessage("账户已创建，请先完成邮箱确认，再使用邮箱和密码登录。");
      return;
    }

    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "登录成功，但初始化账户资料失败。");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("当前环境尚未配置 Supabase，暂时无法使用账户系统。");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("两次输入的密码不一致。");
      return;
    }

    const browserClient = supabase;
    setError(null);
    setMessage(null);

    startTransition(async () => {
      if (mode === "login") {
        const result = await browserClient.auth.signInWithPassword({
          email,
          password,
        });

        if (result.error) {
          setError(result.error.message);
          return;
        }

        const sessionResult = await browserClient.auth.getSession();
        await ensureProfileAndRedirect(result.data?.session?.access_token ?? sessionResult.data.session?.access_token ?? null);
        return;
      }

      const result = await browserClient.auth.signUp({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      const sessionResult = await browserClient.auth.getSession();
      await ensureProfileAndRedirect(result.data?.session?.access_token ?? sessionResult.data.session?.access_token ?? null);
    });
  }

  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Account</p>
      <div className={styles.modeSwitch} role="tablist" aria-label="账户模式">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          className={mode === "login" ? styles.modeButtonActive : styles.modeButton}
          onClick={() => setMode("login")}
        >
          登录
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={mode === "signup" ? styles.modeButtonActive : styles.modeButton}
          onClick={() => setMode("signup")}
        >
          注册
        </button>
      </div>
      <h1 className={styles.title}>{mode === "login" ? "邮箱密码登录" : "注册 Q-daily 账户"}</h1>
      <p className={styles.description}>
        {mode === "login"
          ? "使用邮箱和密码登录 Q-daily 账户，登录后即可进入个人中心和后台。"
          : "用邮箱和密码创建账户。若 Supabase 开启邮箱确认，注册后请先完成确认再登录。"}
      </p>

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

        <label className={styles.field}>
          <span>密码</span>
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            name="password"
            minLength={8}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {mode === "signup" ? (
          <label className={styles.field}>
            <span>确认密码</span>
            <input
              autoComplete="new-password"
              name="confirmPassword"
              minLength={8}
              required
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        ) : null}

        <button disabled={isPending} type="submit">
          {isPending ? (mode === "login" ? "登录中..." : "创建中...") : mode === "login" ? "登录" : "创建账户"}
        </button>
      </form>

      {message ? <p className={styles.message}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}
