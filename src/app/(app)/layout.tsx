import SiteHeader from "@/components/site-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="mx-auto w-full max-w-6xl px-4 text-center text-xs text-muted-foreground">
          ইন্টারভিউ প্রস্তুতি
        </div>
      </footer>
    </div>
  );
}
