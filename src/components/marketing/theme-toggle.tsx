"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  // Start with null to avoid hydration mismatch — render nothing until mounted
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Read actual state from DOM on first mount
    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  // Render an invisible placeholder on the server / before hydration
  // so the DOM tree shape matches and React doesn't warn
  if (isDark === null) {
    return <div className="h-10 w-10" aria-hidden />;
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      <span className="material-symbols-outlined" aria-hidden style={{ fontSize: 20 }}>
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
