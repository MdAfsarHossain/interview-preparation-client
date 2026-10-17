"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import {
  DIFFICULTY_LABEL,
  DIFFICULTY_POINTS,
  QUESTION_COUNT_OPTIONS,
  toBn,
} from "@/lib/constants";
import type {
  CategoryDetail,
  Difficulty,
  StartExamResponse,
} from "@/lib/types";

type DifficultyChoice = Difficulty | "MIXED";

export default function QuizSetupPage({
  params,
}: {
  // Next.js 16: route params arrive as a Promise.
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<DifficultyChoice>("MIXED");
  const [questionCount, setQuestionCount] = useState<number>(10);

  const categoryQuery = useQuery({
    queryKey: ["category", slug],
    queryFn: async () =>
      (await apiGet<CategoryDetail>(`/category/${slug}`)).data,
  });

  const category = categoryQuery.data;

  const breakdown = new Map<string, number>(
    category?.difficultyBreakdown?.map((d) => [d.difficulty, d.count]) ?? [],
  );
  const totalAvailable = Array.from(breakdown.values()).reduce(
    (a, b) => a + b,
    0,
  );

  // Mixed exams split the count across all three levels, so each bucket needs
  // enough questions on its own.
  const availableForChoice =
    difficulty === "MIXED"
      ? Math.min(
          ...(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map(
            (d) => (breakdown.get(d) ?? 0) * 3,
          ),
        )
      : (breakdown.get(difficulty) ?? 0);

  const notEnough = !categoryQuery.isLoading && availableForChoice < questionCount;

  const startExam = useMutation({
    mutationFn: async () => {
      const res = await apiPost<StartExamResponse>("/exam/start", {
        categoryId: category!.id,
        questionCount,
        ...(difficulty !== "MIXED" ? { difficulty } : {}),
      });
      return res.data;
    },
    onSuccess: (data) => {
      router.push(`/quizzes/${slug}/exam/${data.attemptId}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (categoryQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (categoryQuery.isError || !category) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">এই বিষয়টি পাওয়া যায়নি।</p>
          <Link href="/quizzes" className={buttonVariants({ className: "mt-4" })}>সব বিষয় দেখুন</Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/quizzes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← সব বিষয়
        </Link>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{category.name}</h1>
        {category.description && (
          <p className="mt-1 text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          মোট {toBn(totalAvailable)}টি প্রশ্ন উপলব্ধ —{" "}
          {(["EASY", "MEDIUM", "HARD"] as Difficulty[])
            .map((d) => `${DIFFICULTY_LABEL[d]} ${toBn(breakdown.get(d) ?? 0)}`)
            .join(", ")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>পরীক্ষার সেটিংস</CardTitle>
          <CardDescription>
            কঠিনতা ও প্রশ্নসংখ্যা বেছে নিন। প্রতি প্রশ্নের জন্য ১ মিনিট সময় পাবেন।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Label className="text-base">কঠিনতার স্তর</Label>
            <RadioGroup
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as DifficultyChoice)}
              className="grid gap-3 sm:grid-cols-2"
            >
              {(["MIXED", "EASY", "MEDIUM", "HARD"] as DifficultyChoice[]).map(
                (level) => (
                  <label
                    key={level}
                    htmlFor={`diff-${level}`}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value={level} id={`diff-${level}`} />
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {DIFFICULTY_LABEL[level]}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {level === "MIXED"
                          ? "তিন স্তরের প্রশ্ন সমানভাগে মিশিয়ে"
                          : `প্রতি সঠিক উত্তরে ${toBn(DIFFICULTY_POINTS[level])} পয়েন্ট`}
                      </span>
                    </span>
                  </label>
                ),
              )}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base">প্রশ্নসংখ্যা</Label>
            <RadioGroup
              value={String(questionCount)}
              onValueChange={(v) => setQuestionCount(Number(v))}
              className="grid gap-3 sm:grid-cols-3"
            >
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <label
                  key={count}
                  htmlFor={`count-${count}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value={String(count)} id={`count-${count}`} />
                  <span>
                    <span className="block font-medium">
                      {toBn(count)}টি প্রশ্ন
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {toBn(count)} মিনিট
                    </span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <Alert>
            <AlertDescription>
              ⏱️ সময় শেষ হলে আপনার খাতা স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে। পরীক্ষা
              শুরু হলে টাইমার থামানো যাবে না।
            </AlertDescription>
          </Alert>

          {notEnough && (
            <Alert variant="destructive">
              <AlertDescription>
                এই সেটিংসে যথেষ্ট প্রশ্ন নেই। কম প্রশ্নসংখ্যা বা অন্য কঠিনতা বেছে নিন।
              </AlertDescription>
            </Alert>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={startExam.isPending || notEnough}
            onClick={() => startExam.mutate()}
          >
            {startExam.isPending
              ? "শুরু হচ্ছে..."
              : `পরীক্ষা শুরু করুন (${toBn(questionCount)} মিনিট)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
