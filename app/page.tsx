import { fetchDailyRows } from "@/lib/data";
import DashboardClient from "@/components/DashboardClient";

export const revalidate = 21600; // 6h — source updates once a day

export default async function Home() {
  const { rows, asOf } = await fetchDailyRows();
  return <DashboardClient rows={rows} asOf={asOf} />;
}
