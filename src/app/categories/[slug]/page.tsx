import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/site/collection-page";
import { getAllCategorySlugs, getArticlesByCategory, getCategoryBySlug } from "@/lib/qdaily-data";
import { buildCollectionMetadata } from "@/lib/metadata";

type CategoryRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryRoute({ params }: CategoryRouteProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return <CollectionPage title={category.name} description={`${category.name}栏目页`} stories={getArticlesByCategory(slug)} />;
}

export function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  return buildCollectionMetadata(category, "category");
}
