import EventFeed from "@/components/dashboard/EventFeed";
import SectionCard from "@/components/dashboard/SectionCard";
import { requireAdmin } from "@/lib/auth";
import { getDevices, getRecentEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const { supabase } = await requireAdmin();
  const [devices, events] = await Promise.all([
    getDevices(supabase),
    getRecentEvents(supabase, { limit: 200 })
  ]);

  return (
    <SectionCard
      title="Recent Activity Logs"
      description="Descending event history with device, event type, UID, message, and date filters."
    >
      <EventFeed initialEvents={events} devices={devices} />
    </SectionCard>
  );
}
