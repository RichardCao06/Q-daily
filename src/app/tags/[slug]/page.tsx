import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/site/collection-page";
import { getAllTagSlugs, getArticlesByTag, getTagBySlug } from "@/lib/qdaily-data";
import { buildCollectionMetadata } from "@/lib/metadata";

type TagRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TagRoute({ params }: TagRouteProps) {
  const { slug } = await params;
  const tag = getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  return <CollectionPage title={tag.name} description={`${tag.name}标签页`} stories={getArticlesByTag(slug)} />;
}

export function generateStaticParams() {
  return getAllTagSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: TagRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTagBySlug(slug);

  if (!tag) {
    return {};
  }

  return buildCollectionMetadata(tag, "tag");
}
