import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/site/collection-page";
import {
  getAllColumnSlugsFromSource,
  getArticlesByColumnFromSource,
  getColumnBySlugFromSource,
} from "@/lib/content-source";
import { buildCollectionMetadata } from "@/lib/metadata";

type ColumnRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ColumnRoute({ params }: ColumnRouteProps) {
  const { slug } = await params;
  const column = await getColumnBySlugFromSource(slug);

  if (!column) {
    notFound();
  }

  const stories = await getArticlesByColumnFromSource(slug);
  const description = column.description ?? `浏览好有趣日报「${column.name}」栏目下的全部稿件。`;

  return <CollectionPage title={column.name} description={description} stories={stories} />;
}

export async function generateStaticParams() {
  return (await getAllColumnSlugsFromSource()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ColumnRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const column = await getColumnBySlugFromSource(slug);

  if (!column) {
    return {};
  }

  return buildCollectionMetadata(column, "column");
}
