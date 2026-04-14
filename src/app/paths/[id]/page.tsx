"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Play,
  Lock,
  Trophy,
  Star
} from "lucide-react";
import { formatPercentage, cn } from "@/lib/utils";

export default function PathDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const fetchPath = useCallback(() => {
    fetch(`/api/learning-paths/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setData(data);
      })
      .catch(() => router.push("/paths"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  useEffect(() => {
    fetchPath();
  }, [fetchPath]);

  async function handleEnroll() {
    if (!session) return router.push("/login");
    setEnrolling(true);
    try {
      const res = await fetch(`/api/learning-paths/${params.id}/enroll`, { method: "POST" });
      if (res.ok) {
        fetchPath();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="shimmer h-8 w-40 rounded-xl" />
      </div>
    );
  }

  if (!data?.path) return null;

  const { path, userProgress } = data;
  const currentStepIndex = userProgress?.currentStepIndex || 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-in">
      <button onClick={() => router.push("/paths")} className="btn-ghost mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to paths
      </button>

      {/* Path Header */}
      <div className="card mb-8 overflow-hidden relative">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${path.color}40, transparent)` }}
        />
        
        <div className="relative flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
          <div 
            className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl text-5xl shadow-xl shadow-surface-200 dark:shadow-none"
            style={{ backgroundColor: path.color + "20" }}
          >
            {path.iconEmoji}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">
              {path.title}
            </h1>
            <p className="text-surface-600 dark:text-surface-400 max-w-2xl">
              {path.description}
            </p>
            
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="badge bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300">
                {path.steps.length} Steps
              </span>
              <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                Created by {path.creator.name}
              </span>
            </div>
            
            {!userProgress && (
              <div className="mt-6 flex justify-center sm:justify-start">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary py-3 px-8 text-lg font-bold shadow-lg transition-transform hover:-translate-y-1"
                  style={{ backgroundColor: path.color, boxShadow: `0 4px 14px ${path.color}40`, color: "white" }}
                >
                  {enrolling ? "Enrolling..." : "Enroll to Begin Journey"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {userProgress && (
          <div className="mt-8 relative pt-4 border-t border-surface-100 dark:border-surface-800">
            <div className="flex justify-between items-center mb-2 text-sm font-medium">
              <span className="text-brand-600 dark:text-brand-400">Path Progress</span>
              <span className="text-surface-500">
                {userProgress.completedSteps} of {path.steps.length} completed
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  background: path.color,
                  width: `${(userProgress.completedSteps / Math.max(path.steps.length, 1)) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Steps Sequence */}
      <div className="relative">
        <div className="absolute left-8 top-8 bottom-8 w-1 bg-surface-200 dark:bg-surface-800" />
        
        <div className="space-y-6">
          {path.steps.map((step: any, index: number) => {
            const isCompleted = userProgress?.completedSteps > index;
            const isCurrent = currentStepIndex === index;
            const isLocked = !isCompleted && !isCurrent;
            const attempt = step.userAttempt;

            return (
              <div key={step.id} className={cn(
                "relative flex items-center gap-6",
                isLocked ? "opacity-60" : "opacity-100"
              )}>
                {/* Status Node */}
                <div className={cn(
                  "relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 text-xl shadow-lg transition-transform",
                  isCompleted 
                    ? "bg-emerald-500 border-emerald-100 text-white dark:border-emerald-900" 
                    : isCurrent
                    ? "bg-white border-brand-500 text-brand-500 scale-110 dark:bg-surface-900"
                    : "bg-surface-100 border-surface-200 text-surface-400 dark:bg-surface-800 dark:border-surface-700"
                )}
                style={isCurrent ? { borderColor: path.color, color: path.color } : {}}
                >
                  {isCompleted ? <CheckCircle className="h-8 w-8" /> : isLocked ? <Lock className="h-6 w-6" /> : index + 1}
                </div>

                {/* Step Card */}
                <div className={cn(
                  "card flex-1 p-5 border-l-4 transition-all hover:-translate-y-1",
                  isCurrent ? "shadow-xl" : "shadow-sm",
                  isLocked ? "border-transparent" : "",
                  step.isBossBattle && !isLocked ? "bg-gradient-to-r from-red-50 to-orange-50 border-orange-500 dark:from-red-950/20 dark:to-orange-950/20" : ""
                )}
                style={isCurrent && !step.isBossBattle ? { borderLeftColor: path.color } : {}}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
                          {step.isBossBattle ? "👑 Boss Battle" : `Step ${index + 1}`}
                        </span>
                        {step.xpBonus > 0 && (
                          <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[10px]">
                            +{step.xpBonus} XP Bonus
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-1">
                        {step.title || step.challenge.title}
                      </h3>
                      
                      <p className="text-sm text-surface-500 line-clamp-2">
                        {step.description || step.challenge.description}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-3 text-xs font-medium text-surface-600 dark:text-surface-400">
                        <span className="flex items-center gap-1">
                           <Trophy className="h-3.5 w-3.5" /> 
                           {step.challenge.difficulty}
                        </span>
                        <span>•</span>
                        <span>{step.challenge._count.questions} Questions</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      {isCompleted && attempt && (
                        <div className="text-right">
                          <p className="text-xs text-surface-500">Best Score</p>
                          <p className="text-xl font-bold text-emerald-600">{formatPercentage(attempt.percentage)}</p>
                        </div>
                      )}
                      
                      {!isLocked ? (
                        <Link 
                          href={`/challenges/${step.challengeId}`}
                          className={cn(
                            "btn-primary py-2 px-5 font-semibold",
                            isCompleted ? "bg-surface-200 text-surface-800 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-100 dark:hover:bg-surface-600" : ""
                          )}
                          style={(!isCompleted && !step.isBossBattle) ? { backgroundColor: path.color, boxShadow: `0 4px 14px ${path.color}40` } : {}}
                        >
                          {isCompleted ? "Review" : <><Play className="h-4 w-4 mr-1" /> Start</>}
                        </Link>
                      ) : (
                        <button disabled className="btn-secondary py-2 px-5 opacity-50 cursor-not-allowed">
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
