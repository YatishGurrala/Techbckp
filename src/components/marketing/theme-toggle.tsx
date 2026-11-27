"use client";

import { useSyncExternalStore } from "react";

const THEME_CHANGED_EVENT = "techbckp:theme-changed";

function subscribeTheme(callback: () => void) {
  window.addEventListener(THEME_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot(): boolean {
  return false;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT));
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-md text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      <span className="material-symbols-outlined" aria-hidden style={{ fontSize: 20 }}>
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
