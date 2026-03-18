"use client";

type AlertItem = {
  id: string;
  title: string;
  detail: string;
  tone: "danger" | "warning";
};

function AlertIcon({ tone }: { tone: "danger" | "warning" }) {
  return tone === "danger" ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 8v5M12 17h.01" />
      <path d="M10.3 3.9l-7 12.1A1 1 0 0 0 4.2 17.5h15.6a1 1 0 0 0 .9-1.5l-7-12.1a1 1 0 0 0-1.8 0z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 3l7 3v5c0 4.5-2.8 7.9-7 10-4.2-2.1-7-5.5-7-10V6l7-3z" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

export default function AlertPanel({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-zinc-800/80 p-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Security Alerts</p>
        <h3 className="mt-2 text-lg font-semibold text-zinc-50">Suspicious activity</h3>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className={`rounded-[20px] border p-4 ${
              alert.tone === "danger"
                ? "border-rose-500/20 bg-rose-500/[0.08]"
                : "border-amber-400/20 bg-amber-400/[0.08]"
            }`}
          >
            <div className="flex gap-3">
              <div
                className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${
                  alert.tone === "danger"
                    ? "bg-rose-500/10 text-rose-300"
                    : "bg-amber-400/10 text-amber-200"
                }`}
              >
                <AlertIcon tone={alert.tone} />
              </div>
              <div>
                <p className="font-medium text-zinc-50">{alert.title}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{alert.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
