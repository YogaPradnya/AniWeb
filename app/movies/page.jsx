import { animeApi } from "@/lib/api";
import GridPage from "@/components/GridPage";

export const revalidate = 600;

export default async function Movies() {
  // Placeholder API usage before type=movie query is supported natively by backend
  const data = await animeApi.search("movie", { sort: "views" });
  return <GridPage title="Anime Movies" items={data?.data || []} />;
}
