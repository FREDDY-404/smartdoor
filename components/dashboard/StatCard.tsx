function MetricIcon({ label }: { label: string }) {
  if (label.toLowerCase().includes("granted")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <path d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (label.toLowerCase().includes("denied")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <path d="M6 6l12 12M18 6l-12 12" />
      </svg>
    );
  }

  if (label.toLowerCase().includes("otp")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <rect x="5" y="11" width="14" height="8" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 3l7 3v5c0 4.5-2.8 7.9-7 10-4.2-2.1-7-5.5-7-10V6l7-3z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export default function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(165deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{label}</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-accent shadow-[0_0_18px_rgba(243,201,105,0.22)]">
          <MetricIcon label={label} />
        </span>
      </div>
      <p className="mt-4 font-display text-4xl font-semibold tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-slate-400">{hint}</p> : null}
    </div>
  );
}
