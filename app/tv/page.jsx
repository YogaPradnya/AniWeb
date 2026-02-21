import { animeApi } from "@/lib/api";
import GridPage from "@/components/GridPage";

export const revalidate = 600;

export default async function TVSeries() {
  // Placeholder API usage before type=tv query is supported natively by backend
  const data = await animeApi.search("tv", { sort: "views" });
  return <GridPage title="TV Series" items={data?.data || []} />;
}
