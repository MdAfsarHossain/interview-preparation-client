import type { Metadata } from "next";
import { Noto_Sans_Bengali, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

// All quiz content is Bangla, so the Bengali face is the primary sans font.
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ইন্টারভিউ প্রস্তুতি | Software Engineering Interview Prep",
  description:
    "বাংলায় সফটওয়্যার ইঞ্জিনিয়ারিং ইন্টারভিউ প্রস্তুতির কুইজ প্ল্যাটফর্ম — HTML, CSS, JavaScript, React, Node.js, SQL, System Design সহ ২০+ বিষয়ে সময়সীমাবদ্ধ পরীক্ষা, লিডারবোর্ড ও প্রোগ্রেস ট্র্যাকিং।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      data-scroll-behavior="smooth"
      className={`${notoBengali.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
