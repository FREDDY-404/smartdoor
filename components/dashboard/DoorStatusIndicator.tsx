"use client";

import type { DoorState } from "@/types";

const statusStyles: Record<DoorState, string> = {
  locked: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  unlocked: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  alarm: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  unknown: "border-zinc-500/25 bg-zinc-500/10 text-zinc-300"
};

const dotStyles: Record<DoorState, string> = {
  locked: "bg-emerald-400",
  unlocked: "bg-amber-300",
  alarm: "bg-rose-400",
  unknown: "bg-zinc-400"
};

export default function DoorStatusIndicator({ state }: { state: DoorState }) {
  const label = state.charAt(0).toUpperCase() + state.slice(1);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.24em] ${statusStyles[state]}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dotStyles[state]}`} />
      {label}
    </div>
  );
}
