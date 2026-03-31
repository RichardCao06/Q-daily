import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/site/article-page";
import { getAllArticleSlugsFromSource, getArticleBySlugFromSource, getRelatedArticlesFromSource } from "@/lib/content-source";
import { buildArticleMetadata } from "@/lib/metadata";

type ArticleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const article = await getArticleBySlugFromSource(slug);

  if (!article) {
    notFound();
  }

  const relatedStories = await getRelatedArticlesFromSource(slug, 4);

  return <ArticlePage article={article} relatedStories={relatedStories} />;
}

export async function generateStaticParams() {
  return (await getAllArticleSlugsFromSource()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlugFromSource(slug);

  if (!article) {
    return {};
  }

  return buildArticleMetadata(article);
}
