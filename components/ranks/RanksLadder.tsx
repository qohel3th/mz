"use client";

import { useMemo } from "react";
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

/** Vertical ladder of all 33 levels with every warrior's current position overlaid. */
export function RanksLadder() {
  const { t } = useT();
  const hydrated = useHydrated();
  const warriors = useWarriors();
  const { state } = useStore();

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

  const rows = useMemo(
    () =>
      Array.from({ length: MAX_LEVEL }, (_, i) => {
        const level = MAX_LEVEL - i; // top of the ladder first
        return { level, title: RANK_TITLES[level - 1], xp: XP_CURVE[level - 1] };
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-gild text-2xl">{t("ranks.title")}</h1>
        <p className="text-sm text-fg-muted">{t("ranks.subtitle")}</p>
      </header>

      <ol className="flex flex-col gap-1.5" dir="ltr">
        {rows.map(({ level, title, xp }) => {
          const here = hydrated ? positions.filter((p) => p.info.level === level) : [];
          const isMax = level === MAX_LEVEL;
          return (
            <li
              key={level}
              className={cn(
                "panel flex items-center gap-3 px-3 py-2.5",
                here.length > 0 && "panel-accent",
                isMax && "border-gold/60",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border font-display text-sm tabular-nums",
                  isMax ? "border-gold text-gild" : "border-border-strong text-fg-muted",
                )}
              >
                {level}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className={cn("truncate font-display text-base", isMax ? "text-gild" : "text-fg")}>{title}</span>
                <span className="text-[11px] uppercase tracking-widest text-fg-faint">
                  {xp.toLocaleString("en-US")} XP{isMax ? ` · ${t("ranks.max")}` : ""}
                </span>
              </div>
              {here.length > 0 && (
                <div className="flex shrink-0 items-center gap-1.5">
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
