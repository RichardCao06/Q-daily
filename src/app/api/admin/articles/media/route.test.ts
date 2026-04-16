import { describe, expect, it, vi, beforeEach } from "vitest";

const getBearerTokenFromHeaders = vi.fn();
const uploadAdminArticleMedia = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getBearerTokenFromHeaders,
}));

vi.mock("@/lib/article-management-service", () => ({
  uploadAdminArticleMedia,
}));

describe("admin article media route", () => {
  beforeEach(() => {
    getBearerTokenFromHeaders.mockReset();
    uploadAdminArticleMedia.mockReset();
  });

  it("passes multipart upload data to the media service and returns the public url payload", async () => {
    getBearerTokenFromHeaders.mockReturnValue("editor-token");
    uploadAdminArticleMedia.mockResolvedValue({
      url: "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/new-story/inline/scene.jpg",
      path: "articles/new-story/inline/scene.jpg",
      alt: "现场图",
    });

    const { POST } = await import("./route");
    const formData = new FormData();
    formData.set("slug", "new-story");
    formData.set("kind", "inline");
    formData.set("alt", "现场图");
    formData.set("file", new File(["image-bytes"], "scene.jpg", { type: "image/jpeg" }));

    const response = await POST(new Request("http://localhost/api/admin/articles/media", { method: "POST", body: formData }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(uploadAdminArticleMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "new-story",
        kind: "inline",
        alt: "现场图",
      }),
      "editor-token",
    );
    expect(payload).toEqual({
      url: "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/new-story/inline/scene.jpg",
      path: "articles/new-story/inline/scene.jpg",
      alt: "现场图",
    });
  });

  it("returns a 400 response when the upload service rejects the request", async () => {
    getBearerTokenFromHeaders.mockReturnValue("editor-token");
    uploadAdminArticleMedia.mockRejectedValue(new Error("Forbidden"));

    const { POST } = await import("./route");
    const formData = new FormData();
    formData.set("slug", "new-story");
    formData.set("kind", "inline");
    formData.set("file", new File(["image-bytes"], "scene.jpg", { type: "image/jpeg" }));

    const response = await POST(new Request("http://localhost/api/admin/articles/media", { method: "POST", body: formData }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Forbidden" });
  });
});
