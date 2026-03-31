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
  onUnpublish?: () => void;
};

const defaultGradient = "linear-gradient(135deg, #111 0%, #333 100%)";

export function ArticleEditor({ mode, categories, authors, tags, initialValue, onSave, onUnpublish }: ArticleEditorProps) {
  const [form, setForm] = useState<ArticleMutationInput>(
    initialValue ?? {
      title: "",
      slug: "",
      excerpt: "",
      authorSlug: authors[0]?.slug ?? "",
      categorySlug: categories[0]?.slug ?? "",
      readingTime: "6 分钟",
      coverAlt: "",
      palette: defaultGradient,
      tagSlugs: [],
      bodyInput: "",
      status: "draft",
      publishedAt: "",
    },
  );

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
          <label htmlFor="body">正文</label>
          <textarea id="body" rows={12} value={form.bodyInput} onChange={(event) => updateField("bodyInput", event.target.value)} />
        </div>
      </div>

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
