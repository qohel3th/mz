"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { HtmlAttrs } from "./HtmlAttrs";

/** Header + bottom nav frame. The landing route ("/") renders full-bleed without nav. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/";
  return (
    <>
      <HtmlAttrs />
      {!bare && <AppHeader />}
      <main
        className={
          bare
            ? "relative z-10 min-h-dvh"
            : "relative z-10 mx-auto w-full max-w-md px-4 pb-[calc(5rem+var(--safe-bottom))] pt-4"
        }
      >
        {children}
      </main>
      {!bare && <BottomNav />}
    </>
  );
}
