import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/site/article-page";
import { getAllArticleSlugs, getArticleBySlug } from "@/lib/qdaily-data";
import { buildArticleMetadata } from "@/lib/metadata";

type ArticleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <ArticlePage article={article} />;
}

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return buildArticleMetadata(article);
}
