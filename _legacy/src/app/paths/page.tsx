"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Map,
  BookOpen,
  Trophy,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getDifficultyColor, cn } from "@/lib/utils";

export default function PathsPage() {
  const { data: session } = useSession();
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learning-paths")
      .then((res) => res.json())
      .then((data) => setPaths(Array.isArray(data) ? data : []))
      .catch(() => setPaths([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50 flex items-center gap-3">
          <div className="icon-wrapper h-10 w-10 icon-electric mx-0">
            <Map className="h-5 w-5" />
          </div>
          Learning Paths
        </h1>
        <p className="mt-2 text-surface-500 max-w-2xl">
          Follow curated journeys to master specific topics. Earn exclusive rewards as you progress through these guided challenges.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="h-40 shimmer rounded-xl" />
            </div>
          ))}
        </div>
      ) : paths.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2 border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-900/50">
          <Map className="h-16 w-16 text-surface-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-300">
            No Learning Paths Yet
          </h2>
          <p className="mt-2 text-surface-500">
            Instructors are currently forging new paths. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <Link
              key={path.id}
              href={`/paths/${path.id}`}
              className="card-interactive group flex flex-col h-full bg-white dark:bg-surface-900 p-0 overflow-hidden"
            >
              {/* Top Banner section */}
              <div 
                className="h-24 relative flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${path.color}40, ${path.color}80)` }}
              >
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '16px 16px',
                  }}
                />
                
                <div className="text-5xl drop-shadow-md z-10 transition-transform group-hover:scale-110 duration-300">
                  {path.iconEmoji}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-surface-900 dark:text-surface-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {path.title}
                  </h3>
                  <span className={getDifficultyColor(path.difficulty)}>
                    {path.difficulty.toLowerCase()}
                  </span>
                </div>
                
                <p className="text-sm text-surface-500 line-clamp-2 mb-4 flex-1">
                  {path.description || "A curated learning journey."}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-surface-600 dark:text-surface-400 pt-4 border-t border-surface-100 dark:border-surface-800">
                  <span className="flex items-center gap-1.5 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-md">
                    <Map className="h-3.5 w-3.5 text-brand-500" />
                    {path._count?.steps || 0} Steps
                  </span>
                  <span className="flex items-center gap-1.5 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-md">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    {path._count?.userProgress || 0} enrolled
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
