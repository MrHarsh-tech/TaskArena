"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Plus,
  Clock,
  BarChart3,
  ArrowRight,
  Users,
  Flame,
  Award,
  Sparkles,
  Zap,
  GraduationCap,
  PieChart,
  Activity,
  Map,
} from "lucide-react";
import { formatPercentage, formatRelativeTime, getDifficultyColor } from "@/lib/utils";
import { XpRing } from "@/components/ui/xp-ring";
import { ScoreTrendChart } from "@/components/charts/score-trend";
import { CategoryRadar } from "@/components/charts/category-radar";
import { DifficultyBars } from "@/components/charts/difficulty-bars";
import { ActivityHeatmap } from "@/components/ui/activity-heatmap";
import { ScoreHistogram } from "@/components/charts/score-histogram";
import { CompletionFunnel } from "@/components/charts/completion-funnel";
import { EngagementTimeline } from "@/components/charts/engagement-timeline";
import { QuestionDifficultyGrid } from "@/components/charts/question-difficulty-grid";

interface DashboardData {
  progress: {
    totalAttempts: number;
    averageScore: number;
    challengesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    totalTimeSpentSeconds: number;
  } | null;
  recentAttempts: any[];
  challenges: any[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const isInstructor = session?.user.role === "INSTRUCTOR" || session?.user.role === "ADMIN";

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [progressRes, challengesRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch(
            isInstructor
              ? `/api/challenges?creatorId=${session!.user.id}`
              : "/api/challenges"
          ),
        ]);

        const progress = await progressRes.json();
        const challenges = await challengesRes.json();

        setData({
          progress: progress.progress,
          recentAttempts: progress.recentAttempts || [],
          challenges: Array.isArray(challenges) ? challenges.slice(0, 6) : [],
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session) fetchDashboard();
  }, [session, isInstructor]);

  // Fetch detailed analytics
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const endpoint = isInstructor
          ? "/api/dashboard/instructor-analytics"
          : "/api/dashboard/student-analytics";
        const res = await fetch(endpoint);
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Analytics fetch error:", error);
      } finally {
        setAnalyticsLoading(false);
      }
    }

    if (session) fetchAnalytics();
  }, [session, isInstructor]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="h-20 shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
            Welcome back, {session?.user.name?.split(" ")[0]}! <span className="inline-block animate-bounce-in">👋</span>
          </h1>
          <p className="mt-1 text-surface-500">
            {isInstructor
              ? "Manage your challenges and track student performance."
              : "Continue your learning journey."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isInstructor && (
            <Link href="/quick-play" className="btn-primary bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-500/25 border-orange-400 text-white hover:from-amber-600 hover:to-orange-600">
              <Zap className="h-4 w-4" />
              Quick Play ⚡
            </Link>
          )}
          {isInstructor && (
            <Link href="/challenges/create" className="btn-primary">
              <Plus className="h-4 w-4" />
              Create Challenge
            </Link>
          )}
        </div>
      </div>

      {isInstructor ? (
        <InstructorDashboard data={data} analytics={analytics} analyticsLoading={analyticsLoading} />
      ) : (
        <StudentDashboard data={data} analytics={analytics} analyticsLoading={analyticsLoading} session={session} />
      )}
    </div>
  );
}

// ===================== STUDENT DASHBOARD =====================

function StudentDashboard({ data, analytics, analyticsLoading, session }: any) {
  return (
    <>
      {/* Top row: XP Ring + Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* XP Ring card */}
        <div className="card flex flex-col items-center justify-center py-8 sm:col-span-1">
          <XpRing
            xp={session?.user?.xpPoints || (data?.progress?.totalAttempts || 0) * 10}
            level={session?.user?.level || Math.floor(((data?.progress?.totalAttempts || 0) * 10) / 100) + 1}
          />
          <div className="mt-8 text-center">
            <p className="text-xs text-surface-500">Total XP Earned</p>
            <p className="text-sm font-bold text-gradient">
              {session?.user?.xpPoints || (data?.progress?.totalAttempts || 0) * 10} XP
            </p>
          </div>
        </div>

        {/* Stats */}
        <StatCard
          icon={Target}
          label="Challenges Completed"
          value={data?.progress?.challengesCompleted || 0}
          iconClass="icon-brand"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={formatPercentage(data?.progress?.averageScore || 0)}
          iconClass="icon-success"
        />
        <StatCard
          icon={Activity}
          label="Total Attempts"
          value={data?.progress?.totalAttempts || 0}
          iconClass="icon-electric"
        />
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper icon-coral">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-surface-500">Streak</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-surface-900 dark:text-surface-100">
                  {data?.progress?.currentStreak || 0}
                </p>
                <span className="text-xs text-surface-400">
                  best: {data?.progress?.longestStreak || 0}
                </span>
              </div>
            </div>
          </div>
          {(data?.progress?.currentStreak || 0) > 0 && (
            <div className="mt-2 streak-flame text-center">
              {"🔥".repeat(Math.min(data?.progress?.currentStreak || 0, 5))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-8">
        <h2 className="section-title text-xl mb-4 flex items-center gap-2">
          <div className="icon-wrapper h-8 w-8 icon-electric">
            <PieChart className="h-4 w-4" />
          </div>
          My Progress
        </h2>

        {analyticsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="chart-container"><div className="h-[200px] shimmer" /></div>
            ))}
          </div>
        ) : analytics ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ScoreTrendChart data={analytics.scoreTrend || []} />
            <CategoryRadar data={analytics.categoryPerformance || []} />
            <DifficultyBars data={analytics.difficultyBreakdown || []} />

            {/* Time Spent Card */}
            <div className="chart-container flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
                Time Invested
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="icon-wrapper h-10 w-10 icon-brand mx-auto mb-2">
                    <Clock className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                    {Math.round((analytics.timeSpent?.totalSeconds || 0) / 3600 * 10) / 10}h
                  </p>
                  <p className="text-xs text-surface-500">Total Time</p>
                </div>
                <div className="text-center">
                  <div className="icon-wrapper h-10 w-10 icon-accent mx-auto mb-2">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                    {Math.round((analytics.timeSpent?.avgPerChallenge || 0) / 60)}m
                  </p>
                  <p className="text-xs text-surface-500">Avg per Challenge</p>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="chart-container">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
                Strengths & Weaknesses
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">Strengths</p>
                  {(analytics.strengths || []).map((s: any) => (
                    <div key={s.category} className="mb-2">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-surface-600 dark:text-surface-400">{s.category}</span>
                        <span className="font-semibold text-emerald-600">{s.avgScore}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-100 dark:bg-surface-800">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all" style={{ width: `${s.avgScore}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-2">Needs Work</p>
                  {(analytics.weaknesses || []).map((w: any) => (
                    <div key={w.category} className="mb-2">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-surface-600 dark:text-surface-400">{w.category}</span>
                        <span className="font-semibold text-red-500">{w.avgScore}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-100 dark:bg-surface-800">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-red-400 to-coral-500 transition-all" style={{ width: `${w.avgScore}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="chart-container flex flex-col justify-center items-center">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4 self-start">
                Completion Rate
              </h3>
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-200 dark:text-surface-700" />
                  <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round"
                    stroke="url(#completionGrad)"
                    strokeDasharray={`${((analytics.completionRate?.completed || 0) / Math.max((analytics.completionRate?.completed || 0) + (analytics.completionRate?.abandoned || 0), 1)) * 94.2} 94.2`}
                  />
                  <defs>
                    <linearGradient id="completionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-surface-900 dark:text-surface-100">
                    {Math.round(((analytics.completionRate?.completed || 0) / Math.max((analytics.completionRate?.completed || 0) + (analytics.completionRate?.abandoned || 0), 1)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-surface-500">
                <span>✅ {analytics.completionRate?.completed || 0} done</span>
                <span>⏸ {analytics.completionRate?.abandoned || 0} left</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Activity Heatmap - full width */}
        {analytics?.weeklyActivity && (
          <div className="mt-4">
            <ActivityHeatmap data={analytics.weeklyActivity} />
          </div>
        )}
      </div>



      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="section-title text-xl mb-4 flex items-center gap-2">
          <div className="icon-wrapper h-8 w-8 icon-coral">
            <Clock className="h-4 w-4" />
          </div>
          Recent Attempts
        </h2>
        {data?.recentAttempts.length === 0 ? (
          <div className="card text-center py-8">
            <Clock className="h-8 w-8 text-surface-300 mx-auto mb-2" />
            <p className="text-sm text-surface-500">No recent activity</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data?.recentAttempts.map((attempt: any) => (
              <div key={attempt.id} className="card py-4">
                <p className="font-medium text-sm text-surface-900 dark:text-surface-100">
                  {attempt.challenge?.title || "Challenge"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        attempt.percentage >= 70
                          ? "bg-emerald-500"
                          : attempt.percentage >= 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-semibold">
                      {formatPercentage(attempt.percentage)}
                    </span>
                  </div>
                  <span className="text-xs text-surface-400">
                    {attempt.completedAt
                      ? formatRelativeTime(attempt.completedAt)
                      : "in progress"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Challenges */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title text-xl flex items-center gap-2">
            <div className="icon-wrapper h-8 w-8 icon-success">
              <BookOpen className="h-4 w-4" />
            </div>
            Available Challenges
          </h2>
          <Link href="/challenges" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {data?.challenges.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-surface-300 mb-4" />
            <p className="text-surface-500">No challenges available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.challenges.map((challenge: any) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="card-interactive group">
                <div className="mb-3 h-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)' }} />
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100 group-hover:text-brand-600 transition-colors">
                    {challenge.title}
                  </h3>
                  <span className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty.toLowerCase()}
                  </span>
                </div>
                {challenge.description && (
                  <p className="text-sm text-surface-500 line-clamp-2 mb-3">{challenge.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-surface-400">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{challenge._count?.questions || 0} Q</span>
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" />{challenge._count?.attempts || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ===================== INSTRUCTOR DASHBOARD =====================

function InstructorDashboard({ data, analytics, analyticsLoading }: any) {
  return (
    <>
      {/* Overview Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Total Challenges"
          value={analytics?.overview?.totalChallenges ?? data?.challenges?.length ?? 0}
          iconClass="icon-brand"
        />
        <StatCard
          icon={GraduationCap}
          label="Students Reached"
          value={analytics?.overview?.totalStudentsReached ?? 0}
          iconClass="icon-accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Pass Rate"
          value={`${analytics?.overview?.averagePassRate ?? 0}%`}
          iconClass="icon-success"
        />
        <StatCard
          icon={Activity}
          label="Total Attempts"
          value={analytics?.overview?.totalAttemptsReceived ?? 0}
          iconClass="icon-gold"
        />
      </div>

      {/* Analytics Section */}
      <div className="mb-8">
        <h2 className="section-title text-xl mb-4 flex items-center gap-2">
          <div className="icon-wrapper h-8 w-8 icon-electric">
            <BarChart3 className="h-4 w-4" />
          </div>
          Challenge Performance
        </h2>

        {analyticsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="chart-container"><div className="h-[200px] shimmer" /></div>
            ))}
          </div>
        ) : analytics ? (
          <>
            {/* Challenge Comparison Table */}
            {analytics.challengePerformance?.length > 0 && (
              <div className="chart-container mb-4 overflow-x-auto">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4 flex items-center gap-2">
                  <div className="icon-wrapper h-6 w-6 icon-brand">
                    <BarChart3 className="h-3 w-3" />
                  </div>
                  Challenge Comparison
                </h3>
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-700">
                      <th className="text-left py-2 pr-4 text-xs font-semibold text-surface-500 uppercase">Challenge</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-surface-500 uppercase">Attempts</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-surface-500 uppercase">Avg Score</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-surface-500 uppercase">Pass Rate</th>
                      <th className="text-left py-2 pl-3 text-xs font-semibold text-surface-500 uppercase hidden lg:table-cell">Hardest Question</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.challengePerformance.map((cp: any) => (
                      <tr key={cp.id} className="border-b border-surface-100 last:border-0 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                        <td className="py-2.5 pr-4 font-medium text-surface-900 dark:text-surface-100 max-w-[200px] truncate">{cp.title}</td>
                        <td className="py-2.5 px-3 text-right text-surface-600 dark:text-surface-400">{cp.attempts}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{cp.avgScore}%</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`font-semibold ${cp.passRate >= 60 ? "text-emerald-600" : "text-red-500"}`}>
                            {cp.passRate}%
                          </span>
                        </td>
                        <td className="py-2.5 pl-3 text-xs text-surface-500 max-w-[250px] truncate hidden lg:table-cell">{cp.hardestQuestion?.body} ({cp.hardestQuestion?.correctRate}%)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreHistogram data={analytics.scoreDistribution || []} />
              <CompletionFunnel data={analytics.completionFunnel || []} />
              <EngagementTimeline data={analytics.engagementTimeline || []} />
              <QuestionDifficultyGrid data={analytics.questionDifficulty || []} />
            </div>

            {/* Hardest Questions */}
            {analytics.hardestQuestions?.length > 0 && (
              <div className="chart-container mt-4">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4 flex items-center gap-2">
                  <div className="icon-wrapper h-6 w-6 icon-danger">
                    <Award className="h-3 w-3" />
                  </div>
                  Top 5 Hardest Questions
                </h3>
                <div className="space-y-2">
                  {analytics.hardestQuestions.map((q: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0 dark:border-surface-800">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white ${
                        q.correctRate < 30 ? "bg-red-500" : q.correctRate < 50 ? "bg-orange-500" : "bg-amber-500"
                      }`}>
                        {q.correctRate}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-surface-900 dark:text-surface-100 truncate">{q.body}</p>
                        <p className="text-xs text-surface-500">{q.challengeTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fill-in-Blank Answer Analysis */}
            {analytics.blankAnswerAnalysis?.length > 0 && (
              <div className="chart-container mt-4">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4 flex items-center gap-2">
                  <div className="icon-wrapper h-6 w-6 icon-accent">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  Fill-in-the-Blank: Common Wrong Answers
                </h3>
                <div className="space-y-4">
                  {analytics.blankAnswerAnalysis.map((ba: any, i: number) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">{ba.questionBody}</p>
                      <div className="flex flex-wrap gap-2">
                        {ba.incorrectAnswers.map((ia: any, j: number) => (
                          <span key={j} className="badge bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 px-3 py-1">
                            &ldquo;{ia.text}&rdquo; ({ia.count}×)
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Your Challenges */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title text-xl flex items-center gap-2">
            <div className="icon-wrapper h-8 w-8 icon-gold">
              <BookOpen className="h-4 w-4" />
            </div>
            Your Challenges
          </h2>
          <Link href="/challenges" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {data?.challenges.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-surface-300 mb-4" />
            <p className="text-surface-500">You haven&apos;t created any challenges yet.</p>
            <Link href="/challenges/create" className="btn-primary mt-4">
              <Plus className="h-4 w-4" /> Create your first challenge
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.challenges.map((challenge: any) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="card-interactive group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100 group-hover:text-brand-600 transition-colors">
                    {challenge.title}
                  </h3>
                  <span className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-400 mt-2">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{challenge._count?.questions || 0} Q</span>
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" />{challenge._count?.attempts || 0} attempts</span>
                  <span className={`ml-auto badge ${challenge.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-surface-100 text-surface-500"}`}>
                    {challenge.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ===================== SHARED COMPONENTS =====================

function StatCard({ icon: Icon, label, value, iconClass }: { icon: any; label: string; value: string | number; iconClass: string }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className={`icon-wrapper ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-surface-500">{label}</p>
          <p className="text-xl font-bold text-surface-900 dark:text-surface-100">{value}</p>
        </div>
      </div>
    </div>
  );
}
