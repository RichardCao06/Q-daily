import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/site/collection-page";
import {
  getAllCategorySlugsFromSource,
  getArticlesByCategoryFromSource,
  getCategoryBySlugFromSource,
} from "@/lib/content-source";
import { buildCollectionMetadata } from "@/lib/metadata";

type CategoryRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryRoute({ params }: CategoryRouteProps) {
  const { slug } = await params;
  const category = await getCategoryBySlugFromSource(slug);

  if (!category) {
    notFound();
  }

  const stories = await getArticlesByCategoryFromSource(slug);

  return <CollectionPage title={category.name} description={`${category.name}栏目页`} stories={stories} />;
}

export async function generateStaticParams() {
  return (await getAllCategorySlugsFromSource()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlugFromSource(slug);

  if (!category) {
    return {};
  }

  return buildCollectionMetadata(category, "category");
}
