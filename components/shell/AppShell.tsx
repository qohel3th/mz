"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { HtmlAttrs } from "./HtmlAttrs";
import { ReflectionGateBanner } from "@/components/reflections/ReflectionGateBanner";
import { StoreErrorBanner } from "./StoreErrorBanner";

/** Header + bottom nav frame. "/" and "/ranks" render full-bleed without header/nav. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/" || pathname === "/ranks";
  return (
    <>
      <HtmlAttrs />
      <div aria-hidden className="aura aura-arcane" />
      <div aria-hidden className="aura aura-ember" />
      <div aria-hidden className="aura aura-gilded" />
      <StoreErrorBanner />
      {!bare && <AppHeader />}
      {!bare && <ReflectionGateBanner />}
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
