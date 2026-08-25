"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { ThemeId } from "@/lib/domain/types";
import { useHydrated, useStore, useWarriors } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { MAX_LEVEL, XP_CURVE, levelFor } from "@/lib/game/progression";
import { RANK_TITLES } from "@/lib/game/ranks";
import { UserText, cn } from "@/components/ui";

const FAMILY_COLOR: Record<ThemeId, string> = {
  ember: "var(--red-2)",
  arcane: "var(--purple-2)",
  gilded: "var(--gold-2)",
};

/** Per-row stagger for the entrance animation (ms). */
const STAGGER_MS = 28;
/** Duration of the glide down to your rank (ms). */
const GLIDE_MS = 2600;

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Slow, eased window scroll that centres `el`. Returns a cancel function. */
function glideTo(el: HTMLElement, duration: number): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startY = window.scrollY;
  const rect = el.getBoundingClientRect();
  const targetY = startY + rect.top - (window.innerHeight - rect.height) / 2;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(maxY, targetY));
  if (reduce) {
    window.scrollTo(0, endY);
    return () => {};
  }
  let raf = 0;
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, startY + (endY - startY) * easeInOutCubic(p));
    if (p < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

/**
 * Standalone Ranks screen: a vertical ladder of all 33 levels with every
 * warrior's current position. Rows rise in one after another, then the
 * ladder scrolls to the active warrior's current rank.
 */
export function RanksLadder() {
  const { t } = useT();
  const hydrated = useHydrated();
  const warriors = useWarriors();
  const { state } = useStore();
  const rowRefs = useRef<Map<number, HTMLLIElement>>(new Map());

  /* per-warrior totals from store state (no hooks in a loop) */
  const positions = useMemo(() => {
    const xpByWarrior = new Map<string, number>();
    for (const e of Object.values(state.xpEvents)) {
      xpByWarrior.set(e.warriorId, (xpByWarrior.get(e.warriorId) ?? 0) + e.amount);
    }
    return warriors.map((w) => {
      const xp = xpByWarrior.get(w.id) ?? 0;
      return { warrior: w, xp, info: levelFor(xp) };
    });
  }, [warriors, state.xpEvents]);

  const activeId = state.settings.activeWarriorId;
  const you = positions.find((p) => p.warrior.id === activeId) ?? positions[0];
  const yourLevel = you?.info.level;

  const rows = useMemo(
    () =>
      Array.from({ length: MAX_LEVEL }, (_, i) => {
        const level = MAX_LEVEL - i; // top of the ladder first
        return { level, title: RANK_TITLES[level - 1], xp: XP_CURVE[level - 1] };
      }),
    [],
  );

  /* once the cascade has started, glide slowly down the ladder to your row */
  useEffect(() => {
    if (!hydrated || !yourLevel) return;
    const row = rowRefs.current.get(yourLevel);
    if (!row) return;
    let cancel = () => {};
    const id = window.setTimeout(() => {
      cancel = glideTo(row, GLIDE_MS);
    }, 600);
    return () => {
      window.clearTimeout(id);
      cancel();
    };
  }, [hydrated, yourLevel]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-[calc(2rem+var(--safe-bottom))] pt-[calc(0.75rem+var(--safe-top))]">
      <header className="sticky top-0 z-10 -mx-4 flex items-center gap-3 border-b border-border bg-bg/85 px-4 py-3 backdrop-blur-md">
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-1 rounded-full border border-border-strong bg-panel px-3 text-xs uppercase tracking-widest text-fg-muted hover:text-fg"
        >
          <span aria-hidden>←</span> {t("ranks.back")}
        </Link>
        <div className="flex min-w-0 flex-col">
          <h1 className="font-display text-gild text-xl leading-none">{t("ranks.title")}</h1>
          <p className="truncate text-[11px] text-fg-muted">{t("ranks.subtitle")}</p>
        </div>
      </header>

      <ol className="flex flex-col gap-1.5" dir="ltr">
        {rows.map(({ level, title, xp }, i) => {
          const here = hydrated ? positions.filter((p) => p.info.level === level) : [];
          const isMax = level === MAX_LEVEL;
          const isYou = hydrated && level === yourLevel;
          return (
            <li
              key={level}
              ref={(el) => {
                if (el) rowRefs.current.set(level, el);
                else rowRefs.current.delete(level);
              }}
              className={cn(
                "panel animate-rise-in flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5",
                here.length > 0 && "panel-accent",
                isMax && "border-gold/60",
                isYou && "ring-1 ring-gold/60 shadow-[0_0_28px_-8px_var(--gold)]",
              )}
              style={{ animationDelay: `${i * STAGGER_MS}ms` }}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border font-display text-sm tabular-nums",
                  isMax ? "border-gold text-gild" : isYou ? "border-gold-2 text-gold-2" : "border-border-strong text-fg-muted",
                )}
              >
                {level}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className={cn("truncate font-display text-base", isMax ? "text-gild" : "text-fg")}>{title}</span>
                <span className="text-[11px] uppercase tracking-widest text-fg-faint">
                  {xp.toLocaleString("en-US")} XP{isMax ? ` · ${t("ranks.max")}` : ""}
                  {isYou ? ` · ${t("ranks.you")}` : ""}
                </span>
              </div>
              {here.length > 0 && (
                <div className="flex basis-full flex-wrap items-center justify-end gap-1.5 ps-12">
                  {here.map(({ warrior, xp: wxp, info }) => (
                    <span
                      key={warrior.id}
                      title={`${warrior.name} · ${wxp} XP`}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
                      style={{ borderColor: FAMILY_COLOR[warrior.theme], color: FAMILY_COLOR[warrior.theme] }}
                    >
                      <span aria-hidden>{warrior.sigil}</span>
                      <UserText text={warrior.name} className="max-w-20 truncate" />
                      <span className="tabular-nums text-fg-faint">{Math.round(info.progress * 100)}%</span>
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {!hydrated && <div className="skeleton h-10 w-full" />}
    </div>
  );
}
