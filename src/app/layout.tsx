import type { Metadata, Viewport } from "next";
import { Toaster } from '@/components/ui/sonner';
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { getSession } from '@/lib/session';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Premier League Predictions",
  description: "Premier League Predictions",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header session={session} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
