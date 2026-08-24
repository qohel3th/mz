"use client";

import { useEffect } from "react";
import { useActiveWarrior, useLocale } from "@/lib/store";
import { dirFor } from "@/lib/i18n";

/**
 * Syncs <html lang dir data-theme> from the store.
 * Theme = the active warrior's theme (which follows their active Ideal Self).
 */
export function HtmlAttrs() {
  const { locale } = useLocale();
  const warrior = useActiveWarrior();
  const theme = warrior?.theme ?? "arcane";

  useEffect(() => {
    const el = document.documentElement;
    el.lang = locale;
    el.dir = dirFor(locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}
