"use client";

import Link from "next/link";
import { useMemo } from "react";
import { todayKey } from "@/lib/domain/ids";
import { useT } from "@/lib/i18n/useT";
import { useActiveWarrior, useHydrated, useReflections } from "@/lib/store";
import { Button, Panel } from "@/components/ui";
import { openGates } from "@/lib/reflections/gates";

/** Dashboard card listing open reflection gates. Renders null when nothing is open. */
export function ReflectionGateCard() {
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();
  const reflections = useReflections(warrior?.id);
  const { t } = useT();

  const gates = useMemo(() => (hydrated && warrior ? openGates(reflections, todayKey()) : []), [hydrated, warrior, reflections]);

  if (gates.length === 0) return null;

  return (
    <Panel variant="accent" rivets title={t("reflections.title")}>
      <ul className="flex flex-col gap-2">
        {gates.map((g) => (
          <li key={g.cadence} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-fg">{t("reflections.due", { cadence: t(`reflections.${g.cadence}`) })}</span>
              <span className="text-xs text-fg-faint">
                {g.periodKey} · {t("reflections.xpHint", { xp: g.xp })}
              </span>
            </span>
            <Link href={`/reflections?cadence=${g.cadence}`} className="shrink-0">
              <Button variant="gold" size="sm">
                {t("reflections.start")}
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default ReflectionGateCard;
