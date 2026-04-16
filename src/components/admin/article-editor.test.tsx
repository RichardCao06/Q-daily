import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ArticleEditor } from "./article-editor";

describe("ArticleEditor", () => {
  it("serializes the editor form and saves a draft", () => {
    const onSave = vi.fn();

    render(
      <ArticleEditor
        mode="create"
        categories={[
          { slug: "business", name: "商业" },
          { slug: "culture", name: "文化" },
        ]}
        authors={[{ slug: "richard-cao", name: "Richard Cao" }]}
        tags={[
          { slug: "newsroom", name: "新闻编辑部" },
          { slug: "product-thinking", name: "产品思考" },
        ]}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText("标题"), { target: { value: "新建文章" } });
    fireEvent.change(screen.getByLabelText("Slug"), { target: { value: "new-story" } });
    fireEvent.change(screen.getByLabelText("摘要"), { target: { value: "一段新的摘要。" } });
    fireEvent.change(screen.getByLabelText("头图地址"), { target: { value: "https://cdn.example.com/articles/new-story/hero.jpg" } });
    fireEvent.change(screen.getByLabelText("头图图注"), { target: { value: "图注：头图说明。" } });
    fireEvent.change(screen.getByLabelText("Markdown 正文"), { target: { value: "第一段。\n\n第二段。" } });
    fireEvent.click(screen.getByLabelText("新闻编辑部"));
    fireEvent.click(screen.getByRole("button", { name: "保存草稿" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "新建文章",
        slug: "new-story",
        tagSlugs: ["newsroom"],
        status: "draft",
        heroImageUrl: "https://cdn.example.com/articles/new-story/hero.jpg",
        heroImageCaption: "图注：头图说明。",
        sourceMarkdown: "第一段。\n\n第二段。",
      }),
    );
  });

  it("shows publish controls for an existing published article", () => {
    const onUnpublish = vi.fn();

    render(
      <ArticleEditor
        mode="edit"
        categories={[{ slug: "business", name: "商业" }]}
        authors={[{ slug: "richard-cao", name: "Richard Cao" }]}
        tags={[{ slug: "newsroom", name: "新闻编辑部" }]}
        initialValue={{
          title: "已发布文章",
          slug: "published-story",
          excerpt: "摘要",
          authorSlug: "richard-cao",
          categorySlug: "business",
          readingTime: "6 分钟",
          coverAlt: "封面",
          heroImageUrl: "https://cdn.example.com/articles/published-story/hero.jpg",
          heroImageCaption: "图注：已发布文章头图。",
          palette: "linear-gradient(135deg, #111 0%, #333 100%)",
          tagSlugs: ["newsroom"],
          sourceMarkdown: "第一段。",
          status: "published",
          publishedAt: "2026-03-31T09:00:00.000Z",
        }}
        onSave={vi.fn()}
        onUnpublish={onUnpublish}
      />,
    );

    expect(screen.getByDisplayValue("第一段。")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "下线为草稿" }));
    expect(onUnpublish).toHaveBeenCalled();
  });

  it("uploads an inline image and appends markdown syntax to the editor", async () => {
    const onUploadInlineImage = vi.fn().mockResolvedValue({
      url: "https://cdn.example.com/articles/new-story/inline/scene.jpg",
      alt: "现场图",
    });

    render(
      <ArticleEditor
        mode="create"
        categories={[{ slug: "business", name: "商业" }]}
        authors={[{ slug: "richard-cao", name: "Richard Cao" }]}
        tags={[]}
        onSave={vi.fn()}
        onUploadInlineImage={onUploadInlineImage}
      />,
    );

    const file = new File(["image-bytes"], "scene.jpg", { type: "image/jpeg" });

    fireEvent.change(screen.getByLabelText("Markdown 正文"), { target: { value: "第一段。" } });
    fireEvent.change(screen.getByLabelText("正文图片 Alt"), { target: { value: "现场图" } });
    fireEvent.change(screen.getByLabelText("上传正文图片"), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "插入正文图片" }));

    await waitFor(() => {
      expect(onUploadInlineImage).toHaveBeenCalledWith(file, "现场图");
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Markdown 正文")).toHaveValue(
        "第一段。\n\n![现场图](https://cdn.example.com/articles/new-story/inline/scene.jpg)",
      );
    });
  });
});
