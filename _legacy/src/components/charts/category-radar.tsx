"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryRadarProps {
  data: { category: string; avgScore: number; attempts?: number }[];
}

export function CategoryRadar({ data }: CategoryRadarProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-sm text-surface-400">
        No category data yet
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
        Category Performance
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="rgba(148,163,184,0.2)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
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
            formatter={(value: number) => [`${value}%`, "Avg Score"]}
          />
          <Radar
            dataKey="avgScore"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
