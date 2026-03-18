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
  const highestRiskLabel =
    security.activeAlarmDevices.length > 0
      ? "Critical"
      : security.metrics.totalAccessDenied + security.metrics.totalFailedOtpAttempts > 0
        ? "Elevated"
        : "Stable";
  const highestRiskTone =
    security.activeAlarmDevices.length > 0
      ? "border-danger/30 bg-danger/10 text-danger"
      : security.metrics.totalAccessDenied + security.metrics.totalFailedOtpAttempts > 0
        ? "border-warning/30 bg-warning/10 text-warning"
        : "border-success/30 bg-success/10 text-success";

  return (
    <div className="space-y-6">
      <RealtimeRefresh tables={["device_status"]} />
      <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-6 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Security Center</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white">Door risk and incident monitoring</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Track denied RFID scans, OTP failures, active alarms, and the latest suspicious activity without losing the table off-screen.
            </p>
          </div>
          <div className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${highestRiskTone}`}>
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            Risk {highestRiskLabel}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Denied Access" value={security.metrics.totalAccessDenied} hint="Invalid RFID or blocked entry attempts." />
        <StatCard label="Failed OTP" value={security.metrics.totalFailedOtpAttempts} hint="PIN or OTP verification failures." />
        <StatCard label="Alarms" value={security.metrics.totalAlarms} hint="Alarm events reported by the door." />
        <StatCard label="Active Alarm Devices" value={security.activeAlarmDevices.length} hint="Devices currently stuck in alarm state." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <SectionCard
          title="Active Alarm Review"
          description="Devices whose current status is in alarm and need operator attention."
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
          title="Security Posture"
          description="Quick summary of the current environment before drilling into the feed."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Coverage</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white">{devices.length}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Connected or configured doors under active admin review.</p>
            </article>
            <article className="rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Latest incident</p>
              <p className="mt-3 font-display text-2xl font-semibold text-white">
                {security.events[0] ? formatRelativeTime(security.events[0].created_at) : "No incidents"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {security.events[0]?.message || "Security activity will appear here once the feed receives events."}
              </p>
            </article>
            <article className="rounded-[24px] border border-danger/20 bg-danger/10 p-5 sm:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-danger/80">Priority Response</p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {security.activeAlarmDevices.length > 0 ? "Investigate alarm devices immediately." : "No critical door alarms detected."}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {security.activeAlarmDevices.length > 0
                      ? "Review the affected device state, event stream, and nearby failed attempts before clearing the alarm."
                      : "Use the event feed below to review denied cards, repeated OTP failures, and suspicious door behavior."}
                  </p>
                </div>
                <div className="rounded-2xl border border-danger/20 bg-black/20 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-danger/80">Open alarms</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-white">{security.activeAlarmDevices.length}</p>
                </div>
              </div>
            </article>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Security Event Feed"
        description="Invalid RFID scans, denied access, wrong OTP attempts, and alarm events in a full-width table."
      >
        <EventFeed initialEvents={security.events} devices={devices} mode="security" />
      </SectionCard>
    </div>
  );
}
