"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ScoreHistogramProps {
  data: { bucket: string; count: number }[];
}

export function ScoreHistogram({ data }: ScoreHistogramProps) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-surface-400">
        No score data yet
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
        Score Distribution
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={32}>
          <defs>
            <linearGradient id="scoreBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15,23,42,0.9)",
              border: "none",
              borderRadius: "12px",
              padding: "8px 12px",
              color: "#f8fafc",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value} students`, "Count"]}
            labelFormatter={(label) => `Score: ${label}%`}
          />
          <Bar dataKey="count" fill="url(#scoreBarGrad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
