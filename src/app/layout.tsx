import type { Metadata, Viewport } from "next";
import { Toaster } from '@/components/ui/sonner';
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { getSafeSession } from '@/lib/session';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Premier League Predictions",
  description: "Premier League Predictions",
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png' }
    ],
    other: [
      { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
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
  // Use cached session to prevent memory leaks
  const session = await getSafeSession();

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
