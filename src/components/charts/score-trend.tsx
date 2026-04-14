"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ScoreTrendProps {
  data: { date: string; score: number; title?: string }[];
}

export function ScoreTrendChart({ data }: ScoreTrendProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-surface-400">
        No attempts yet
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
        Score Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
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
            formatter={(value: number) => [`${Math.round(value)}%`, "Score"]}
            labelFormatter={(label) => new Date(label).toLocaleDateString("en", { month: "long", day: "numeric" })}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#06b6d4"
            strokeWidth={2.5}
            dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4, stroke: "#fff" }}
            activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 2, fill: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
