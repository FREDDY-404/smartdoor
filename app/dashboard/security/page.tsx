import EventFeed from "@/components/dashboard/EventFeed";
import SectionCard from "@/components/dashboard/SectionCard";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { DoorStatePill } from "@/components/dashboard/StatePill";
import RealtimeRefresh from "@/components/dashboard/RealtimeRefresh";
import { requireAdmin } from "@/lib/auth";
import { getDevices, getSecuritySnapshot } from "@/lib/data";
import { formatRelativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const { supabase } = await requireAdmin();
  const [devices, security] = await Promise.all([
    getDevices(supabase),
    getSecuritySnapshot(supabase)
  ]);
  const deviceMap = new Map(devices.map((device) => [device.id, device]));

  return (
    <div className="space-y-6">
      <RealtimeRefresh tables={["device_status"]} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Denied Access" value={security.metrics.totalAccessDenied} />
        <StatCard label="Failed OTP" value={security.metrics.totalFailedOtpAttempts} />
        <StatCard label="Alarms" value={security.metrics.totalAlarms} />
        <StatCard label="Active Alarm Devices" value={security.activeAlarmDevices.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          title="Active Alarm Review"
          description="Devices whose current status is `alarm`."
        >
          {security.activeAlarmDevices.length === 0 ? (
            <EmptyState
              title="No active alarms"
              description="Alarm states will appear here whenever the smart door reports an `ALARM` event."
            />
          ) : (
            <div className="space-y-4">
              {security.activeAlarmDevices.map((status) => {
                const device = deviceMap.get(status.device_id);

                return (
                  <article
                    key={status.device_id}
                    className="rounded-2xl border border-danger/30 bg-danger/10 p-5"
                  >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{status.last_message || "Alarm active"}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {device?.name || status.device_id}
                        {device?.location ? ` · ${device.location}` : ""}
                      </p>
                    </div>
                    <DoorStatePill state={status.door_state} />
                  </div>
                  <p className="mt-4 text-sm text-slate-300">
                    Last seen {formatRelativeTime(status.last_seen_at)}
                  </p>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Security Event Feed"
          description="Invalid RFID scans, wrong OTP attempts, denied access, and alarm events."
        >
          <EventFeed initialEvents={security.events} devices={devices} mode="security" />
        </SectionCard>
      </div>
    </div>
  );
}
