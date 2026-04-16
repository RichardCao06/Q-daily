import { beforeEach, describe, expect, it, vi } from "vitest";

const getBearerTokenFromHeaders = vi.fn();
const importMarkdownAdminArticle = vi.fn();
const syncRepositoryMarkdownArticlesToSupabase = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getBearerTokenFromHeaders,
}));

vi.mock("@/lib/article-management-service", () => ({
  importMarkdownAdminArticle,
  syncRepositoryMarkdownArticlesToSupabase,
}));

describe("admin article import route", () => {
  beforeEach(() => {
    getBearerTokenFromHeaders.mockReset();
    importMarkdownAdminArticle.mockReset();
    syncRepositoryMarkdownArticlesToSupabase.mockReset();
  });

  it("imports a single markdown payload when raw markdown is provided", async () => {
    getBearerTokenFromHeaders.mockReturnValue("editor-token");
    importMarkdownAdminArticle.mockResolvedValue({ slug: "heqiong-profile-editorial" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/articles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer editor-token",
        },
        body: JSON.stringify({
          markdown: "---\nslug: heqiong-profile-editorial\n---",
          authorSlug: "richard-cao",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(importMarkdownAdminArticle).toHaveBeenCalledWith(
      {
        markdown: "---\nslug: heqiong-profile-editorial\n---",
        authorSlug: "richard-cao",
      },
      "editor-token",
    );
    expect(syncRepositoryMarkdownArticlesToSupabase).not.toHaveBeenCalled();
    expect(payload).toEqual({ slug: "heqiong-profile-editorial" });
  });

  it("syncs repository markdown articles when no raw markdown payload is provided", async () => {
    getBearerTokenFromHeaders.mockReturnValue("editor-token");
    syncRepositoryMarkdownArticlesToSupabase.mockResolvedValue({
      imported: [
        "avo-paper-feature-editorial",
        "heqiong-profile-editorial",
        "zhangxue-profile-editorial-reillustrated",
      ],
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/articles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer editor-token",
        },
        body: JSON.stringify({
          authorSlug: "richard-cao",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(syncRepositoryMarkdownArticlesToSupabase).toHaveBeenCalledWith(
      {
        authorSlug: "richard-cao",
      },
      "editor-token",
    );
    expect(importMarkdownAdminArticle).not.toHaveBeenCalled();
    expect(payload).toEqual({
      imported: [
        "avo-paper-feature-editorial",
        "heqiong-profile-editorial",
        "zhangxue-profile-editorial-reillustrated",
      ],
    });
  });
});
