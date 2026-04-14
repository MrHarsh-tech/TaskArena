"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, Zap, Sparkles } from "lucide-react";
import { getInitials, formatPercentage, cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=50")
      .then((res) => res.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          <div className="icon-wrapper h-10 w-10 icon-gold mx-auto mb-3">
            <Trophy className="h-5 w-5" />
          </div>
          Leaderboard
        </h1>
        <p className="mt-2 text-surface-500">
          Top performers ranked by average score.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="h-14 shimmer rounded-xl" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-16">
          <Trophy className="h-16 w-16 text-surface-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-300">
            No rankings yet
          </h2>
          <p className="mt-2 text-surface-500">
            Complete challenges to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div className="mb-8 grid grid-cols-3 gap-4">
              {/* 2nd place */}
              <div className="card text-center pt-8 mt-8">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}>
                  {getInitials(entries[1].user.name)}
                </div>
                <div className="icon-wrapper h-8 w-8 mx-auto mb-1" style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}>
                  <Medal className="h-4 w-4 text-white" />
                </div>
                <p className="font-semibold text-surface-900 dark:text-surface-100 text-sm">
                  {entries[1].user.name}
                </p>
                {entries[1].user.level && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
                    <Zap className="h-3 w-3" /> Lvl {entries[1].user.level}
                  </span>
                )}
                <p className="text-lg font-bold text-surface-700 dark:text-surface-300">
                  {formatPercentage(entries[1].avgScore)}
                </p>
              </div>

              {/* 1st place */}
              <div className="card text-center border-gold-200 bg-gradient-to-b from-gold-50 to-white dark:from-gold-950/20 dark:to-surface-900 dark:border-gold-800">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)' }}>
                  {getInitials(entries[0].user.name)}
                </div>
                <div className="icon-wrapper h-9 w-9 icon-gold mx-auto mb-1">
                  <Crown className="h-5 w-5" />
                </div>
                <p className="font-bold text-surface-900 dark:text-surface-100">
                  {entries[0].user.name}
                </p>
                {entries[0].user.level && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
                    <Zap className="h-3 w-3" /> Lvl {entries[0].user.level}
                  </span>
                )}
                <p className="text-2xl font-bold text-gradient-gold">
                  {formatPercentage(entries[0].avgScore)}
                </p>
              </div>

              {/* 3rd place */}
              <div className="card text-center pt-8 mt-8">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg, #fb923c, #ea580c)' }}>
                  {getInitials(entries[2].user.name)}
                </div>
                <div className="icon-wrapper h-8 w-8 mx-auto mb-1 icon-coral">
                  <Medal className="h-4 w-4" />
                </div>
                <p className="font-semibold text-surface-900 dark:text-surface-100 text-sm">
                  {entries[2].user.name}
                </p>
                {entries[2].user.level && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
                    <Zap className="h-3 w-3" /> Lvl {entries[2].user.level}
                  </span>
                )}
                <p className="text-lg font-bold text-surface-700 dark:text-surface-300">
                  {formatPercentage(entries[2].avgScore)}
                </p>
              </div>
            </div>
          )}

          {/* Full list */}
          <div className="card overflow-hidden p-0">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.user.id}
                    className={cn(
                      "border-b border-surface-100 last:border-0 dark:border-surface-800 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50",
                      i < 3 && "bg-gold-50/30 dark:bg-gold-950/10"
                    )}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          i === 0
                            ? "bg-gradient-to-br from-gold-400 to-gold-600 text-white"
                            : i === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                            : i === 2
                            ? "bg-gradient-to-br from-coral-400 to-coral-600 text-white"
                            : "text-surface-500"
                        )}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>
                          {getInitials(entry.user.name)}
                        </div>
                        <span className="font-medium text-surface-900 dark:text-surface-100">
                          {entry.user.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-center">
                      {entry.user.level ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          <Zap className="h-3 w-3" /> {entry.user.level}
                        </span>
                      ) : (
                        <span className="text-surface-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatPercentage(entry.avgScore)}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-right text-surface-500">
                      {entry.totalAttempts}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-right text-surface-500">
                      {entry.challengesCompleted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
