"use client";

import DoorStatusIndicator from "@/components/dashboard/DoorStatusIndicator";
import type { DoorState } from "@/types";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 3l7 3v5c0 4.5-2.8 7.9-7 10-4.2-2.1-7-5.5-7-10V6l7-3z" />
    </svg>
  );
}

export default function Navbar({
  doorState,
  userLabel
}: {
  doorState: DoorState;
  userLabel: string;
}) {
  return (
    <header className="rounded-[28px] border border-white/10 bg-zinc-900/80 px-5 py-5 shadow-[0_18px_80px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-800 text-zinc-100">
            <ShieldIcon />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Smart IoT Door</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
              Smart Door Security Dashboard
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <DoorStatusIndicator state={doorState} />
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-800/80 px-3 py-2.5 text-zinc-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400">
              <UserIcon />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Operator</p>
              <p className="text-sm text-zinc-100">{userLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
