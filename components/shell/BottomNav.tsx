"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/components/ui";
import { DashboardIcon, IdentityIcon, JournalIcon, MapIcon, ReflectionIcon } from "./NavIcons";
import type { ComponentType, SVGProps } from "react";

const ITEMS: Array<{ href: string; key: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }> = [
  { href: "/identity", key: "nav.onboarding", Icon: IdentityIcon },
  { href: "/map", key: "nav.map", Icon: MapIcon },
  { href: "/dashboard", key: "nav.dashboard", Icon: DashboardIcon },
  { href: "/journal", key: "nav.journal", Icon: JournalIcon },
  { href: "/reflections", key: "nav.reflections", Icon: ReflectionIcon },
];

export function BottomNav() {
  const { t } = useT();
  const pathname = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/85 backdrop-blur-md">
      <ul className="mx-auto flex h-16 w-full max-w-md items-stretch">
        {ITEMS.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 text-[11px] tracking-wide transition",
                  active ? "text-accent-2" : "text-fg-muted hover:text-fg",
                )}
                aria-current={active ? "page" : undefined}
              >
                <it.Icon className={cn("h-[22px] w-[22px]", active && "drop-shadow-[0_0_8px_var(--accent)]")} />
                <span>{t(it.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
