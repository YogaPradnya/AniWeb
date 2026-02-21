import { animeApi } from "@/lib/api";
import GridPage from "@/components/GridPage";

export const revalidate = 600;

export default async function Completed() {
  // Placeholder API usage before status=completed query is supported natively by backend
  const data = await animeApi.search("completed", { sort: "views" });
  return <GridPage title="Completed Anime" items={data?.data || []} />;
}
