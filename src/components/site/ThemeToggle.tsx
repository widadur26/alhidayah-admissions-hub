import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

const THEME_KEY = "theme";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // localStorage bisa gagal (private mode) — mode tetap berlaku untuk sesi ini.
  }
}

/**
 * Tombol mode terang/gelap. Markup tidak tergantung tema saat ini (ikon
 * ditukar lewat class dark:), jadi aman dari hydration mismatch SSR dan
 * tidak perlu state React — tema sudah diset skrip init di __root.tsx.
 */
export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => applyTheme(!document.documentElement.classList.contains("dark"))}
      aria-label="Ganti mode terang/gelap"
      title="Ganti mode terang/gelap"
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-nav-foreground ring-1 ring-nav-foreground/20 transition-colors hover:bg-nav-foreground/10",
        className,
      )}
    >
      <Moon className="h-5 w-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
    </button>
  );
}
