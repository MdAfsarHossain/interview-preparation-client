import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toBn } from "@/lib/constants";

const TOPICS = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Tailwind CSS",
  "Next.js", "Node.js", "Express.js", "NestJS", "SQL", "MySQL",
  "PostgreSQL", "MongoDB", "Mongoose", "OOP", "Data Structure",
  "Algorithm", "System Design", "DevOps", "AWS", "VPS", "Hosting", "Deployment",
];

const FEATURES = [
  {
    icon: "⏱️",
    title: "সময়সীমাবদ্ধ পরীক্ষা",
    body: "প্রতি প্রশ্নে ১ মিনিট। ১০, ২০ বা ৩০ প্রশ্ন বেছে নিন — সময় শেষ হলে খাতা স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে, ঠিক আসল ইন্টারভিউয়ের চাপের মতো।",
  },
  {
    icon: "🎯",
    title: "তিন স্তরের কঠিনতা",
    body: "সহজ, মধ্যম ও কঠিন — নিজের পছন্দমতো লেভেল বাছুন, অথবা কিছু না বাছলে তিন লেভেল মিশিয়ে পরীক্ষা দিন।",
  },
  {
    icon: "📖",
    title: "বিস্তারিত ব্যাখ্যা",
    body: "প্রতিটি অপশনই বিস্তারিত — শুধু এক শব্দের উত্তর নয়। পরীক্ষা শেষে কোনটা ভুল, কোনটা ঠিক আর কেন, সব বাংলায় ব্যাখ্যা করা থাকে।",
  },
  {
    icon: "🏆",
    title: "পয়েন্ট ও লিডারবোর্ড",
    body: "সহজ প্রশ্নে ৫, মধ্যমে ১০, কঠিনে ১৫ পয়েন্ট। গ্লোবাল ও বিষয়ভিত্তিক লিডারবোর্ডে নিজের অবস্থান দেখুন।",
  },
  {
    icon: "📈",
    title: "প্রোগ্রেস ট্র্যাকিং",
    body: "কোন বিষয়ে ভালো করছেন, কোথায় দুর্বল — অ্যাকুরেসি, স্কোর ট্রেন্ড আর বিষয়ভিত্তিক বিশ্লেষণ এক জায়গায়।",
  },
  {
    icon: "🔁",
    title: "প্রশ্ন ব্যাংক",
    body: "প্রতি বিষয়ে ১০০+ প্রশ্ন, প্রতিবার এলোমেলোভাবে বাছাই — একই পরীক্ষা দুবার পড়বে না।",
  },
];

const STEPS = [
  { n: 1, title: "অ্যাকাউন্ট খুলুন", body: "ইমেইল দিয়ে বিনামূল্যে রেজিস্টার করুন।" },
  { n: 2, title: "বিষয় বাছুন", body: "২৪টি বিষয়ের যেকোনোটি, সাথে কঠিনতা ও প্রশ্নসংখ্যা।" },
  { n: 3, title: "পরীক্ষা দিন", body: "ঘড়ি ধরে উত্তর করুন, সময় শেষে অটো-সাবমিট।" },
  { n: 4, title: "ফলাফল দেখুন", body: "ভুল-শুদ্ধ, ব্যাখ্যা, পয়েন্ট আর লিডারবোর্ড র‍্যাঙ্ক।" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
              ইঃ
            </span>
            <span className="font-semibold">ইন্টারভিউ প্রস্তুতি</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>লগ ইন</Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>শুরু করুন</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 text-center sm:py-24">
            <p className="mx-auto mb-4 inline-flex rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
              ২৪টি বিষয় • {toBn(2400)}+ প্রশ্ন • সবকিছু বাংলায়
            </p>
            <h1 className="mx-auto max-w-3xl text-balance text-3xl font-bold leading-tight sm:text-5xl">
              সফটওয়্যার ইঞ্জিনিয়ারিং ইন্টারভিউয়ের প্রস্তুতি নিন{" "}
              <span className="text-primary">বাংলায়</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              সময় ধরে পরীক্ষা দিন, বিস্তারিত ব্যাখ্যা সহ ভুল-শুদ্ধ দেখুন, পয়েন্ট জিতে
              লিডারবোর্ডে উঠুন — আর নিজের দুর্বল জায়গাগুলো খুঁজে বের করুন।
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}>বিনামূল্যে শুরু করুন</Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto" })}>আমার অ্যাকাউন্ট আছে</Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              কুইজ, লিডারবোর্ড ও প্রোগ্রেস দেখতে লগ ইন করা প্রয়োজন।
            </p>
          </div>
        </section>

        <section className="border-b py-14 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">
              যেসব বিষয়ে পরীক্ষা দিতে পারবেন
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              ফ্রন্টএন্ড থেকে ব্যাকএন্ড, ডেটাবেজ থেকে সিস্টেম ডিজাইন ও ডিপ্লয়মেন্ট।
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {TOPICS.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b bg-muted/40 py-14 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">
              কী কী সুবিধা পাচ্ছেন
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title} className="h-full">
                  <CardContent className="pt-6">
                    <div className="mb-3 text-3xl" aria-hidden>
                      {f.icon}
                    </div>
                    <h3 className="mb-2 font-semibold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b py-14 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">
              কীভাবে কাজ করে
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="text-center sm:text-left">
                  <div className="mx-auto mb-4 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold sm:mx-0">
                    {toBn(s.n)}
                  </div>
                  <h3 className="mb-1.5 font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto w-full max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              আজই প্রস্তুতি শুরু করুন
            </h2>
            <p className="mt-3 text-muted-foreground">
              পরের ইন্টারভিউয়ে যে প্রশ্নগুলো আসবে, সেগুলোর উত্তর আগেই জেনে নিন।
            </p>
            <Link href="/register" className={buttonVariants({ size: "lg", className: "mt-7 w-full sm:w-auto" })}>ফ্রি অ্যাকাউন্ট খুলুন</Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto w-full max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>
            ইন্টারভিউ প্রস্তুতি — বাংলায় সফটওয়্যার ইঞ্জিনিয়ারিং ইন্টারভিউ প্রস্তুতির
            প্ল্যাটফর্ম
          </p>
        </div>
      </footer>
    </div>
  );
}
