"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api";
import { toBn } from "@/lib/constants";
import type { Category } from "@/lib/types";

export default function QuizzesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await apiGet<Category[]>("/category")).data,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">কুইজ বিষয়সমূহ</h1>
        <p className="mt-1 text-muted-foreground">
          যে বিষয়ে পরীক্ষা দিতে চান সেটি বেছে নিন।
        </p>
      </div>

      <Input
        placeholder="বিষয় খুঁজুন... (যেমন React, SQL)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            কোনো বিষয় পাওয়া যায়নি।
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cat) => (
            <Link key={cat.id} href={`/quizzes/${cat.slug}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold group-hover:text-primary">
                      {cat.name}
                    </h2>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {toBn(cat.question_count)} প্রশ্ন
                    </span>
                  </div>
                  {cat.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {cat.description}
                    </p>
                  )}
                  <p className="mt-4 text-sm font-medium text-primary">
                    পরীক্ষা শুরু করুন →
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
