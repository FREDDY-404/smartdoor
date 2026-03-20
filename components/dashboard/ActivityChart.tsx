"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type ActivityChartProps = {
  barData: Array<{ label: string; success: number; failed: number }>;
  totals: { success: number; failed: number };
};

export default function ActivityChart({ barData, totals }: ActivityChartProps) {
  const pieData = [
    { name: "Success", value: totals.success, color: "#22c55e" },
    { name: "Failed", value: totals.failed, color: "#f43f5e" }
  ];

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
      <div className="min-w-0 rounded-[24px] border border-white/10 bg-zinc-800/80 p-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Activity Chart</p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-50">Success vs failed attempts</h3>
        </div>
        <div className="h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  color: "#fafafa"
                }}
              />
              <Bar dataKey="success" stackId="activity" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="failed" stackId="activity" fill="#f43f5e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="min-w-0 rounded-[24px] border border-white/10 bg-zinc-800/80 p-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Distribution</p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-50">Current ratio</h3>
        </div>
        <div className="h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={68}
                outerRadius={96}
                paddingAngle={4}
                strokeWidth={0}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  color: "#fafafa"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {pieData.map((entry) => (
            <div key={entry.name} className="rounded-2xl border border-white/8 bg-zinc-900/60 px-3 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-zinc-300">{entry.name}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-zinc-50">{entry.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
