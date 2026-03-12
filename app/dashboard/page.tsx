import OverviewClient from "@/components/dashboard/OverviewClient";
import { requireAdmin } from "@/lib/auth";
import { getOverviewSnapshot } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage({
  searchParams
}: {
  searchParams?: { device?: string };
}) {
  const { supabase } = await requireAdmin();
  const snapshot = await getOverviewSnapshot(supabase, searchParams?.device ?? null);

  return <OverviewClient snapshot={snapshot} />;
}
