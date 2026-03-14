"use client";

import { useFormState } from "react-dom";
import { saveCardFormAction, type DashboardFormState } from "@/app/dashboard/actions";
import type { Device } from "@/types";
import FormActionButton from "@/components/dashboard/FormActionButton";

const initialState: DashboardFormState = {};

export default function AddCardForm({ devices }: { devices: Device[] }) {
  const [state, formAction] = useFormState(saveCardFormAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-2">
      <input
        name="uid"
        placeholder="Card UID"
        className="rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
        required
      />
      <input
        name="label"
        placeholder="Card label"
        className="rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
        required
      />
      <input
        name="owner_name"
        placeholder="Owner name"
        className="rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
      />
      <input
        name="email"
        type="email"
        placeholder="Owner email"
        className="rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
      />
      <select
        name="device_id"
        className="rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
        defaultValue=""
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
        placeholder="Optional notes"
        className="min-h-28 rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60 lg:col-span-2"
      />
      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input type="checkbox" name="is_enabled" defaultChecked className="h-4 w-4" />
        Enabled
      </label>
      {state?.message ? (
        <div
          className={`lg:col-span-2 rounded-2xl px-4 py-3 text-sm ${
            state.status === "success"
              ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {state.message}
        </div>
      ) : null}
      <div className="lg:col-span-2">
        <FormActionButton
          idleLabel="Save card"
          pendingLabel="Saving card..."
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>
    </form>
  );
}
