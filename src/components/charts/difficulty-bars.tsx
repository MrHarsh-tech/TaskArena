"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DifficultyBarsProps {
  data: { difficulty: string; avgScore: number; count: number }[];
}

const COLORS: Record<string, string> = {
  EASY: "#10b981",
  MEDIUM: "#f59e0b",
  HARD: "#ef4444",
};

export function DifficultyBars({ data }: DifficultyBarsProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-surface-400">
        No difficulty data yet
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: d.difficulty.charAt(0) + d.difficulty.slice(1).toLowerCase(),
  }));

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
        Difficulty Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted} layout="vertical" barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="label"
            type="category"
            tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={70}
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
            formatter={(value: number, _name: string, props: any) => [
              `${value}% (${props.payload.count} attempts)`,
              "Avg Score",
            ]}
          />
          <Bar dataKey="avgScore" radius={[0, 8, 8, 0]}>
            {formatted.map((entry) => (
              <Cell key={entry.difficulty} fill={COLORS[entry.difficulty] || "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
