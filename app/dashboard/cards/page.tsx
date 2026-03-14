import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import RealtimeRefresh from "@/components/dashboard/RealtimeRefresh";
import AddCardForm from "@/components/dashboard/AddCardForm";
import { requireAdmin } from "@/lib/auth";
import { getCards, getDevices } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { deleteCardAction, saveCardAction } from "@/app/dashboard/actions";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const { supabase } = await requireAdmin();
  const [devices, cards] = await Promise.all([getDevices(supabase), getCards(supabase)]);

  return (
    <div className="space-y-6">
      <RealtimeRefresh tables={["authorized_cards", "devices"]} />
      <SectionCard
        title="Add Authorized RFID Card"
        description="Register a card UID, assign an owner, and optionally scope it to a device."
      >
        <AddCardForm devices={devices} />
      </SectionCard>

      <SectionCard
        title="Authorized Cards"
        description="Edit owner, label, device scope, and card enable state."
      >
        {cards.length === 0 ? (
          <EmptyState
            title="No cards registered"
            description="Add your first RFID card above to allow it through the smart door system."
          />
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border border-border/70 bg-panel2/75 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-medium text-white">{card.label}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      UID: {card.uid} · {card.device?.name || "All devices"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Email: {card.email || "No email"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Updated {formatDateTime(card.updated_at)}
                    </p>
                  </div>
                  <form action={deleteCardAction}>
                    <input type="hidden" name="id" value={card.id} />
                    <button
                      type="submit"
                      className="rounded-2xl border border-danger/50 px-4 py-2 text-sm text-danger transition hover:bg-danger/10"
                    >
                      Delete
                    </button>
                  </form>
                </div>

                <form action={saveCardAction} className="mt-4 grid gap-4 lg:grid-cols-2">
                  <input type="hidden" name="id" value={card.id} />
                  <input
                    name="uid"
                    defaultValue={card.uid}
                    className="rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
                    required
                  />
                  <input
                    name="label"
                    defaultValue={card.label}
                    className="rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
                    required
                  />
                  <input
                    name="owner_name"
                    defaultValue={card.owner_name ?? ""}
                    placeholder="Owner name"
                    className="rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
                  />
                  <input
                    name="email"
                    type="email"
                    defaultValue={card.email ?? ""}
                    placeholder="Owner email"
                    className="rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
                  />
                  <select
                    name="device_id"
                    defaultValue={card.device_id ?? ""}
                    className="rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
                  >
                    <option value="">All devices</option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="notes"
                    defaultValue={card.notes ?? ""}
                    placeholder="Notes"
                    className="min-h-24 rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60 lg:col-span-2"
                  />
                  <label className="flex items-center gap-3 text-sm text-slate-300">
                    <input type="checkbox" name="is_enabled" defaultChecked={card.is_enabled} className="h-4 w-4" />
                    Enabled
                  </label>
                  <div className="lg:col-span-2">
                    <button
                      type="submit"
                      className="rounded-2xl border border-border px-4 py-2 text-sm text-white transition hover:bg-panel"
                    >
                      Update card
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
