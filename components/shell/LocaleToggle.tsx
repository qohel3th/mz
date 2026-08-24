"use client";

import { useT } from "@/lib/i18n/useT";
import { cn } from "@/components/ui";

export function LocaleToggle({ className }: { className?: string }) {
  const { t, locale, setLocale } = useT();
  const next = locale === "en" ? "he" : "en";
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={t("locale.toggleTo", { lang: t(`locale.${next}`) })}
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-full border border-border-strong bg-panel px-3 text-xs font-semibold tracking-wider text-gold hover:bg-panel-strong",
        className,
      )}
    >
      <span className={cn(locale === "en" ? "text-fg" : "text-fg-faint")}>EN</span>
      <span className="text-fg-faint">/</span>
      <span className={cn(locale === "he" ? "text-fg" : "text-fg-faint")} lang="he">
        עב
      </span>
    </button>
  );
}
