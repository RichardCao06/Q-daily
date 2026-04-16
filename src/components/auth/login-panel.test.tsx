import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh, signInWithPassword, signUp, getSession, browserClient } = vi.hoisted(() => {
  const signInWithPassword = vi.fn();
  const signUp = vi.fn();
  const getSession = vi.fn();

  return {
    push: vi.fn(),
    refresh: vi.fn(),
    signInWithPassword,
    signUp,
    getSession,
    browserClient: {
      auth: {
        signInWithPassword,
        signUp,
        getSession,
      },
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  getSupabaseBrowserClient: () => browserClient,
}));

import { LoginPanel } from "./login-panel";

describe("LoginPanel", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    signInWithPassword.mockReset();
    signUp.mockReset();
    getSession.mockReset();
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: "account-token",
        },
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  });

  it("renders an email and password login form by default", () => {
    render(<LoginPanel />);

    expect(screen.getByRole("heading", { level: 1, name: "邮箱密码登录" })).toBeInTheDocument();
    expect(screen.getByLabelText("邮箱地址")).toBeInTheDocument();
    expect(screen.getByLabelText("密码")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
    expect(screen.getByText("使用邮箱和密码登录 Q-daily 账户，登录后即可进入个人中心和后台。")).toBeInTheDocument();
  });

  it("updates the email field as the reader types", () => {
    render(<LoginPanel />);

    const input = screen.getByLabelText("邮箱地址") as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        value: "reader@example.com",
      },
    });

    expect(input.value).toBe("reader@example.com");
  });

  it("submits email and password login, then redirects to the account page", async () => {
    signInWithPassword.mockResolvedValue({ error: null });

    render(<LoginPanel />);

    fireEvent.change(screen.getByLabelText("邮箱地址"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "password-1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "password-1234",
      });
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/account/profile", {
        method: "POST",
        headers: {
          Authorization: "Bearer account-token",
        },
      });
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/account");
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("switches to registration mode and submits a password signup", async () => {
    signUp.mockResolvedValue({
      data: {
        session: {
          access_token: "account-token",
        },
      },
      error: null,
    });

    render(<LoginPanel />);

    fireEvent.click(screen.getByRole("tab", { name: "注册" }));

    expect(screen.getByRole("heading", { level: 1, name: "注册 Q-daily 账户" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "创建账户" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("邮箱地址"), {
      target: { value: "new-reader@example.com" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "password-1234" },
    });
    fireEvent.change(screen.getByLabelText("确认密码"), {
      target: { value: "password-1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "创建账户" }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        email: "new-reader@example.com",
        password: "password-1234",
      });
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/account/profile", {
        method: "POST",
        headers: {
          Authorization: "Bearer account-token",
        },
      });
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/account");
      expect(refresh).toHaveBeenCalled();
    });
  });
});
