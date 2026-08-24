"use client";

import { useMemo, useState } from "react";
import type { Reflection, ReflectionAnswer, ReflectionCadence } from "@/lib/domain/types";
import { formatDate } from "@/lib/i18n";
import { useT } from "@/lib/i18n/useT";
import { Button, Panel, TextArea, cn } from "@/components/ui";
import { REFLECTION_XP, reflectionPrompts, type GateStatus } from "@/lib/reflections/gates";

interface ReflectionFormProps {
  cadence: ReflectionCadence;
  gate: GateStatus;
  existing: Reflection | undefined;
  onSave: (answers: ReflectionAnswer[]) => Promise<void>;
}

/** One TextArea per prompt for the current period. Parent keys this by cadence+periodKey so state resets per period. */
export function ReflectionForm({ cadence, gate, existing, onSave }: ReflectionFormProps) {
  const { t, locale } = useT();
  const prompts = useMemo(() => reflectionPrompts(cadence), [cadence]);

  const initial = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of prompts) map[p.promptKey] = existing?.answers.find((a) => a.promptKey === p.promptKey)?.answer ?? "";
    return map;
  }, [prompts, existing]);

  const [answers, setAnswers] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const answered = prompts.filter((p) => answers[p.promptKey]?.trim()).length;
  const canSave = answered > 0 && !saving;

  const status = gate.completed
    ? t("reflections.statusDone")
    : gate.open
      ? t("reflections.statusOpen")
      : t("reflections.statusWaiting");

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(
        prompts.map((p) => ({
          promptKey: p.promptKey,
          prompt: t(p.key),
          answer: answers[p.promptKey]?.trim() ?? "",
        })),
      );
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      variant={gate.open ? "accent" : "default"}
      rivets
      title={t("reflections.currentPeriod")}
      action={
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-widest",
            gate.completed
              ? "border-success/60 text-success"
              : gate.open
                ? "border-gold/60 text-gold-2"
                : "border-border text-fg-faint",
          )}
        >
          {status}
        </span>
      }
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <span className="font-display text-xl text-fg">{gate.periodKey}</span>
        <span className="text-xs text-fg-faint">
          {existing?.completedAt
            ? t("reflections.completedOn", { date: formatDate(locale, existing.completedAt) })
            : t("reflections.xpHint", { xp: REFLECTION_XP[cadence] })}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {prompts.map((p, i) => (
          <TextArea
            key={p.promptKey}
            label={
              <span className="flex items-baseline gap-2 normal-case tracking-normal">
                <span className="font-display text-gold-2">{i + 1}.</span>
                <span className="text-sm text-fg">{t(p.key)}</span>
              </span>
            }
            rows={3}
            value={answers[p.promptKey] ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [p.promptKey]: e.target.value }))}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-fg-faint">{t("reflections.answered", { n: answered, total: prompts.length })}</span>
        <Button variant={gate.completed ? "secondary" : "gold"} onClick={submit} disabled={!canSave}>
          {savedFlash ? t("common.done") : gate.completed ? t("common.save") : t("reflections.save")}
        </Button>
      </div>
      {answered === 0 && <p className="mt-2 text-end text-xs text-fg-faint">{t("reflections.emptyAnswer")}</p>}
    </Panel>
  );
}
