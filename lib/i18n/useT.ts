"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/store";
import { dirFor, makeT, type TFunction } from "./index";
import type { Locale } from "@/lib/domain/types";

/** `const { t, locale, dir } = useT();` */
export function useT(): { t: TFunction; locale: Locale; dir: "ltr" | "rtl"; setLocale: (l: Locale) => Promise<void> } {
  const { locale, setLocale } = useLocale();
  const t = useMemo(() => makeT(locale), [locale]);
  return { t, locale, dir: dirFor(locale), setLocale };
}
