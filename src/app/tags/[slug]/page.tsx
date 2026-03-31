import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/site/collection-page";
import { getAllTagSlugsFromSource, getArticlesByTagFromSource, getTagBySlugFromSource } from "@/lib/content-source";
import { buildCollectionMetadata } from "@/lib/metadata";

type TagRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TagRoute({ params }: TagRouteProps) {
  const { slug } = await params;
  const tag = await getTagBySlugFromSource(slug);

  if (!tag) {
    notFound();
  }

  const stories = await getArticlesByTagFromSource(slug);

  return <CollectionPage title={tag.name} description={`${tag.name}标签页`} stories={stories} />;
}

export async function generateStaticParams() {
  return (await getAllTagSlugsFromSource()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: TagRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlugFromSource(slug);

  if (!tag) {
    return {};
  }

  return buildCollectionMetadata(tag, "tag");
}
