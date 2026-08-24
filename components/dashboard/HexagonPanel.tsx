"use client";

import { useMemo, useState } from "react";
import { Chip, Panel } from "@/components/ui";
import { Hexagon } from "@/components/chart/Hexagon";
import { useT } from "@/lib/i18n/useT";
import { useXpEvents } from "@/lib/store";
import { todayKey } from "@/lib/domain/ids";
import type { Aggregation, Warrior } from "@/lib/domain/types";
import { domainScores } from "@/lib/game/domains";
import { useDomainLabels } from "./DomainChip";

const AGGS: Aggregation[] = ["daily", "weekly", "monthly", "quarterly"];

export function HexagonPanel({ warrior }: { warrior: Warrior }) {
  const { t } = useT();
  const labels = useDomainLabels();
  const events = useXpEvents(warrior.id);
  const [agg, setAgg] = useState<Aggregation>("weekly");
  const scores = useMemo(() => domainScores(events, agg, todayKey()), [events, agg]);

  return (
    <Panel title={t("dashboard.hexagon")}>
      <div className="mb-3 flex flex-wrap gap-2">
        {AGGS.map((a) => (
          <Chip key={a} selected={agg === a} tone="neutral" onClick={() => setAgg(a)}>
            {t(`dashboard.agg${a[0].toUpperCase()}${a.slice(1)}`)}
          </Chip>
        ))}
      </div>
      <div className="mx-auto w-full max-w-[300px]">
        <Hexagon scores={scores} labels={labels} highlight={warrior.quarterlyFocus} />
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
        {scores.map((s) => (
          <li key={s.domain} className="flex items-baseline justify-between gap-2">
            <span className={s.domain === warrior.quarterlyFocus ? "text-gold-2" : "text-fg-muted"}>
              {labels[s.domain]}
            </span>
            <span className="font-display text-fg">{s.value}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
