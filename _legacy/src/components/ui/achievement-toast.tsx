"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

interface AchievementToastProps {
  name: string;
  description: string;
  xpReward: number;
  onClose: () => void;
}

export function AchievementToast({ name, description, xpReward, onClose }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    requestAnimationFrame(() => setVisible(true));

    // Auto dismiss after 5s
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="glass-panel flex items-center gap-4 pr-8 min-w-[320px] border-l-4 border-l-gold-500 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100 text-gold-600 dark:bg-gold-950 dark:text-gold-400 animate-bounce-in">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
            Achievement Unlocked!
          </p>
          <p className="font-bold text-surface-900 dark:text-surface-100">
            {name}
          </p>
          <p className="text-xs text-surface-500">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
            +{xpReward} XP
          </span>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="absolute top-2 right-2 text-surface-400 hover:text-surface-600 text-xs"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
