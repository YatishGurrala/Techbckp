import type { Metadata } from "next";
import { getBuildstackConfig } from "@/lib/buildstack/env";
import Script from "next/script";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <Script src="https://dev.citegpt.xyz/embed.js" data-token="cmsxoq8yo000104jytrjbi34b" strategy="afterInteractive" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #citegpt-widget-container {
                position: fixed !important;
                right: 20px !important;
                bottom: 20px !important;
                left: auto !important;
                top: auto !important;
                display: flex !important;
                justify-content: flex-end !important;
                align-items: flex-end !important;
                z-index: 2147483647 !important;
                max-width: calc(100vw - 24px) !important;
                max-height: calc(100vh - 24px) !important;
              }

              #citegpt-widget-container iframe {
                display: block !important;
                position: static !important;
                right: auto !important;
                bottom: auto !important;
                border: 0 !important;
                pointer-events: auto !important;
              }
            `,
          }}
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
