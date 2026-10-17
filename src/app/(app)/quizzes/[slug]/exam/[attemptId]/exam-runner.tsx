"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiPost, getErrorMessage } from "@/lib/api";
import {
  DIFFICULTY_BADGE,
  DIFFICULTY_LABEL,
  formatClock,
  toBn,
} from "@/lib/constants";
import type { StartExamResponse, SubmitExamResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

type Answers = Record<string, string[]>;

export default function ExamRunner({ exam }: { exam: StartExamResponse }) {
  const router = useRouter();

  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(
      exam.questions.map((q) => [q.questionId, q.selectedAnswers ?? []]),
    ),
  );
  const [index, setIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // The deadline comes from the server so a client clock skew (or a page
  // refresh) can't buy the user extra time.
  const expiresAtMs = useMemo(
    () => new Date(exam.expiresAt).getTime(),
    [exam.expiresAt],
  );
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.round((expiresAtMs - Date.now()) / 1000)),
  );

  const submittedRef = useRef(false);
  const current = exam.questions[index];
  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;

  const submitExam = useMutation({
    mutationFn: async (isAutoSubmit: boolean) => {
      const res = await apiPost<SubmitExamResponse>(
        `/exam/${exam.attemptId}/submit`,
        {
          answers: exam.questions.map((q) => ({
            questionId: q.questionId,
            selectedAnswers: answers[q.questionId] ?? [],
          })),
          isAutoSubmit,
        },
      );
      return res.data;
    },
    onSuccess: (_data, isAutoSubmit) => {
      toast[isAutoSubmit ? "warning" : "success"](
        isAutoSubmit
          ? "সময় শেষ! খাতা স্বয়ংক্রিয়ভাবে জমা হয়েছে।"
          : "খাতা জমা হয়েছে!",
      );
      router.replace(
        `/quizzes/${exam.category.slug}/result/${exam.attemptId}`,
      );
    },
    onError: (error) => {
      submittedRef.current = false;
      toast.error(getErrorMessage(error));
    },
  });

  const doSubmit = useCallback(
    (isAutoSubmit: boolean) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      submitExam.mutate(isAutoSubmit);
    },
    [submitExam],
  );

  // Tick the countdown off the server deadline and auto-submit at zero.
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((expiresAtMs - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
      if (remaining <= 0) doSubmit(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAtMs, doSubmit]);

  // Warn before an accidental tab close / reload mid-exam.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const timeUp = secondsLeft <= 0;
  const locked = timeUp || submitExam.isPending;

  const setSingle = (questionId: string, key: string) => {
    if (locked) return;
    setAnswers((prev) => ({ ...prev, [questionId]: [key] }));
  };

  const toggleMulti = (questionId: string, key: string) => {
    if (locked) return;
    setAnswers((prev) => {
      const existing = prev[questionId] ?? [];
      const next = existing.includes(key)
        ? existing.filter((k) => k !== key)
        : [...existing, key];
      return { ...prev, [questionId]: next };
    });
  };

  const clearAnswer = (questionId: string) => {
    if (locked) return;
    setAnswers((prev) => ({ ...prev, [questionId]: [] }));
  };

  const selected = answers[current.questionId] ?? [];
  const isLast = index === exam.questions.length - 1;

  return (
    <div className="space-y-5">
      {/* Sticky timer + progress bar */}
      <div className="sticky top-16 z-30 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{exam.category.name}</p>
            <p className="text-xs text-muted-foreground">
              প্রশ্ন {toBn(index + 1)} / {toBn(exam.questions.length)} • উত্তর দিয়েছেন{" "}
              {toBn(answeredCount)}টি
            </p>
          </div>
          <div
            className={cn(
              "rounded-lg px-3 py-1.5 font-mono text-lg font-bold tabular-nums",
              secondsLeft <= 60
                ? "bg-destructive/10 text-destructive"
                : secondsLeft <= 180
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-muted",
            )}
            aria-live="polite"
          >
            {formatClock(secondsLeft)}
          </div>
        </div>
        <Progress
          value={((index + 1) / exam.questions.length) * 100}
          className="mt-3 h-1.5"
        />
      </div>

      {timeUp && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-center text-sm text-destructive">
            সময় শেষ — খাতা জমা দেওয়া হচ্ছে...
          </CardContent>
        </Card>
      )}

      {/* Question */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                DIFFICULTY_BADGE[current.difficulty],
              )}
            >
              {DIFFICULTY_LABEL[current.difficulty]}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {current.questionType === "MULTIPLE"
                ? "একাধিক উত্তর বাছাই করা যাবে"
                : "একটি উত্তর বাছুন"}
            </span>
          </div>

          <h2 className="whitespace-pre-wrap text-lg font-semibold leading-relaxed">
            {current.questionText}
          </h2>

          {current.questionType === "SINGLE" ? (
            <RadioGroup
              value={selected[0] ?? ""}
              onValueChange={(v) => setSingle(current.questionId, v)}
              className="space-y-3"
              disabled={locked}
            >
              {current.options.map((opt) => (
                <label
                  key={opt.key}
                  htmlFor={`${current.questionId}-${opt.key}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                    "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5",
                    locked && "cursor-not-allowed opacity-70",
                  )}
                >
                  <RadioGroupItem
                    value={opt.key}
                    id={`${current.questionId}-${opt.key}`}
                    className="mt-0.5"
                  />
                  <span className="min-w-0 text-sm leading-relaxed">
                    <strong className="mr-1.5">{opt.key}.</strong>
                    {opt.text}
                  </span>
                </label>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {current.options.map((opt) => {
                const checked = selected.includes(opt.key);
                return (
                  <label
                    key={opt.key}
                    htmlFor={`${current.questionId}-${opt.key}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                      checked && "border-primary bg-primary/5",
                      locked && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <Checkbox
                      id={`${current.questionId}-${opt.key}`}
                      checked={checked}
                      disabled={locked}
                      onCheckedChange={() =>
                        toggleMulti(current.questionId, opt.key)
                      }
                      className="mt-0.5"
                    />
                    <span className="min-w-0 text-sm leading-relaxed">
                      <strong className="mr-1.5">{opt.key}.</strong>
                      {opt.text}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {selected.length > 0 && !locked && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearAnswer(current.questionId)}
            >
              উত্তর মুছে ফেলুন
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || locked}
        >
          ← পূর্ববর্তী
        </Button>

        {isLast ? (
          <Button onClick={() => setConfirmOpen(true)} disabled={locked}>
            খাতা জমা দিন
          </Button>
        ) : (
          <Button
            onClick={() =>
              setIndex((i) => Math.min(exam.questions.length - 1, i + 1))
            }
            disabled={locked}
          >
            পরবর্তী →
          </Button>
        )}
      </div>

      {/* Question palette */}
      <Card>
        <CardContent className="pt-6">
          <p className="mb-3 text-sm font-medium">প্রশ্নের তালিকা</p>
          <div className="flex flex-wrap gap-2">
            {exam.questions.map((q, i) => {
              const done = (answers[q.questionId] ?? []).length > 0;
              return (
                <button
                  key={q.questionId}
                  type="button"
                  onClick={() => setIndex(i)}
                  disabled={locked}
                  aria-current={i === index}
                  className={cn(
                    "size-9 rounded-md border text-sm font-medium transition-colors disabled:opacity-60",
                    i === index && "ring-2 ring-primary ring-offset-1",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  {toBn(i + 1)}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            রঙিন বক্সগুলো উত্তর দেওয়া প্রশ্ন।
          </p>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>খাতা জমা দেবেন?</DialogTitle>
            <DialogDescription>
              {answeredCount < exam.questions.length
                ? `আপনি ${toBn(exam.questions.length - answeredCount)}টি প্রশ্নের উত্তর দেননি। জমা দিলে আর পরিবর্তন করা যাবে না।`
                : "সব প্রশ্নের উত্তর দেওয়া হয়েছে। জমা দিলে আর পরিবর্তন করা যাবে না।"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              ফিরে যান
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                doSubmit(false);
              }}
              disabled={submitExam.isPending}
            >
              {submitExam.isPending ? "জমা হচ্ছে..." : "হ্যাঁ, জমা দিন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
