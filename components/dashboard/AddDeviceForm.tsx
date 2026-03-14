"use client";

import { useFormState } from "react-dom";
import { saveDeviceFormAction, type DashboardFormState } from "@/app/dashboard/actions";
import FormActionButton from "@/components/dashboard/FormActionButton";

const initialState: DashboardFormState = {};

export default function AddDeviceForm() {
  const [state, formAction] = useFormState(saveDeviceFormAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-2">
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
          idleLabel="Save device"
          pendingLabel="Saving device..."
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>
    </form>
  );
}
