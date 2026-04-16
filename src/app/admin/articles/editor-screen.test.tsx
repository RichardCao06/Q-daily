import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh, getSession, browserClient } = vi.hoisted(() => {
  const getSession = vi.fn();

  return {
    push: vi.fn(),
    refresh: vi.fn(),
    getSession,
    browserClient: {
      auth: {
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

vi.mock("@/components/site/site-header", () => ({
  SiteHeader: ({ currentLabel }: { currentLabel: string }) => <div>{currentLabel}</div>,
}));

vi.mock("@/components/admin/article-editor", () => ({
  ArticleEditor: () => <div>editor</div>,
}));

import { AdminArticleEditorScreen } from "./editor-screen";

describe("AdminArticleEditorScreen", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    getSession.mockReset();
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: "editor-token",
        },
      },
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows a repository import action on the new article screen and redirects after import", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            configured: true,
            isAdmin: true,
            authors: [{ slug: "richard-cao", name: "Richard Cao" }],
            categories: [{ slug: "business", name: "商业" }],
            tags: [],
            article: null,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            imported: ["avo-paper-feature-editorial", "heqiong-profile-editorial", "zhangxue-profile-editorial-reillustrated"],
          }),
          { status: 200 },
        ),
      );

    render(<AdminArticleEditorScreen />);

    expect(await screen.findByRole("button", { name: "从仓库导入现有 Markdown" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "从仓库导入现有 Markdown" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/admin/articles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer editor-token",
        },
        body: JSON.stringify({
          authorSlug: "richard-cao",
        }),
      });
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/admin/articles");
      expect(refresh).toHaveBeenCalled();
    });
  });
});
