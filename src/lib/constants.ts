import type { Difficulty } from "./types";

export const DIFFICULTY_LABEL: Record<Difficulty | "MIXED", string> = {
  EASY: "সহজ",
  MEDIUM: "মধ্যম",
  HARD: "কঠিন",
  MIXED: "মিশ্র",
};

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  EASY: 5,
  MEDIUM: 10,
  HARD: 15,
};

export const DIFFICULTY_BADGE: Record<Difficulty | "MIXED", string> = {
  EASY: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  HARD: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  MIXED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
};

export const QUESTION_COUNT_OPTIONS = [10, 20, 30] as const;

/** Bangla digits make the timer and scores feel native. */
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export const toBn = (value: number | string): string =>
  String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

export const formatClock = (totalSeconds: number): string => {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${toBn(String(m).padStart(2, "0"))}:${toBn(String(s).padStart(2, "0"))}`;
};

export const formatBnDate = (iso: string): string => {
  if (!iso) return "";
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
};
