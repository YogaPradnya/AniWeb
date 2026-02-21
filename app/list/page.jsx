import { animeApi } from "@/lib/api";
import GridPage from "@/components/GridPage";

export const revalidate = 600;

export default async function YourList() {
  const list = await animeApi.getList(1);
  return <GridPage title="Your List (A-Z)" items={list?.data || []} />;
}
