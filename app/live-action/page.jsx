import { animeApi } from "@/lib/api";
import GridPage from "@/components/GridPage";

export const revalidate = 600;

export default async function LiveAction() {
  // Placeholder API usage before type=live-action query is supported natively by backend
  const data = await animeApi.search("live action", { sort: "views" });
  return <GridPage title="Live Action" items={data?.data || []} />;
}
