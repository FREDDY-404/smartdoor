import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import RealtimeRefresh from "@/components/dashboard/RealtimeRefresh";
import { requireAdmin } from "@/lib/auth";
import { getDevices, getDeviceStatuses } from "@/lib/data";
import { formatDateTime, maskToken } from "@/lib/format";
import { deleteDeviceAction, rotateDeviceTokenAction, saveDeviceAction } from "@/app/dashboard/actions";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const { supabase } = await requireAdmin();
  const [devices, statuses] = await Promise.all([getDevices(supabase), getDeviceStatuses(supabase)]);
  const statusMap = new Map(statuses.map((status) => [status.device_id, status]));

  const { data: tokens } = await supabase
    .from("devices")
    .select("*")
    .order("name", { ascending: true });

  const tokenMap = new Map(
    (tokens ?? []).map((device: any) => [device.id, device.secret_token ?? device.device_token ?? ""])
  );

  return (
    <div className="space-y-6">
      <RealtimeRefresh tables={["devices", "device_status"]} />
      <SectionCard
        title="Register Device"
        description="Add a smart door device with a stable device code. A secret token is generated automatically."
      >
        <form action={saveDeviceAction} className="grid gap-4 lg:grid-cols-2">
          <input
            name="name"
            placeholder="Device name"
            required
            className="rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
          />
          <input
            name="device_code"
            placeholder="Device code"
            required
            className="rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
          />
          <input
            name="location"
            placeholder="Location"
            className="rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
          />
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4" />
            Active
          </label>
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-soft"
            >
              Save device
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Registered Devices"
        description="Manage device metadata, status, last seen time, and token rotation."
      >
        {devices.length === 0 ? (
          <EmptyState
            title="No devices registered"
            description="Create at least one device so the dashboard can accept incoming smart door events."
          />
        ) : (
          <div className="space-y-4">
            {devices.map((device) => {
              const status = statusMap.get(device.id);
              const token = tokenMap.get(device.id) || "";

              return (
                <div
                  key={device.id}
                  className="rounded-2xl border border-border/70 bg-panel2/75 p-5"
                >
                  <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <form action={saveDeviceAction} className="grid gap-4 md:grid-cols-2">
                      <input type="hidden" name="id" value={device.id} />
                      <input
                        name="name"
                        defaultValue={device.name}
                        required
                        className="rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
                      />
                      <input
                        name="device_code"
                        defaultValue={device.device_code}
                        required
                        className="rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
                      />
                      <input
                        name="location"
                        defaultValue={device.location ?? ""}
                        placeholder="Location"
                        className="rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
                      />
                      <label className="flex items-center gap-3 text-sm text-slate-300">
                        <input type="checkbox" name="is_active" defaultChecked={device.is_active} className="h-4 w-4" />
                        Active
                      </label>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="rounded-2xl border border-border px-4 py-2 text-sm text-white transition hover:bg-panel"
                        >
                          Update device
                        </button>
                      </div>
                    </form>

                    <div className="space-y-3 rounded-2xl border border-border/70 bg-panel/80 p-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current state</p>
                        <p className="mt-1 text-white">{status?.door_state ?? "unknown"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last seen</p>
                        <p className="mt-1 text-slate-300">
                          {formatDateTime(status?.last_seen_at ?? device.last_seen_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Secret token</p>
                        <p className="mt-1 text-slate-300">{maskToken(token)}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <form action={rotateDeviceTokenAction}>
                          <input type="hidden" name="id" value={device.id} />
                          <button
                            type="submit"
                            className="rounded-2xl border border-warning/50 px-4 py-2 text-sm text-warning transition hover:bg-warning/10"
                          >
                            Rotate token
                          </button>
                        </form>
                        <form action={deleteDeviceAction}>
                          <input type="hidden" name="id" value={device.id} />
                          <button
                            type="submit"
                            className="rounded-2xl border border-danger/50 px-4 py-2 text-sm text-danger transition hover:bg-danger/10"
                          >
                            Delete device
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
