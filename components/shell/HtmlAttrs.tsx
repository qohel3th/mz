"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useActiveWarrior } from "@/lib/store";

/**
 * Syncs <html data-theme> from the store.
 * Theme = the active warrior's theme (which follows their active Ideal Self).
 *
 * The UI chrome is English-only: <html> is pinned to lang="en" dir="ltr".
 * Hebrew user content still aligns correctly because every user-authored
 * render site uses <UserText>/<TextField>/<TextArea> (dir="auto" + plaintext).
 */
export function HtmlAttrs() {
  const warrior = useActiveWarrior();
  const theme = warrior?.theme ?? "arcane";
  const pathname = usePathname();

  useEffect(() => {
    const el = document.documentElement;
    el.lang = "en";
    el.dir = "ltr";
  }, []);

  /* re-applied on every route change so the landing page's swipe preview never leaks */
  useEffect(() => {
    if (pathname === "/") return; // the carousel previews the focused warrior's theme there
    document.documentElement.dataset.theme = theme;
  }, [theme, pathname]);

  return null;
}
