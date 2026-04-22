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

  it("uploads a local markdown file and publishes the imported article", async () => {
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
            article: {
              slug: "zhangxue-profile-editorial-reillustrated",
              title: "张雪",
              excerpt: "摘要",
              publishedAt: "2026-04-16 09:00",
              author: "Richard Cao",
              readingTime: "6 分钟",
              category: {
                slug: "business",
                name: "商业",
                href: "/categories/business",
              },
              tags: [
                {
                  slug: "hao-wenzhang",
                  name: "好文章",
                  href: "/tags/hao-wenzhang",
                },
              ],
              coverAlt: "张雪",
              heroImage: {
                src: "https://cdn.example.com/hero.jpg",
                alt: "张雪",
              },
              body: ["第一段。"],
              longformBlocks: [
                {
                  type: "paragraph",
                  content: "第一段。",
                },
              ],
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            slug: "zhangxue-profile-editorial-reillustrated",
          }),
          { status: 200 },
        ),
      );

    render(<AdminArticleEditorScreen />);

    const file = new File(
      [
        "---\nslug: zhangxue-profile-editorial-reillustrated\ntitle: 张雪\nexcerpt: 摘要\ncategory: business\ntags: hao-wenzhang\npublishedAt: 2026-04-16T09:00:00.000Z\npalette: linear-gradient(135deg, #111 0%, #333 100%)\nauthor: Richard Cao\nreadingTime: 6 分钟\ncoverAlt: 张雪\nheroImage: https://cdn.example.com/hero.jpg\n---\n\n第一段。",
      ],
      "zhangxue.md",
      { type: "text/markdown" },
    );

    expect(await screen.findByLabelText("上传本地 Markdown 文件")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("上传本地 Markdown 文件"), {
      target: {
        files: [file],
      },
    });

    expect(screen.getByRole("button", { name: "确认导入并发布" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "生成导入预览" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/admin/articles/import/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer editor-token",
        },
        body: JSON.stringify({
          markdown:
            "---\nslug: zhangxue-profile-editorial-reillustrated\ntitle: 张雪\nexcerpt: 摘要\ncategory: business\ntags: hao-wenzhang\npublishedAt: 2026-04-16T09:00:00.000Z\npalette: linear-gradient(135deg, #111 0%, #333 100%)\nauthor: Richard Cao\nreadingTime: 6 分钟\ncoverAlt: 张雪\nheroImage: https://cdn.example.com/hero.jpg\n---\n\n第一段。",
          authorSlug: "richard-cao",
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("预览文章")).toBeInTheDocument();
      expect(screen.getByText("张雪")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "确认导入并发布" })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "确认导入并发布" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/admin/articles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer editor-token",
        },
        body: JSON.stringify({
          markdown:
            "---\nslug: zhangxue-profile-editorial-reillustrated\ntitle: 张雪\nexcerpt: 摘要\ncategory: business\ntags: hao-wenzhang\npublishedAt: 2026-04-16T09:00:00.000Z\npalette: linear-gradient(135deg, #111 0%, #333 100%)\nauthor: Richard Cao\nreadingTime: 6 分钟\ncoverAlt: 张雪\nheroImage: https://cdn.example.com/hero.jpg\n---\n\n第一段。",
          authorSlug: "richard-cao",
          status: "published",
        }),
      });
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/admin/articles/zhangxue-profile-editorial-reillustrated");
      expect(refresh).toHaveBeenCalled();
    });
  });
});
