import SectionCard from "@/components/dashboard/SectionCard";
import StatCard from "@/components/dashboard/StatCard";
import { updateProfileAction } from "@/app/dashboard/actions";
import { requireAdmin } from "@/lib/auth";
import { getCards, getDevices, getMetrics, getProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

function ConfigRow({
  label,
  value,
  mono = false
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className={`max-w-full rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-white ${
          mono ? "overflow-x-auto font-mono text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InfoTile({
  title,
  value,
  description
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
      <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">{title}</p>
      <p className="mt-3 font-display text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}

export default async function SettingsPage() {
  const { supabase, user } = await requireAdmin();
  const [profile, devices, cards, metrics] = await Promise.all([
    getProfile(supabase, user.id),
    getDevices(supabase),
    getCards(supabase),
    getMetrics(supabase)
  ]);

  const scopedCards = cards.filter((card) => card.device_id);
  const globalCards = cards.length - scopedCards.length;
  const activeDevices = devices.filter((device) => device.is_active).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-6 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">System Settings</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white">Clear, practical smart door setup</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Keep only the settings that matter for daily operation: administrator identity, device connectivity,
              card scope, and the API contract your ESP32 uses.
            </p>
          </div>
          <div className="rounded-[22px] border border-success/20 bg-success/10 px-4 py-3 text-right">
            <p className="text-[11px] uppercase tracking-[0.24em] text-success/80">Current mode</p>
            <p className="mt-2 text-lg font-semibold text-white">Smart Door Live Config</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Configured Devices" value={devices.length} hint={`${activeDevices} currently active.`} />
        <StatCard label="Authorized Cards" value={cards.length} hint={`${globalCards} global, ${scopedCards.length} scoped.`} />
        <StatCard label="Denied Access" value={metrics.totalAccessDenied} hint="Recent blocked entry attempts." />
        <StatCard label="Alarm Events" value={metrics.totalAlarms} hint="Door alarm events recorded so far." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <SectionCard
          title="Administrator"
          description="The only editable account setting on this dashboard. Keep it simple and easy to maintain."
        >
          <form action={updateProfileAction} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Full name</label>
              <input
                name="full_name"
                defaultValue={profile.full_name ?? ""}
                placeholder="Admin name"
                className="w-full rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-accent/60"
              />
            </div>

            <div className="grid gap-3">
              <ConfigRow label="Email" value={user.email ?? "No email"} />
              <ConfigRow label="Role" value={profile.role} />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-soft"
            >
              Save profile
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Smart Door Network"
          description="Quick operational summary of device coverage and card behavior."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoTile
              title="Active doors"
              value={`${activeDevices}/${devices.length}`}
              description="Devices marked active in the dashboard and ready to report status."
            />
            <InfoTile
              title="Card scope"
              value={scopedCards.length > 0 ? "Mixed" : "Global"}
              description="Shows whether your RFID cards are bound to specific doors or shared system-wide."
            />
            <InfoTile
              title="OTP security"
              value="RFID + OTP"
              description="Access flow expects a valid card match first, then local keypad OTP verification."
            />
            <InfoTile
              title="Alert posture"
              value={metrics.totalAlarms > 0 ? "Review needed" : "Stable"}
              description="Alarm-heavy systems should be reviewed from the security page before normal operation."
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <SectionCard
          title="Device API"
          description="Reference values your ESP32 firmware needs for card verification and event upload."
        >
          <div className="space-y-3">
            <ConfigRow
              label="Card verify endpoint"
              value="https://syhgbdsqovpgjyesicgq.supabase.co/functions/v1/verify-card"
              mono
            />
            <ConfigRow
              label="Event ingest endpoint"
              value="https://syhgbdsqovpgjyesicgq.supabase.co/functions/v1/door-event-ingest"
              mono
            />
            <ConfigRow label="Required headers" value="Authorization, apikey, x-device-code, x-device-token" />
            <ConfigRow label="Access flow" value="RFID scan -> card verify -> OTP mail -> keypad OTP -> door unlock" />
          </div>
        </SectionCard>

        <SectionCard
          title="Access Policy"
          description="Simple reminders for how this dashboard currently authorizes entry."
        >
          <div className="space-y-3">
            <ConfigRow label="Card activation" value="Card must exist in authorized_cards and be enabled." />
            <ConfigRow label="Device scope" value="Cards may be global or bound to a specific device_id." />
            <ConfigRow label="Notification target" value="OTP mail is sent to the card owner's saved email." />
            <ConfigRow
              label="Supported security events"
              value="RFID_INVALID, OTP_FAILED, ACCESS_DENIED, ALARM, RESET, CANCELLED"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
