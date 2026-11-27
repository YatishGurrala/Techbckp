"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { LogoLockup } from "@/components/marketing/logo-lockup";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { navItems } from "@/lib/site-data";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const topNavItems = navItems.filter((item) =>
    ["/services", "/process", "/pricing", "/blog", "/about"].includes(item.href),
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-300 bg-white/95 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-none">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-all hover:opacity-80 active:scale-95">
          <LogoLockup mode="auto" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {topNavItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "border-b-2 border-orange-500 pb-1 text-sm font-bold text-orange-500"
                    : "text-sm font-bold text-zinc-950 transition-colors hover:text-black dark:text-zinc-100 dark:hover:text-white"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <TrackedLink
            href="/contact?source=navbar"
            eventName="cta_click"
            eventParams={{ location: "navbar_desktop" }}
            className="hidden rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container shadow-sm transition-all hover:opacity-90 active:scale-95 md:inline-flex"
          >
            Discuss Your Project
          </TrackedLink>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-400 text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800 md:hidden"
          >
            <span className="material-symbols-outlined" aria-hidden>
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        className={[
          "border-t border-zinc-200 dark:border-zinc-800 md:hidden",
          "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4 lg:px-8">
          {topNavItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-md bg-orange-50 px-3 py-3 text-base font-semibold text-orange-500 dark:bg-zinc-800"
                    : "rounded-md px-3 py-3 text-base font-semibold text-zinc-950 transition-colors hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800"
                }
              >
                {item.label}
              </Link>
            );
          })}

          <TrackedLink
            href="/contact?source=navbar_mobile"
            eventName="cta_click"
            eventParams={{ location: "navbar_mobile" }}
            onClick={() => setOpen(false)}
            className="mt-2 rounded-lg bg-primary-container px-4 py-3 text-center text-base font-semibold text-on-primary-container shadow-sm transition-all hover:opacity-90"
          >
            Discuss Your Project
          </TrackedLink>
        </div>
      </div>
    </header>
  );
}
