"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  BookOpen,
  Clock,
  Target,
  Trophy,
  Timer,
} from "lucide-react";
import { formatPercentage, getDifficultyColor, cn } from "@/lib/utils";
import { MysteryRewardToast } from "@/components/ui/mystery-reward-toast";

type Phase = "overview" | "playing" | "results";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  timeLimit?: number | null;
  estimatedMinutes?: number | null;
  category?: { name: string; color: string } | null;
  questions: {
    id: string;
    body: string;
    explanation?: string;
    questionType: "MCQ" | "FILL_IN_BLANK";
    options: { id: string; body: string }[];
  }[];
  creator: { name: string };
  _count: { attempts: number };
}

export default function ChallengePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("overview");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showRewardToast, setShowRewardToast] = useState(false);

  useEffect(() => {
    fetch(`/api/challenges/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setChallenge(data);
      })
      .catch(() => router.push("/challenges"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  // Timer
  useEffect(() => {
    if (phase !== "playing" || !challenge?.timeLimit || timeRemaining === null) return;
    if (timeRemaining <= 0) {
      submitAttempt();
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, timeRemaining, challenge?.timeLimit]);

  function startChallenge() {
    setPhase("playing");
    setStartTime(Date.now());
    if (challenge?.timeLimit) {
      setTimeRemaining(challenge.timeLimit);
    }
  }

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function setBlankAnswer(questionId: string, text: string) {
    setBlankAnswers((prev) => ({ ...prev, [questionId]: text }));
  }

  const submitAttempt = useCallback(async () => {
    if (!session || !challenge) return;
    setSubmitting(true);

    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : null;

    const answerList = challenge.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: q.questionType === "MCQ" ? (answers[q.id] || null) : null,
      textResponse: q.questionType === "FILL_IN_BLANK" ? (blankAnswers[q.id] || null) : null,
    }));

    try {
      const res = await fetch(`/api/challenges/${params.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerList, timeTakenSeconds: timeTaken }),
      });
      const data = await res.json();
      setResult(data);
      if (data.mysteryReward) {
        setShowRewardToast(true);
      }
      setPhase("results");
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  }, [session, challenge, answers, blankAnswers, startTime, params.id]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function renderBlankQuestion(body: string, questionId: string, readonly?: boolean, correctAnswer?: string) {
    const parts = body.split("{{blank}}");
    return (
      <span className="leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              readonly ? (
                <span className={cn(
                  "inline-block mx-1 px-3 py-0.5 rounded-md text-sm font-medium border-b-2",
                  correctAnswer
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                )}>
                  {blankAnswers[questionId] || "—"}
                </span>
              ) : (
                <input
                  type="text"
                  value={blankAnswers[questionId] || ""}
                  onChange={(e) => setBlankAnswer(questionId, e.target.value)}
                  className="blank-input"
                  placeholder="type answer"
                  autoComplete="off"
                />
              )
            )}
          </span>
        ))}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="shimmer h-8 w-40 rounded-xl" />
      </div>
    );
  }

  if (!challenge) return null;

  const question = challenge.questions[currentQ];
  const totalQ = challenge.questions.length;
  const answeredCount =
    Object.keys(answers).length +
    Object.values(blankAnswers).filter((v) => v.trim()).length;

  // ---- OVERVIEW PHASE ----
  if (phase === "overview") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-in">
        <button onClick={() => router.push("/challenges")} className="btn-ghost mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to challenges
        </button>

        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                {challenge.title}
              </h1>
              {challenge.category && (
                <span
                  className="mt-1 inline-block badge text-xs"
                  style={{ backgroundColor: challenge.category.color + "20", color: challenge.category.color }}
                >
                  {challenge.category.name}
                </span>
              )}
            </div>
            <span className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty.toLowerCase()}
            </span>
          </div>

          {challenge.description && (
            <p className="text-surface-600 dark:text-surface-400 mb-6">{challenge.description}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl bg-surface-50 p-4 text-center dark:bg-surface-800">
              <BookOpen className="h-5 w-5 mx-auto text-brand-500 mb-1" />
              <p className="text-lg font-bold">{totalQ}</p>
              <p className="text-xs text-surface-500">Questions</p>
            </div>
            <div className="rounded-xl bg-surface-50 p-4 text-center dark:bg-surface-800">
              <Target className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-lg font-bold">{challenge._count.attempts}</p>
              <p className="text-xs text-surface-500">Attempts</p>
            </div>
            {challenge.timeLimit && (
              <div className="rounded-xl bg-surface-50 p-4 text-center dark:bg-surface-800">
                <Timer className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                <p className="text-lg font-bold">{formatTime(challenge.timeLimit)}</p>
                <p className="text-xs text-surface-500">Time Limit</p>
              </div>
            )}
            <div className="rounded-xl bg-surface-50 p-4 text-center dark:bg-surface-800">
              <Trophy className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <p className="text-lg font-bold">{challenge.creator.name}</p>
              <p className="text-xs text-surface-500">Created by</p>
            </div>
          </div>

          {challenge.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {challenge.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {session ? (
            <button onClick={startChallenge} className="btn-primary w-full py-3 text-base">
              Start Challenge <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <div className="text-center">
              <p className="text-surface-500 mb-3">Sign in to attempt this challenge</p>
              <button
                onClick={() => router.push(`/login?callbackUrl=/challenges/${params.id}`)}
                className="btn-primary"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- PLAYING PHASE ----
  if (phase === "playing") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-in">
        {/* Timer and progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Question {currentQ + 1} of {totalQ}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-surface-500">
                {answeredCount}/{totalQ} answered
              </span>
              {timeRemaining !== null && (
                <span className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-bold",
                  timeRemaining <= 30
                    ? "bg-red-100 text-red-600 animate-pulse dark:bg-red-950 dark:text-red-400"
                    : timeRemaining <= 60
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                    : "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300"
                )}>
                  <Timer className="h-3.5 w-3.5" />
                  {formatTime(timeRemaining)}
                </span>
              )}
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-200 dark:bg-surface-700">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={cn(
              "badge text-xs",
              question.questionType === "FILL_IN_BLANK"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            )}>
              {question.questionType === "FILL_IN_BLANK" ? "Fill in the Blank" : "Multiple Choice"}
            </span>
          </div>

          {question.questionType === "FILL_IN_BLANK" ? (
            <div className="text-lg text-surface-900 dark:text-surface-100 mb-6 leading-relaxed">
              {renderBlankQuestion(question.body, question.id)}
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
                {question.body}
              </h2>
              <div className="space-y-3">
                {question.options.map((option, i) => {
                  const isSelected = answers[question.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => selectOption(question.id, option.id)}
                      className={cn(
                        "w-full rounded-xl border-2 p-4 text-left text-sm font-medium transition-all",
                        isSelected
                          ? "border-brand-500 bg-brand-50 text-brand-700 shadow-md shadow-brand-500/10 dark:bg-brand-950 dark:text-brand-300"
                          : "border-surface-200 text-surface-700 hover:border-surface-300 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:border-surface-600"
                      )}
                      aria-pressed={isSelected}
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-current text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option.body}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="btn-ghost"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>

          {currentQ < totalQ - 1 ? (
            <button onClick={() => setCurrentQ((p) => p + 1)} className="btn-primary">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submitAttempt}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? (
                <span className="animate-pulse-soft">Submitting...</span>
              ) : (
                <>Submit Challenge</>
              )}
            </button>
          )}
        </div>

        {/* Question navigation dots */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {challenge.questions.map((q, i) => {
            const isAnswered =
              q.questionType === "MCQ"
                ? !!answers[q.id]
                : !!(blankAnswers[q.id] && blankAnswers[q.id].trim());
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQ(i)}
                className={cn(
                  "h-8 w-8 rounded-lg text-xs font-medium transition-all",
                  i === currentQ
                    ? "bg-brand-600 text-white shadow-md"
                    : isAnswered
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300"
                    : "bg-surface-100 text-surface-500 hover:bg-surface-200 dark:bg-surface-800"
                )}
                aria-label={`Go to question ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- RESULTS PHASE ----
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-in">
      {/* Score Summary */}
      <div className="card mb-8 text-center">
        <div
          className={cn(
            "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold",
            result.percentage >= 70
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
              : result.percentage >= 40
              ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
              : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
          )}
        >
          {formatPercentage(result.percentage)}
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          {result.percentage >= 70
            ? "Great job! 🎉"
            : result.percentage >= 40
            ? "Good effort! 💪"
            : "Keep practicing! 📚"}
        </h2>
        <p className="mt-2 text-surface-500">
          You scored {result.score} out of {result.totalQuestions} questions correctly.
        </p>
        {result.xpEarned && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            +{result.xpEarned} XP earned
          </div>
        )}
      </div>

      {showRewardToast && result.mysteryReward && (
        <MysteryRewardToast
          reward={result.mysteryReward}
          xpMultiplier={result.xpMultiplier}
          onClose={() => setShowRewardToast(false)}
        />
      )}

      {/* Per-question breakdown */}
      <h3 className="section-title text-xl mb-4">Question Breakdown</h3>
      <div className="space-y-4 mb-8">
        {result.answers?.map((answer: any, i: number) => (
          <div
            key={answer.id}
            className={cn(
              "card border-l-4",
              answer.isCorrect ? "border-l-emerald-500" : "border-l-red-500"
            )}
          >
            <div className="flex items-start gap-3">
              {answer.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "badge text-[10px]",
                    answer.question.questionType === "FILL_IN_BLANK"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  )}>
                    {answer.question.questionType === "FILL_IN_BLANK" ? "Blank" : "MCQ"}
                  </span>
                </div>
                <p className="font-medium text-surface-900 dark:text-surface-100">
                  Q{i + 1}: {answer.question.questionType === "FILL_IN_BLANK"
                    ? renderBlankQuestion(answer.question.body, answer.questionId, true, answer.isCorrect ? "correct" : "")
                    : answer.question.body}
                </p>
                {answer.question.questionType === "MCQ" && (
                  <p className="mt-1 text-sm text-surface-500">
                    Your answer:{" "}
                    <span className={answer.isCorrect ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                      {answer.selectedOption?.body || "—"}
                    </span>
                  </p>
                )}
                {answer.question.questionType === "FILL_IN_BLANK" && answer.textResponse && (
                  <p className="mt-1 text-sm text-surface-500">
                    Your answer:{" "}
                    <span className={answer.isCorrect ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                      &ldquo;{answer.textResponse}&rdquo;
                    </span>
                  </p>
                )}
                {!answer.isCorrect && answer.question.questionType === "MCQ" && (
                  <p className="mt-1 text-sm text-emerald-600">
                    Correct answer:{" "}
                    {answer.question.options?.find((o: any) => o.isCorrect)?.body || "—"}
                  </p>
                )}
                {answer.question.explanation && (
                  <p className="mt-2 rounded-lg bg-surface-50 p-3 text-sm text-surface-600 dark:bg-surface-800 dark:text-surface-400">
                    💡 {answer.question.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => {
            setPhase("playing");
            setCurrentQ(0);
            setAnswers({});
            setBlankAnswers({});
            setResult(null);
            setStartTime(Date.now());
            if (challenge.timeLimit) setTimeRemaining(challenge.timeLimit);
          }}
          className="btn-primary flex-1"
        >
          Try Again
        </button>
        <button onClick={() => router.push("/challenges")} className="btn-secondary flex-1">
          Browse More Challenges
        </button>
      </div>
    </div>
  );
}
