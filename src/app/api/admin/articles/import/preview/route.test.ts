import { beforeEach, describe, expect, it, vi } from "vitest";

const getBearerTokenFromHeaders = vi.fn();
const previewMarkdownAdminArticle = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getBearerTokenFromHeaders,
}));

vi.mock("@/lib/article-management-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/article-management-service")>("@/lib/article-management-service");

  return {
    ...actual,
    previewMarkdownAdminArticle,
  };
});

describe("admin article import preview route", () => {
  beforeEach(() => {
    getBearerTokenFromHeaders.mockReset();
    previewMarkdownAdminArticle.mockReset();
  });

  it("builds a preview from raw markdown before publish", async () => {
    getBearerTokenFromHeaders.mockReturnValue("editor-token");
    previewMarkdownAdminArticle.mockResolvedValue({
      article: {
        slug: "zhangxue-profile-editorial-reillustrated",
        title: "张雪",
      },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/articles/import/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer editor-token",
        },
        body: JSON.stringify({
          markdown: "---\nslug: zhangxue-profile-editorial-reillustrated\n---",
          authorSlug: "richard-cao",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(previewMarkdownAdminArticle).toHaveBeenCalledWith(
      {
        markdown: "---\nslug: zhangxue-profile-editorial-reillustrated\n---",
        authorSlug: "richard-cao",
      },
      "editor-token",
    );
    expect(payload).toEqual({
      article: {
        slug: "zhangxue-profile-editorial-reillustrated",
        title: "张雪",
      },
    });
  });
});
