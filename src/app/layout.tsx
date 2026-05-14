import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getBuildstackConfig } from "@/lib/buildstack/env";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Techbckp | Execution Partner for Founders & Niche Businesses",
  description:
    "Techbckp helps founders, coaches, creators, and niche businesses launch apps, automation, websites, and content systems without hiring a tech team.",
  icons: {
    icon: [
      { url: "/bkp_Orange.png", sizes: "32x32", type: "image/png" },
      { url: "/bkp_Orange.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: [{ url: "/bkp_Orange.png", type: "image/png" }],
    apple: "/bkp_Orange.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Validate CMS integration env vars early so misconfiguration fails fast.
  getBuildstackConfig();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* Theme init: runs synchronously before the page renders to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',t?t==='dark':d);}catch(_){}})();`,
          }}
        />
      </head>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
