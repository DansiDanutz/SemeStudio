import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SemeStudio - The YouTube Creator OS",
  description:
    "Research, script, thumbnail, optimize, upload — all in one AI-powered studio. Join 10,000+ creators already growing.",
  openGraph: {
    title: "SemeStudio - Create YouTube Content 10x Faster",
    description:
      "AI-powered YouTube studio for creators. Scripts, thumbnails, SEO, analytics — all in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
