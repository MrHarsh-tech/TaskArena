"use client";

import { cn } from "@/lib/utils";

interface QuestionDifficultyGridProps {
  data: {
    challengeTitle: string;
    questionId: string;
    body: string;
    correctRate: number;
  }[];
}

function getHeatColor(rate: number): string {
  if (rate >= 80) return "bg-emerald-400 dark:bg-emerald-500";
  if (rate >= 60) return "bg-emerald-200 dark:bg-emerald-700";
  if (rate >= 40) return "bg-amber-200 dark:bg-amber-700";
  if (rate >= 20) return "bg-orange-300 dark:bg-orange-700";
  return "bg-red-400 dark:bg-red-600";
}

export function QuestionDifficultyGrid({ data }: QuestionDifficultyGridProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[150px] text-sm text-surface-400">
        No question data yet
      </div>
    );
  }

  // Group by challenge
  const grouped = new Map<string, typeof data>();
  for (const q of data) {
    const existing = grouped.get(q.challengeTitle) || [];
    existing.push(q);
    grouped.set(q.challengeTitle, existing);
  }

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
        Question Difficulty Heatmap
      </h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {Array.from(grouped.entries()).map(([title, questions]) => (
          <div key={title}>
            <p className="text-xs font-medium text-surface-500 mb-1.5 truncate" title={title}>
              {title}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {questions.map((q, i) => (
                <div
                  key={q.questionId}
                  className={cn(
                    "heatmap-cell h-8 w-8 flex items-center justify-center rounded-lg text-[10px] font-bold cursor-default",
                    getHeatColor(q.correctRate),
                    q.correctRate >= 60 ? "text-white/90" : "text-white"
                  )}
                  title={`Q${i + 1}: ${q.body.slice(0, 60)}… — ${q.correctRate}% correct`}
                >
                  Q{i + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-surface-100 dark:border-surface-800">
        <span className="text-[10px] text-surface-500">Correct rate:</span>
        <div className="flex gap-1 items-center">
          <div className="h-3 w-3 rounded-sm bg-red-400" /> <span className="text-[10px] text-surface-400">0-20%</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="h-3 w-3 rounded-sm bg-orange-300" /> <span className="text-[10px] text-surface-400">20-40%</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="h-3 w-3 rounded-sm bg-amber-200" /> <span className="text-[10px] text-surface-400">40-60%</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="h-3 w-3 rounded-sm bg-emerald-200" /> <span className="text-[10px] text-surface-400">60-80%</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="h-3 w-3 rounded-sm bg-emerald-400" /> <span className="text-[10px] text-surface-400">80-100%</span>
        </div>
      </div>
    </div>
  );
}
