import { animeApi } from "@/lib/api";
import GridPage from "@/components/GridPage";

export const revalidate = 600;

export default async function Trending() {
  const trending = await animeApi.getTrending();
  return <GridPage title="Trending Anime" items={trending || []} />;
}
