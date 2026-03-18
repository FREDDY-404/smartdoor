"use client";

import type { ReactNode } from "react";

export default function StatusCard({
  label,
  value,
  icon,
  tone
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: "neutral" | "success" | "danger" | "warning";
}) {
  const toneStyles = {
    neutral: "border-zinc-700/80 bg-zinc-800/90 text-zinc-100",
    success: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-100",
    danger: "border-rose-500/20 bg-rose-500/[0.08] text-rose-100",
    warning: "border-amber-400/20 bg-amber-400/[0.08] text-amber-100"
  }[tone];

  const iconStyles = {
    neutral: "bg-zinc-900 text-zinc-300",
    success: "bg-emerald-500/10 text-emerald-300",
    danger: "bg-rose-500/10 text-rose-300",
    warning: "bg-amber-400/10 text-amber-200"
  }[tone];

  return (
    <article className={`rounded-[24px] border p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)] ${toneStyles}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-current">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconStyles}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}
