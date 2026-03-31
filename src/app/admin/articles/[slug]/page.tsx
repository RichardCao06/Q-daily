import { AdminArticleEditorScreen } from "../editor-screen";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AdminArticleDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  return <AdminArticleEditorScreen slug={slug} />;
}
