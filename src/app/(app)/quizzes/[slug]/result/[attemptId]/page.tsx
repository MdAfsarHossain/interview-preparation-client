"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/stat-card";
import { apiGet, getErrorMessage } from "@/lib/api";
import {
  DIFFICULTY_BADGE,
  DIFFICULTY_LABEL,
  formatBnDate,
  toBn,
} from "@/lib/constants";
import type { ExamResult, ResultQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "ALL" | "WRONG" | "CORRECT" | "SKIPPED";

const statusOf = (q: ResultQuestion) => {
  if (q.selectedAnswers.length === 0) return "SKIPPED" as const;
  return q.isCorrect ? ("CORRECT" as const) : ("WRONG" as const);
};

export default function ResultPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const { slug, attemptId } = use(params);
  const [filter, setFilter] = useState<Filter>("ALL");

  const { data, isLoading, error } = useQuery({
    queryKey: ["result", attemptId],
    queryFn: async () =>
      (await apiGet<ExamResult>(`/exam/${attemptId}/result`)).data,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="space-y-4 py-12 text-center">
          <p className="text-muted-foreground">{getErrorMessage(error)}</p>
          <Link href="/quizzes" className={buttonVariants()}>কুইজে ফিরে যান</Link>
        </CardContent>
      </Card>
    );
  }

  const { attempt, questions } = data;
  const accuracy =
    attempt.questionCount > 0
      ? Math.round((attempt.correctCount / attempt.questionCount) * 100)
      : 0;

  const filtered = questions.filter((q) =>
    filter === "ALL" ? true : statusOf(q) === filter,
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/history"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← পরীক্ষার ইতিহাস
        </Link>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          ফলাফল — {attempt.category.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {DIFFICULTY_LABEL[attempt.difficulty]} • {toBn(attempt.questionCount)}টি
          প্রশ্ন • {formatBnDate(attempt.submittedAt)}
          {attempt.status === "AUTO_SUBMITTED" && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              সময় শেষে অটো-জমা
            </span>
          )}
        </p>
      </div>

      {/* Score summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">অর্জিত পয়েন্ট</p>
              <p className="text-4xl font-bold text-primary">
                {toBn(attempt.totalScore)}
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">অ্যাকুরেসি</span>
                <span className="font-semibold">{toBn(accuracy)}%</span>
              </div>
              <Progress value={accuracy} className="h-2.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="মোট প্রশ্ন" value={toBn(attempt.questionCount)} />
        <StatCard
          label="সঠিক"
          value={toBn(attempt.correctCount)}
          className="border-emerald-200 dark:border-emerald-900"
        />
        <StatCard
          label="ভুল"
          value={toBn(attempt.wrongCount)}
          className="border-rose-200 dark:border-rose-900"
        />
        <StatCard
          label="উত্তর দেননি"
          value={toBn(attempt.unansweredCount)}
        />
      </div>

      {/* Review */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">উত্তরপত্র পর্যালোচনা</h2>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="ALL">সব</TabsTrigger>
              <TabsTrigger value="WRONG">ভুল</TabsTrigger>
              <TabsTrigger value="CORRECT">সঠিক</TabsTrigger>
              <TabsTrigger value="SKIPPED">বাদ</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              এই ফিল্টারে কোনো প্রশ্ন নেই।
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((q) => {
              const status = statusOf(q);
              return (
                <Card
                  key={q.questionId}
                  className={cn(
                    "border-l-4",
                    status === "CORRECT"
                      ? "border-l-emerald-500"
                      : status === "WRONG"
                        ? "border-l-rose-500"
                        : "border-l-muted-foreground/40",
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        প্রশ্ন {toBn(q.order)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          DIFFICULTY_BADGE[q.difficulty],
                        )}
                      >
                        {DIFFICULTY_LABEL[q.difficulty]}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          status === "CORRECT"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : status === "WRONG"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {status === "CORRECT"
                          ? `✓ সঠিক (+${toBn(q.pointsEarned)})`
                          : status === "WRONG"
                            ? "✗ ভুল"
                            : "উত্তর দেননি"}
                      </span>
                      {q.questionType === "MULTIPLE" && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          একাধিক উত্তর
                        </span>
                      )}
                    </div>
                    <CardTitle className="whitespace-pre-wrap text-base font-semibold leading-relaxed">
                      {q.questionText}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {q.options.map((opt) => {
                      const isCorrect = q.correctAnswers.includes(opt.key);
                      const wasPicked = q.selectedAnswers.includes(opt.key);
                      return (
                        <div
                          key={opt.key}
                          className={cn(
                            "rounded-lg border p-3 text-sm leading-relaxed",
                            isCorrect &&
                              "border-emerald-400 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40",
                            !isCorrect &&
                              wasPicked &&
                              "border-rose-400 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <strong className="shrink-0">{opt.key}.</strong>
                            <span className="min-w-0">{opt.text}</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                            {isCorrect && (
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                ✓ সঠিক উত্তর
                              </span>
                            )}
                            {wasPicked && (
                              <span
                                className={cn(
                                  "font-medium",
                                  isCorrect
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : "text-rose-700 dark:text-rose-400",
                                )}
                              >
                                • আপনি এটি বেছেছিলেন
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {q.explanation && (
                      <div className="rounded-lg bg-muted/60 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          ব্যাখ্যা
                        </p>
                        <p className="text-sm leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/quizzes/${slug}`} className={buttonVariants()}>আবার পরীক্ষা দিন</Link>
        <Link href="/leaderboard" className={buttonVariants({ variant: "outline" })}>লিডারবোর্ড দেখুন</Link>
        <Link href="/progress" className={buttonVariants({ variant: "outline" })}>প্রোগ্রেস দেখুন</Link>
      </div>
    </div>
  );
}
