"use client";

import { formatDateTime } from "@/lib/format";

export type ActivityRow = {
  id: string;
  time: string;
  user: string;
  method: "RFID" | "OTP";
  status: "success" | "failed";
  reason: string;
};

export default function ActivityTable({ rows }: { rows: ActivityRow[] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-zinc-800/80 p-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Live Activity Log</p>
        <h3 className="mt-2 text-lg font-semibold text-zinc-50">Latest events</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="px-3 py-3 font-medium">Time</th>
              <th className="px-3 py-3 font-medium">User / Card ID</th>
              <th className="px-3 py-3 font-medium">Method</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-3 py-4 text-zinc-400">{formatDateTime(row.time)}</td>
                <td className="px-3 py-4 font-medium text-zinc-100">{row.user}</td>
                <td className="px-3 py-4">
                  <span className="rounded-full border border-white/10 bg-zinc-900/70 px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-zinc-300">
                    {row.method}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.18em] ${
                      row.status === "success"
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border border-rose-500/20 bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-4 text-zinc-400">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
