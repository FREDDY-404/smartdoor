import SectionCard from "@/components/dashboard/SectionCard";
import { requireAdmin } from "@/lib/auth";
import { getProfile } from "@/lib/data";
import { updateProfileAction } from "@/app/dashboard/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase, user } = await requireAdmin();
  const profile = await getProfile(supabase, user.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard
        title="Admin Profile"
        description="Basic profile settings for the authenticated dashboard administrator."
      >
        <form action={updateProfileAction} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Full name</label>
            <input
              name="full_name"
              defaultValue={profile.full_name ?? ""}
              placeholder="Admin name"
              className="w-full rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
            />
          </div>
          <div className="rounded-2xl border border-border/70 bg-panel2/80 p-4 text-sm text-slate-300">
            <p>Email: {user.email}</p>
            <p className="mt-1">Role: {profile.role}</p>
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
        title="Device Integration Contract"
        description="Reference payload for the Smart Door device-to-dashboard event endpoint."
      >
        <div className="space-y-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-border/70 bg-panel2/80 p-4">
            <p className="font-medium text-white">Endpoint</p>
            <p className="mt-2 font-mono text-xs text-slate-300">POST /api/device/events</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-panel2/80 p-4">
            <p className="font-medium text-white">Required fields</p>
            <pre className="mt-3 overflow-x-auto text-xs text-slate-300">{`{
  "device_code": "front-door-01",
  "device_token": "secret-token",
  "event_type": "ACCESS_GRANTED",
  "uid": "04A2249B",
  "message": "RFID match for Alice",
  "metadata": {
    "source": "rfid"
  }
}`}</pre>
          </div>
          <div className="rounded-2xl border border-border/70 bg-panel2/80 p-4">
            <p className="font-medium text-white">Supported event types</p>
            <p className="mt-2 text-slate-300">
              SYSTEM_READY, RFID_OK, RFID_INVALID, OTP_SENT, OTP_FAILED, ACCESS_GRANTED,
              ACCESS_DENIED, DOOR_UNLOCKED, DOOR_LOCKED, ALARM, RESET, CANCELLED.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
