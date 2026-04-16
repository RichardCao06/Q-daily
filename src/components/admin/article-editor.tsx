"use client";

import { useState } from "react";

import type { ArticleMutationInput, ArticleStatus } from "@/lib/article-management";

import styles from "./article-editor.module.css";

type Option = {
  slug: string;
  name: string;
};

type ArticleEditorProps = {
  mode: "create" | "edit";
  categories: Option[];
  authors: Option[];
  tags: Option[];
  initialValue?: ArticleMutationInput;
  onSave: (value: ArticleMutationInput) => void;
  onUploadInlineImage?: (file: File, alt: string, slug?: string) => Promise<{ url: string; alt: string }>;
  onUnpublish?: () => void;
};

const defaultGradient = "linear-gradient(135deg, #111 0%, #333 100%)";

export function ArticleEditor({ mode, categories, authors, tags, initialValue, onSave, onUploadInlineImage, onUnpublish }: ArticleEditorProps) {
  const [form, setForm] = useState<ArticleMutationInput>(
    initialValue ?? {
      title: "",
      slug: "",
      excerpt: "",
      authorSlug: authors[0]?.slug ?? "",
      categorySlug: categories[0]?.slug ?? "",
      readingTime: "6 分钟",
      coverAlt: "",
      heroImageUrl: "",
      heroImageCaption: "",
      palette: defaultGradient,
      tagSlugs: [],
      sourceMarkdown: "",
      status: "draft",
      publishedAt: "",
    },
  );
  const [inlineImageAlt, setInlineImageAlt] = useState("");
  const [inlineImageFile, setInlineImageFile] = useState<File | null>(null);
  const [inlineImageInputKey, setInlineImageInputKey] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingInlineImage, setIsUploadingInlineImage] = useState(false);

  function updateField<Key extends keyof ArticleMutationInput>(key: Key, value: ArticleMutationInput[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleTag(tagSlug: string) {
    setForm((current) => ({
      ...current,
      tagSlugs: current.tagSlugs.includes(tagSlug)
        ? current.tagSlugs.filter((value) => value !== tagSlug)
        : [...current.tagSlugs, tagSlug],
    }));
  }

  function submit(status: ArticleStatus) {
    onSave({
      ...form,
      status,
    });
  }

  async function handleInlineImageUpload() {
    if (!onUploadInlineImage || !inlineImageFile) {
      return;
    }

    try {
      setUploadError(null);
      setIsUploadingInlineImage(true);
      const result = form.slug.trim()
        ? await onUploadInlineImage(inlineImageFile, inlineImageAlt, form.slug.trim())
        : await onUploadInlineImage(inlineImageFile, inlineImageAlt);
      const altText = result.alt.trim() || inlineImageAlt.trim() || "配图";
      const imageMarkdown = `![${altText}](${result.url})`;

      updateField(
        "sourceMarkdown",
        form.sourceMarkdown.trim() ? `${form.sourceMarkdown.replace(/\s+$/, "")}\n\n${imageMarkdown}` : imageMarkdown,
      );
      setInlineImageAlt("");
      setInlineImageFile(null);
      setInlineImageInputKey((current) => current + 1);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "正文图片上传失败");
    } finally {
      setIsUploadingInlineImage(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h1>{mode === "create" ? "新建文章" : "编辑文章"}</h1>
        </div>
        <span className={styles.badge}>{form.status === "published" ? "已发布" : "草稿"}</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="title">标题</label>
          <input id="title" value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        </div>

        <div className={styles.field}>
          <label htmlFor="slug">Slug</label>
          <input id="slug" value={form.slug} onChange={(event) => updateField("slug", event.target.value)} readOnly={mode === "edit"} />
        </div>

        <div className={`${styles.field} ${styles.spanFull}`}>
          <label htmlFor="excerpt">摘要</label>
          <textarea id="excerpt" rows={3} value={form.excerpt} onChange={(event) => updateField("excerpt", event.target.value)} />
        </div>

        <div className={styles.field}>
          <label htmlFor="author">作者</label>
          <select id="author" value={form.authorSlug} onChange={(event) => updateField("authorSlug", event.target.value)}>
            {authors.map((author) => (
              <option key={author.slug} value={author.slug}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="category">分类</label>
          <select id="category" value={form.categorySlug} onChange={(event) => updateField("categorySlug", event.target.value)}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="readingTime">阅读时长</label>
          <input id="readingTime" value={form.readingTime} onChange={(event) => updateField("readingTime", event.target.value)} />
        </div>

        <div className={styles.field}>
          <label htmlFor="coverAlt">封面说明</label>
          <input id="coverAlt" value={form.coverAlt} onChange={(event) => updateField("coverAlt", event.target.value)} />
        </div>

        <div className={`${styles.field} ${styles.spanFull}`}>
          <label htmlFor="heroImageUrl">头图地址</label>
          <input id="heroImageUrl" value={form.heroImageUrl} onChange={(event) => updateField("heroImageUrl", event.target.value)} />
        </div>

        <div className={`${styles.field} ${styles.spanFull}`}>
          <label htmlFor="heroImageCaption">头图图注</label>
          <textarea id="heroImageCaption" rows={2} value={form.heroImageCaption} onChange={(event) => updateField("heroImageCaption", event.target.value)} />
        </div>

        <div className={styles.field}>
          <label htmlFor="palette">色板</label>
          <input id="palette" value={form.palette} onChange={(event) => updateField("palette", event.target.value)} />
        </div>

        <div className={styles.field}>
          <label htmlFor="publishedAt">发布时间</label>
          <input id="publishedAt" value={form.publishedAt} onChange={(event) => updateField("publishedAt", event.target.value)} />
        </div>

        <fieldset className={styles.fieldset}>
          <legend>标签</legend>
          <div className={styles.tags}>
            {tags.map((tag) => (
              <label key={tag.slug} className={styles.checkbox}>
                <input type="checkbox" checked={form.tagSlugs.includes(tag.slug)} onChange={() => toggleTag(tag.slug)} aria-label={tag.name} />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={`${styles.field} ${styles.spanFull}`}>
          <label htmlFor="body">Markdown 正文</label>
          <textarea id="body" rows={14} value={form.sourceMarkdown} onChange={(event) => updateField("sourceMarkdown", event.target.value)} />
        </div>

        <div className={`${styles.field} ${styles.spanFull}`}>
          <label htmlFor="inlineImageAlt">正文图片 Alt</label>
          <input id="inlineImageAlt" value={inlineImageAlt} onChange={(event) => setInlineImageAlt(event.target.value)} />
        </div>

        <div className={styles.field}>
          <label htmlFor="inlineImageFile">上传正文图片</label>
          <input
            key={inlineImageInputKey}
            id="inlineImageFile"
            type="file"
            accept="image/*"
            onChange={(event) => setInlineImageFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="inlineImageButton">插入正文图片</label>
          <button id="inlineImageButton" type="button" className={styles.secondary} onClick={() => void handleInlineImageUpload()} disabled={!onUploadInlineImage || !inlineImageFile || isUploadingInlineImage}>
            {isUploadingInlineImage ? "上传中…" : "插入正文图片"}
          </button>
        </div>
      </div>

      {uploadError ? <p className={styles.error}>{uploadError}</p> : null}

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={() => submit("draft")}>
          保存草稿
        </button>
        <button type="button" className={styles.secondary} onClick={() => submit("published")}>
          发布文章
        </button>
        {mode === "edit" && form.status === "published" && onUnpublish ? (
          <button type="button" className={styles.danger} onClick={onUnpublish}>
            下线为草稿
          </button>
        ) : null}
      </div>
    </section>
  );
}
