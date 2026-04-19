"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EngagementTimelineProps {
  data: { date: string; attempts: number }[];
}

export function EngagementTimeline({ data }: EngagementTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-surface-400">
        No engagement data yet
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
        Student Engagement (30 days)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            interval={6}
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
            formatter={(value: number) => [`${value} attempts`, "Activity"]}
            labelFormatter={(label) => new Date(label).toLocaleDateString("en", { month: "long", day: "numeric" })}
          />
          <Area
            type="monotone"
            dataKey="attempts"
            stroke="#ec4899"
            strokeWidth={2}
            fill="url(#engagementGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
