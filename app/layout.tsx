import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quizora — Learn. Play. Compete.",
  description: "Production Multi-Tenant Real-Time Quiz & Classroom Competition Platform for Parents, Teachers, and Schools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
