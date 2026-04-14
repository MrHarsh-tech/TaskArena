import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "TaskArena — Learn Through Challenges",
  description:
    "An educational platform where instructors create learning challenges and students sharpen their skills through MCQs, quizzes, and more.",
  keywords: ["education", "quiz", "MCQ", "challenges", "learning platform"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-surface-200 py-6 text-center text-sm text-surface-500">
            <p>© 2026 TaskArena. Built for learning.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
