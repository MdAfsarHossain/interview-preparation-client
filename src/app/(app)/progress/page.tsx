"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/stat-card";
import { apiGet } from "@/lib/api";
import { toBn } from "@/lib/constants";
import type { Progress } from "@/lib/types";

export default function ProgressPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: async () => (await apiGet<Progress>("/progress/me")).data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const overall = data?.overall;
  const hasAttempts = (overall?.total_attempts ?? 0) > 0;

  if (!hasAttempts) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold sm:text-3xl">আপনার প্রোগ্রেস</h1>
        <Card>
          <CardContent className="py-14 text-center">
            <p className="text-muted-foreground">
              এখনো কোনো পরীক্ষা দেননি — প্রোগ্রেস দেখতে অন্তত একটি কুইজ শেষ করুন।
            </p>
            <Link href="/quizzes" className={buttonVariants({ className: "mt-4" })}>কুইজ শুরু করুন</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData =
    data?.scoreTrend?.map((t, i) => ({
      name: toBn(i + 1),
      score: t.total_score,
      accuracy:
        t.question_count > 0
          ? Math.round((t.correct_count / t.question_count) * 100)
          : 0,
      category: t.category_name,
    })) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">আপনার প্রোগ্রেস</h1>
        <p className="mt-1 text-muted-foreground">
          কোথায় ভালো করছেন, কোথায় আরও পড়া দরকার।
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="মোট পরীক্ষা" value={toBn(overall!.total_attempts)} />
        <StatCard
          label="মোট পয়েন্ট"
          value={toBn(overall!.total_points_earned)}
        />
        <StatCard
          label="অ্যাকুরেসি"
          value={`${toBn(overall!.accuracy)}%`}
          hint={`${toBn(overall!.total_correct)}/${toBn(overall!.total_questions_attempted)} সঠিক`}
        />
        <StatCard
          label="উত্তর দেননি"
          value={toBn(overall!.total_unanswered)}
        />
      </div>

      {(data?.strongestCategory || data?.weakestCategory) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data?.strongestCategory && (
            <Card className="border-emerald-200 dark:border-emerald-900">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  💪 সবচেয়ে ভালো বিষয়
                </p>
                <p className="mt-1 text-xl font-bold">
                  {data.strongestCategory.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {toBn(data.strongestCategory.avg_accuracy)}% অ্যাকুরেসি
                </p>
              </CardContent>
            </Card>
          )}
          {data?.weakestCategory && (
            <Card className="border-amber-200 dark:border-amber-900">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  📌 আরও অভ্যাস দরকার
                </p>
                <p className="mt-1 text-xl font-bold">
                  {data.weakestCategory.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {toBn(data.weakestCategory.avg_accuracy)}% অ্যাকুরেসি
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">স্কোর ট্রেন্ড</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--popover-foreground)",
                      fontSize: "0.8rem",
                    }}
                    formatter={(value, key) => [
                      key === "accuracy"
                        ? `${toBn(Number(value))}%`
                        : toBn(Number(value)),
                      key === "accuracy" ? "অ্যাকুরেসি" : "স্কোর",
                    ]}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.category
                        ? `${payload[0].payload.category} (#${label})`
                        : `পরীক্ষা #${label}`
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ background: "var(--chart-1)" }}
                />
                স্কোর
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ background: "var(--chart-3)" }}
                />
                অ্যাকুরেসি (%)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">বিষয়ভিত্তিক ফলাফল</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {data?.categoryBreakdown?.map((cat) => (
            <div key={cat.id}>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link
                  href={`/quizzes/${cat.slug}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {cat.name}
                </Link>
                <span className="text-muted-foreground">
                  {toBn(cat.attempts)}টি পরীক্ষা • {toBn(cat.points)} পয়েন্ট •{" "}
                  <span className="font-medium text-foreground">
                    {toBn(cat.avg_accuracy)}%
                  </span>
                </span>
              </div>
              <ProgressBar value={cat.avg_accuracy} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
