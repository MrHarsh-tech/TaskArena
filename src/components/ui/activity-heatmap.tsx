"use client";

import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  data: { date: string; count: number }[];
}

function getIntensity(count: number): string {
  if (count === 0) return "bg-surface-100 dark:bg-surface-800";
  if (count === 1) return "bg-brand-200 dark:bg-brand-800";
  if (count === 2) return "bg-brand-300 dark:bg-brand-700";
  if (count <= 4) return "bg-brand-400 dark:bg-brand-600";
  return "bg-brand-600 dark:bg-brand-500";
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Fill in missing days
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Build 4 weeks × 7 days grid
  const grid: { date: string; count: number; dayName: string }[][] = [];
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  
  for (let week = 0; week < 4; week++) {
    const weekData: { date: string; count: number; dayName: string }[] = [];
    for (let day = 0; day < 7; day++) {
      const index = week * 7 + day;
      if (index < sorted.length) {
        const d = sorted[index];
        const dayOfWeek = new Date(d.date).getDay();
        weekData.push({ ...d, dayName: days[dayOfWeek === 0 ? 6 : dayOfWeek - 1] });
      }
    }
    if (weekData.length > 0) grid.push(weekData);
  }

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
        Weekly Activity
      </h3>
      <div className="flex gap-1.5">
        {/* Day labels */}
        <div className="flex flex-col gap-1.5 pt-0">
          {days.map((d) => (
            <span key={d} className="text-[10px] text-surface-400 h-4 flex items-center">
              {d}
            </span>
          ))}
        </div>
        {/* Grid */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "heatmap-cell h-4 w-4 rounded-[3px]",
                  getIntensity(day.count)
                )}
                title={`${day.date}: ${day.count} ${day.count === 1 ? "attempt" : "attempts"}`}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-surface-100 dark:border-surface-800">
        <span className="text-[10px] text-surface-400">Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-[2px] bg-surface-100 dark:bg-surface-800" />
          <div className="h-3 w-3 rounded-[2px] bg-brand-200 dark:bg-brand-800" />
          <div className="h-3 w-3 rounded-[2px] bg-brand-300 dark:bg-brand-700" />
          <div className="h-3 w-3 rounded-[2px] bg-brand-400 dark:bg-brand-600" />
          <div className="h-3 w-3 rounded-[2px] bg-brand-600 dark:bg-brand-500" />
        </div>
        <span className="text-[10px] text-surface-400">More</span>
      </div>
    </div>
  );
}
