import { SearchPage } from "@/components/site/search-page";
import { getArticlesForSearchFromSource } from "@/lib/content-source";

export default async function SearchRoute() {
  const articles = await getArticlesForSearchFromSource();

  return <SearchPage articles={articles} />;
}
