import Link from "next/link";

import { ConsentPreferencesButton } from "@/components/analytics/consent-preferences-button";
import { LogoLockup } from "@/components/marketing/logo-lockup";

type FooterProps = {
  variant?: "light" | "dark";
};

const PRIMARY_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
];

export function Footer({ variant = "light" }: FooterProps) {
  const isDark = variant === "dark";
  const currentYear = new Date().getFullYear();

  if (isDark) {
    return (
      <footer className="w-full border-t border-zinc-800 bg-zinc-900 pb-10 pt-20 dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 lg:px-8 md:flex-row">
          <div className="flex items-center gap-2">
            <LogoLockup mode="dark" textClassName="text-headline-md text-white tracking-tight" />
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-6">
            {PRIMARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium tracking-tight text-zinc-200 transition-colors hover:text-orange-400"
              >
                {item.label}
              </Link>
            ))}
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium tracking-tight text-zinc-400 transition-colors hover:text-orange-400"
              >
                {item.label}
              </Link>
            ))}
            <ConsentPreferencesButton className="text-sm font-medium tracking-tight text-zinc-400 transition-colors hover:text-orange-400" />
          </nav>
          <div className="text-sm tracking-tight text-zinc-300 opacity-95">
            © {currentYear} Techbckp. Build · Automate · Grow.
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
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-400">
            © {currentYear} Techbckp. All rights reserved.
          </p>
        </div>

        <nav aria-label="Site navigation" className="flex flex-wrap justify-center gap-6">
          {PRIMARY_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-zinc-900 transition-colors hover:text-black hover:underline dark:text-zinc-300 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Legal navigation" className="flex flex-wrap justify-center gap-6">
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-700 transition-colors hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <ConsentPreferencesButton className="text-sm font-medium text-zinc-700 transition-colors hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-white" />
        </nav>
      </div>
    </footer>
  );
}
