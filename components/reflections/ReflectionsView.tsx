"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { Reflection, ReflectionAnswer, ReflectionCadence } from "@/lib/domain/types";
import { newId, nowIso, todayKey } from "@/lib/domain/ids";
import { useT } from "@/lib/i18n/useT";
import { useActiveWarrior, useHydrated, useReflections, useStore } from "@/lib/store";
import { Button, Chip, Panel } from "@/components/ui";
import { CADENCES, REFLECTION_XP, findReflection, gateStatus, isCadence } from "@/lib/reflections/gates";
import { ReflectionForm } from "./ReflectionForm";
import { ReflectionHistory } from "./ReflectionHistory";

/** Must be rendered inside a <Suspense> boundary (uses useSearchParams). */
export function ReflectionsView() {
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();
  const { t } = useT();
  const { actions } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const reflections = useReflections(warrior?.id);

  const initialCadence: ReflectionCadence = isCadence(params.get("cadence")) ? (params.get("cadence") as ReflectionCadence) : "weekly";
  const [cadence, setCadence] = useState<ReflectionCadence>(initialCadence);

  const today = todayKey();
  const gate = useMemo(() => gateStatus(reflections, cadence, today), [reflections, cadence, today]);
  const existing = useMemo(() => findReflection(reflections, cadence, gate.periodKey), [reflections, cadence, gate.periodKey]);

  const selectCadence = (c: ReflectionCadence) => {
    setCadence(c);
    router.replace(`/reflections?cadence=${c}`, { scroll: false });
  };

  const save = useCallback(
    async (answers: ReflectionAnswer[]) => {
      if (!warrior) return;
      const now = nowIso();
      const firstCompletion = !existing?.completedAt;
      let saved: Reflection;
      if (existing) {
        saved =
          (await actions.patch("reflections", existing.id, { answers, completedAt: existing.completedAt ?? now, updatedAt: now })) ??
          existing;
      } else {
        saved = await actions.upsert("reflections", {
          id: newId("rf"),
          warriorId: warrior.id,
          cadence,
          periodKey: gate.periodKey,
          answers,
          completedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      }
      if (firstCompletion) {
        await actions.grantXp({
          warriorId: warrior.id,
          baseAmount: REFLECTION_XP[cadence],
          source: "reflection",
          refId: saved.id,
          date: today,
        });
        await actions.recordActivity(warrior.id, today);
      }
    },
    [actions, warrior, existing, cadence, gate.periodKey, today],
  );

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="skeleton h-8 w-44" />
        <div className="flex gap-2">
          <div className="skeleton h-9 w-24" />
          <div className="skeleton h-9 w-24" />
          <div className="skeleton h-9 w-24" />
        </div>
        <div className="skeleton h-72 w-full" />
      </div>
    );
  }

  if (!warrior) {
    return (
      <div className="px-4 py-6">
        <Panel variant="accent" rivets title={t("reflections.title")}>
          <p className="mb-4 text-sm text-fg-muted">{t("reflections.noWarrior")}</p>
          <Link href="/" className="inline-flex">
            <Button variant="gold">{t("reflections.chooseWarrior")}</Button>
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-gild text-2xl leading-tight">{t("reflections.title")}</h1>
        <p className="text-xs text-fg-faint">{t("reflections.gateHint")}</p>
      </header>

      <div role="tablist" aria-label={t("reflections.title")} className="flex gap-2">
        {CADENCES.map((c) => {
          const g = gateStatus(reflections, c, today);
          return (
            <Chip
              key={c}
              role="tab"
              tone="gold"
              selected={cadence === c}
              aria-selected={cadence === c}
              onClick={() => selectCadence(c)}
            >
              {t(`reflections.${c}`)}
              {g.open && (
                <span aria-hidden className="ms-1 inline-block h-1.5 w-1.5 rounded-full bg-gold-2 align-middle" />
              )}
            </Chip>
          );
        })}
      </div>

      <ReflectionForm key={`${cadence}:${gate.periodKey}`} cadence={cadence} gate={gate} existing={existing} onSave={save} />

      <ReflectionHistory cadence={cadence} reflections={reflections} currentKey={gate.periodKey} />
    </div>
  );
}

export default ReflectionsView;
