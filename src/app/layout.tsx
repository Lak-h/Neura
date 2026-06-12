import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Neuraxis — The AI Operating System for Modern Businesses",
    template: "%s · Neuraxis",
  },
  description:
    "Neuraxis gives your business a complete AI operations brain: agents, workflows, knowledge, and a shared AI inbox — in one platform.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Neuraxis — The AI Operating System for Modern Businesses",
    description:
      "Agents, workflows, knowledge, and a shared AI inbox — one platform, owned by your company.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
