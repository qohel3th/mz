"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/store";
import { makeT, type TFunction } from "./index";
import type { Locale } from "@/lib/domain/types";

/** The UI chrome is English-only, regardless of any persisted AppSettings.locale. */
const CHROME_LOCALE: Locale = "en";

/**
 * `const { t, locale, dir, setLocale } = useT();`
 * `t` always resolves English chrome strings; `dir` is always "ltr".
 * User-authored content stays Hebrew-capable via <UserText> (dir="auto").
 * `setLocale` still persists AppSettings.locale for content-direction purposes.
 */
export function useT(): { t: TFunction; locale: Locale; dir: "ltr" | "rtl"; setLocale: (l: Locale) => Promise<void> } {
  const { setLocale } = useLocale();
  const t = useMemo(() => makeT(CHROME_LOCALE), []);
  return { t, locale: CHROME_LOCALE, dir: "ltr", setLocale };
}
