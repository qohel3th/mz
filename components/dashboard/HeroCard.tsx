"use client";

import { Panel, ProgressBar, Stat, UserText } from "@/components/ui";
import { useT } from "@/lib/i18n/useT";
import { useActiveIdealSelf, useMinimumViableWeeks, useTotalXp } from "@/lib/store";
import { todayKey } from "@/lib/domain/ids";
import type { Warrior } from "@/lib/domain/types";
import { levelFor, levelTitle } from "@/lib/game/progression";
import { streakStatus } from "@/lib/game/streak";

export function HeroCard({ warrior }: { warrior: Warrior }) {
  const { t } = useT();
  const idealSelf = useActiveIdealSelf(warrior.id);
  const xp = useTotalXp(warrior.id);
  const mvw = useMinimumViableWeeks(warrior.id);
  const info = levelFor(xp);
  const streak = streakStatus(warrior, todayKey(), mvw);

  return (
    <Panel variant="accent" rivets className="animate-rise-in">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg-3 text-3xl shadow-[0_0_24px_-6px_var(--accent)]">
          <span aria-hidden>{warrior.sigil}</span>
        </div>
        <div className="min-w-0 flex-1">
          <UserText as="h1" text={warrior.name} className="font-display truncate text-2xl leading-tight text-gild" />
          {idealSelf && <UserText as="p" text={idealSelf.tagline} className="truncate text-sm text-fg-muted" />}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <span className="font-display text-lg">
          {t("dashboard.level")} {info.level}
          <span className="ms-2 text-sm text-gold-2">{levelTitle(info.level)}</span>
        </span>
        <span className="text-xs text-fg-muted">
          {xp} {t("dashboard.xp")}
        </span>
      </div>
      <ProgressBar value={info.progress} className="mt-2" label={t("dashboard.xp")} />
      <p className="mt-1.5 text-xs text-fg-faint">
        {info.nextThreshold === null
          ? t("dashboard.maxLevel")
          : t("dashboard.nextLevel", { xp: info.xpToNext ?? 0, level: info.level + 1 })}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label={t("dashboard.level")} value={info.level} tone="gold" hint={levelTitle(info.level)} />
        <Stat label={t("dashboard.xp")} value={xp} tone="accent" />
        <Stat
          label={t("dashboard.streak")}
          value={
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>🔥</span>
              {streak.current}
            </span>
          }
          hint={
            streak.protectedToday
              ? t("dashboard.protected")
              : streak.atRisk
                ? t("dashboard.atRisk")
                : t("dashboard.best", { n: streak.best })
          }
        />
      </div>
    </Panel>
  );
}
