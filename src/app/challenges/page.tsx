"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen,
  Target,
  Search,
  Clock,
  Bookmark,
  BookmarkCheck,
  Filter,
} from "lucide-react";
import { getDifficultyColor, cn } from "@/lib/utils";

export default function ChallengesPage() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Fetch challenges
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (difficulty) params.set("difficulty", difficulty);
    if (categoryId) params.set("categoryId", categoryId);

    setLoading(true);
    fetch(`/api/challenges?${params}`)
      .then((res) => res.json())
      .then((data) => setChallenges(Array.isArray(data) ? data : []))
      .catch(() => setChallenges([]))
      .finally(() => setLoading(false));
  }, [search, difficulty, categoryId]);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Fetch bookmarks
  useEffect(() => {
    if (!session) return;
    fetch("/api/bookmarks")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBookmarkedIds(new Set(data.map((b: any) => b.challengeId)));
        }
      })
      .catch(() => {});
  }, [session]);

  async function toggleBookmark(e: React.MouseEvent, challengeId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });
      const data = await res.json();
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (data.bookmarked) {
          next.add(challengeId);
        } else {
          next.delete(challengeId);
        }
        return next;
      });
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          Challenges
        </h1>
        <p className="mt-2 text-surface-500">
          Test your knowledge across various topics and difficulty levels.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search challenges..."
          />
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setCategoryId("")}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                categoryId === ""
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/25"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id === categoryId ? "" : cat.id)}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap",
                  categoryId === cat.id
                    ? "text-white shadow-md"
                    : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400"
                )}
                style={
                  categoryId === cat.id
                    ? { backgroundColor: cat.color, boxShadow: `0 4px 14px ${cat.color}40` }
                    : undefined
                }
              >
                {cat.name}
                {cat._count?.challenges > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({cat._count.challenges})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Difficulty filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-surface-400" />
          <div className="flex gap-2">
            {["", "EASY", "MEDIUM", "HARD"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-medium transition-all",
                  difficulty === d
                    ? d === "EASY"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : d === "MEDIUM"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : d === "HARD"
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "bg-surface-100 text-surface-500 hover:bg-surface-200 dark:bg-surface-800"
                )}
              >
                {d || "All"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card">
              <div className="h-32 shimmer rounded-xl" />
            </div>
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="h-16 w-16 text-surface-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-300">
            No challenges found
          </h2>
          <p className="mt-2 text-surface-500">
            {search || difficulty || categoryId
              ? "Try adjusting your filters."
              : "Check back soon for new challenges!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <Link
              key={challenge.id}
              href={`/challenges/${challenge.id}`}
              className="card-interactive group relative"
            >
              {/* Category color bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: challenge.category?.color || "#6366f1" }}
              />

              <div className="flex items-start justify-between mb-2 pt-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate flex items-center gap-2">
                    {challenge.title}
                    {challenge.isDailyMystery && (
                      <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-0.5" title="Daily Mystery Challenge">
                        <span className="text-[10px] px-1 font-bold">🎁 Daily Mystery</span>
                      </span>
                    )}
                  </h3>
                  {challenge.category && (
                    <span
                      className="inline-block mt-1 badge text-[10px]"
                      style={{
                        backgroundColor: challenge.category.color + "18",
                        color: challenge.category.color,
                      }}
                    >
                      {challenge.category.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty.toLowerCase()}
                  </span>
                  {session && (
                    <button
                      onClick={(e) => toggleBookmark(e, challenge.id)}
                      className="text-surface-300 hover:text-brand-500 transition-colors"
                      aria-label={bookmarkedIds.has(challenge.id) ? "Remove bookmark" : "Add bookmark"}
                    >
                      {bookmarkedIds.has(challenge.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-brand-500" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {challenge.description && (
                <p className="text-sm text-surface-500 line-clamp-2 mb-3">
                  {challenge.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-surface-400 mt-auto pt-2 border-t border-surface-100 dark:border-surface-800">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {challenge._count?.questions || 0} Q
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {challenge._count?.attempts || 0}
                </span>
                {challenge.estimatedMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{challenge.estimatedMinutes}m
                  </span>
                )}
                {challenge.creator && (
                  <span className="ml-auto text-surface-400">
                    by {challenge.creator.name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
