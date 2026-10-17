"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ExamRunner from "./exam-runner";
import { apiGet, getErrorMessage } from "@/lib/api";
import type { StartExamResponse } from "@/lib/types";

export default function ExamPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const { slug, attemptId } = use(params);

  // Fetched from the server (not passed through navigation state) so a refresh
  // resumes the same attempt with the same server-side deadline.
  const { data, isLoading, error } = useQuery({
    queryKey: ["exam", attemptId],
    queryFn: async () =>
      (await apiGet<StartExamResponse>(`/exam/${attemptId}`)).data,
    retry: false,
    refetchOnMount: "always",
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    // A 409 means it's already submitted — send them to the result instead.
    const alreadySubmitted =
      axios.isAxiosError(error) && error.response?.status === 409;

    return (
      <Card>
        <CardContent className="space-y-4 py-12 text-center">
          <p className="text-muted-foreground">
            {alreadySubmitted
              ? "এই পরীক্ষাটি ইতিমধ্যে জমা দেওয়া হয়েছে।"
              : getErrorMessage(error)}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {alreadySubmitted && (
              <Link href={`/quizzes/${slug}/result/${attemptId}`} className={buttonVariants()}>
                  ফলাফল দেখুন
                </Link>
            )}
            <Link href={`/quizzes/${slug}`} className={buttonVariants({ variant: "outline" })}>নতুন পরীক্ষা শুরু করুন</Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <ExamRunner exam={data} />;
}
