"use client";

import { Panel } from "@/components/ui";
import { useT } from "@/lib/i18n/useT";
import { useStore } from "@/lib/store";
import { DOMAINS, type Warrior } from "@/lib/domain/types";
import { GROWTH_MULTIPLIER } from "@/lib/game/progression";
import { DomainChip } from "./DomainChip";

export function QuarterlyFocusPanel({ warrior }: { warrior: Warrior }) {
  const { t } = useT();
  const { actions } = useStore();
  const focus = warrior.quarterlyFocus;

  return (
    <Panel title={t("dashboard.quarterlyFocus")}>
      <div className="flex flex-wrap gap-2">
        {DOMAINS.map((d) => {
          const selected = focus === d;
          return (
            <DomainChip
              key={d}
              domain={d}
              tone="gold"
              selected={selected}
              className={selected ? "border-gold! bg-gold! text-bg! shadow-[0_0_16px_-4px_var(--gold)]!" : undefined}
              onClick={() => void actions.setQuarterlyFocus(warrior.id, selected ? undefined : d)}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {focus ? (
          <>
            <span className="rounded-full bg-gold/20 px-2 py-0.5 font-semibold text-gold-2">
              {t(`domains.${focus}`)} · {t("dashboard.growth", { mult: GROWTH_MULTIPLIER })}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-fg-muted">
              {t("dashboard.maintenanceMode")} ×1
            </span>
          </>
        ) : (
          <span className="text-fg-muted">{t("dashboard.focusNone")}</span>
        )}
      </div>
      <p className="mt-2 text-xs text-fg-faint">{t("dashboard.focusHint", { mult: GROWTH_MULTIPLIER })}</p>
    </Panel>
  );
}
