import Link from "next/link";

import { LogoLockup } from "@/components/marketing/logo-lockup";

type FooterProps = {
  variant?: "light" | "dark";
};

export function Footer({ variant = "light" }: FooterProps) {
  const isDark = variant === "dark";

  if (isDark) {
    return (
      <footer className="w-full border-t border-zinc-800 bg-zinc-900 pb-10 pt-20 dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 lg:px-8 md:flex-row">
          <div className="flex items-center gap-2">
            <LogoLockup mode="dark" textClassName="text-headline-md text-white tracking-tight" />
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/services" className="text-sm font-medium tracking-tight text-zinc-200 transition-colors hover:text-orange-400">
              Services
            </Link>
            <Link href="/blog" className="text-sm font-medium tracking-tight text-zinc-200 transition-colors hover:text-orange-400">
              Insights
            </Link>
            <Link href="/contact" className="text-sm font-medium tracking-tight text-zinc-200 transition-colors hover:text-orange-400">
              Contact
            </Link>
            <Link href="/privacy-policy" className="text-sm font-medium tracking-tight text-zinc-200 transition-colors hover:text-orange-400">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="text-sm font-medium tracking-tight text-zinc-200 transition-colors hover:text-orange-400">
              Terms
            </Link>
          </div>
          <div className="text-sm tracking-tight text-zinc-300 opacity-95">
            © 2024 Techbckp. The Execution Partner for Founders.
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 lg:px-8 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <LogoLockup mode="auto" />
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-400">© 2024 Techbckp. All rights reserved.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          <Link href="/privacy-policy" className="text-sm font-semibold text-zinc-900 transition-colors hover:text-black hover:underline dark:text-zinc-300 dark:hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-sm font-semibold text-zinc-900 transition-colors hover:text-black hover:underline dark:text-zinc-300 dark:hover:text-white">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-zinc-900 transition-colors hover:text-black hover:underline dark:text-zinc-300 dark:hover:text-white">
            Contact
          </Link>
        </div>

        <div className="flex gap-8">
          <Link href="/services" className="text-sm font-semibold text-zinc-900 transition-colors hover:text-black hover:underline dark:text-zinc-300 dark:hover:text-white">
            Services
          </Link>
          <Link href="/blog" className="text-sm font-semibold text-zinc-900 transition-colors hover:text-black hover:underline dark:text-zinc-300 dark:hover:text-white">
            Blog
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-zinc-900 transition-colors hover:text-black hover:underline dark:text-zinc-300 dark:hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
