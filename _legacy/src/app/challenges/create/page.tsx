"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Type,
  TextCursorInput,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionForm {
  body: string;
  explanation: string;
  questionType: "MCQ" | "FILL_IN_BLANK";
  options: { body: string; isCorrect: boolean }[];
  acceptedAnswers: string;
  isCaseSensitive: boolean;
}

const emptyMCQ: QuestionForm = {
  body: "",
  explanation: "",
  questionType: "MCQ",
  options: [
    { body: "", isCorrect: true },
    { body: "", isCorrect: false },
    { body: "", isCorrect: false },
    { body: "", isCorrect: false },
  ],
  acceptedAnswers: "",
  isCaseSensitive: false,
};

const emptyBlank: QuestionForm = {
  body: "",
  explanation: "",
  questionType: "FILL_IN_BLANK",
  options: [],
  acceptedAnswers: "",
  isCaseSensitive: false,
};

export default function CreateChallengePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { ...emptyMCQ, options: [...emptyMCQ.options.map((o) => ({ ...o }))] },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  function addQuestion(type: "MCQ" | "FILL_IN_BLANK") {
    if (type === "FILL_IN_BLANK") {
      setQuestions((prev) => [...prev, { ...emptyBlank }]);
    } else {
      setQuestions((prev) => [
        ...prev,
        { ...emptyMCQ, options: [...emptyMCQ.options.map((o) => ({ ...o }))] },
      ]);
    }
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: string, value: any) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  }

  function toggleQuestionType(index: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        if (q.questionType === "MCQ") {
          return { ...q, questionType: "FILL_IN_BLANK", options: [] };
        } else {
          return {
            ...q,
            questionType: "MCQ",
            options: emptyMCQ.options.map((o) => ({ ...o })),
            acceptedAnswers: "",
          };
        }
      })
    );
  }

  function insertBlank(index: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        return { ...q, body: q.body + "{{blank}}" };
      })
    );
  }

  function updateOption(qi: number, oi: number, field: string, value: any) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const options = q.options.map((opt, j) => {
          if (field === "isCorrect") {
            return { ...opt, isCorrect: j === oi };
          }
          return j === oi ? { ...opt, [field]: value } : opt;
        });
        return { ...q, options };
      })
    );
  }

  function renderBlankPreview(body: string) {
    const parts = body.split("{{blank}}");
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && (
          <span className="inline-block mx-1 px-4 py-0.5 border-b-2 border-brand-400 bg-brand-50 rounded-t text-brand-600 text-xs font-medium dark:border-brand-500 dark:bg-brand-950 dark:text-brand-300">
            ________
          </span>
        )}
      </span>
    ));
  }

  async function handleSubmit(publish: boolean) {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          categoryId: categoryId || undefined,
          timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          questions: questions.map((q, i) => ({
            body: q.body,
            explanation: q.explanation || undefined,
            orderIndex: i,
            questionType: q.questionType,
            acceptedAnswers:
              q.questionType === "FILL_IN_BLANK"
                ? q.acceptedAnswers.split(",").map((a) => a.trim()).filter(Boolean)
                : [],
            isCaseSensitive: q.isCaseSensitive,
            options:
              q.questionType === "MCQ"
                ? q.options.filter((o) => o.body.trim())
                : [],
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create challenge");
        return;
      }

      if (publish) {
        await fetch(`/api/challenges/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: true }),
        });
      }

      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-in">
      <button
        onClick={() => router.back()}
        className="btn-ghost mb-6 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-6">
        Create New Challenge
      </h1>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Challenge Details */}
      <div className="card mb-6">
        <h2 className="font-semibold text-lg mb-4">Challenge Details</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="label">Title *</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g. JavaScript Basics Quiz"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Brief description of this challenge..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulty" className="label">Difficulty</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="tags" className="label">Tags (comma-separated)</label>
              <input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input"
                placeholder="javascript, basics"
              />
            </div>
            <div>
              <label htmlFor="timeLimit" className="label">Time Limit (seconds)</label>
              <input
                id="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="input"
                placeholder="e.g. 300"
              />
            </div>
            <div>
              <label htmlFor="est" className="label">Est. Minutes</label>
              <input
                id="est"
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="input"
                placeholder="e.g. 10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">
            Questions ({questions.length})
          </h2>
          <div className="flex gap-2">
            <button onClick={() => addQuestion("MCQ")} className="btn-ghost text-sm">
              <Type className="h-4 w-4" /> Add MCQ
            </button>
            <button onClick={() => addQuestion("FILL_IN_BLANK")} className="btn-ghost text-sm">
              <TextCursorInput className="h-4 w-4" /> Add Blank
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {qi + 1}
                  </span>
                  {/* Question Type Toggle */}
                  <button
                    onClick={() => toggleQuestionType(qi)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                      q.questionType === "MCQ"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                    )}
                  >
                    {q.questionType === "MCQ" ? (
                      <><Type className="h-3 w-3" /> MCQ</>
                    ) : (
                      <><TextCursorInput className="h-3 w-3" /> Fill in Blank</>
                    )}
                  </button>
                </div>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qi)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    aria-label={`Remove question ${qi + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Question Body */}
                <div>
                  <label className="label">
                    Question *
                    {q.questionType === "FILL_IN_BLANK" && (
                      <span className="ml-2 text-xs text-surface-400 font-normal">
                        Use {"{{blank}}"} for blanks
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={q.body}
                      onChange={(e) => updateQuestion(qi, "body", e.target.value)}
                      className="input min-h-[60px] resize-y flex-1"
                      placeholder={
                        q.questionType === "FILL_IN_BLANK"
                          ? "e.g. The capital of France is {{blank}}."
                          : "Enter your question..."
                      }
                      rows={2}
                    />
                    {q.questionType === "FILL_IN_BLANK" && (
                      <button
                        type="button"
                        onClick={() => insertBlank(qi)}
                        className="btn-ghost text-xs self-start whitespace-nowrap"
                        title="Insert blank placeholder"
                      >
                        + Blank
                      </button>
                    )}
                  </div>
                </div>

                {/* Fill-in-the-Blank Preview */}
                {q.questionType === "FILL_IN_BLANK" && q.body.includes("{{blank}}") && (
                  <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/30 p-3 dark:border-brand-800 dark:bg-brand-950/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Eye className="h-3 w-3 text-brand-500" />
                      <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        Preview
                      </span>
                    </div>
                    <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                      {renderBlankPreview(q.body)}
                    </p>
                  </div>
                )}

                {/* MCQ Options */}
                {q.questionType === "MCQ" && (
                  <div>
                    <label className="label">Options (click ✓ to mark correct)</label>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateOption(qi, oi, "isCorrect", true)}
                            className={cn(
                              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                              opt.isCorrect
                                ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                                : "border-surface-200 text-surface-400 hover:border-surface-300 dark:border-surface-700"
                            )}
                            aria-label={`Mark option ${String.fromCharCode(65 + oi)} as correct`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <input
                            value={opt.body}
                            onChange={(e) => updateOption(qi, oi, "body", e.target.value)}
                            className="input flex-1"
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill-in-Blank Accepted Answers */}
                {q.questionType === "FILL_IN_BLANK" && (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Accepted Answers (comma-separated) *</label>
                      <input
                        value={q.acceptedAnswers}
                        onChange={(e) => updateQuestion(qi, "acceptedAnswers", e.target.value)}
                        className="input"
                        placeholder="e.g. Paris, paris"
                      />
                      <p className="text-xs text-surface-400 mt-1">
                        Students must type one of these exact answers to get credit.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.isCaseSensitive}
                          onChange={(e) => updateQuestion(qi, "isCaseSensitive", e.target.checked)}
                          className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-surface-600 dark:text-surface-400">Case-sensitive grading</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="label">Explanation (shown after attempt)</label>
                  <input
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qi, "explanation", e.target.value)}
                    className="input"
                    placeholder="Why is this answer correct?"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => handleSubmit(false)}
          disabled={loading || !title || questions.some((q) => !q.body)}
          className="btn-secondary flex-1"
        >
          {loading ? "Saving..." : "Save as Draft"}
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={loading || !title || questions.some((q) => !q.body)}
          className="btn-primary flex-1"
        >
          {loading ? "Publishing..." : "Publish Challenge"}
        </button>
      </div>
    </div>
  );
}
