import { animeApi } from "@/lib/api";
import GridPage from "@/components/GridPage";

export const revalidate = 600;

export default async function Ongoing() {
  const ongoing = await animeApi.getLatest();
  // using getLatest() as a reliable way to get Ongoing anime. 
  // It returns data.data as an array of the latest released episodes.
  return <GridPage title="Ongoing Anime" items={ongoing || []} />;
}
