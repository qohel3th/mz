"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding, useStore, useTasks } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { newId, nowIso } from "@/lib/domain/ids";
import { DOMAINS, type Domain, type FirstPractice, type Task } from "@/lib/domain/types";
import { Button, Chip, Panel, TextField } from "@/components/ui";
import { Epigraph } from "../Epigraph";
import { StepFrame } from "../StepFrame";
import { useStepSave } from "../useStepSave";

const MIN_MINUTES = 10;
const COMPLETION_XP = 100;

export function FirstPracticeStep({ warriorId }: { warriorId: string }) {
  const { t } = useT();
  const router = useRouter();
  const { actions } = useStore();
  const onboarding = useOnboarding(warriorId);
  const tasks = useTasks(warriorId);
  const existing = onboarding?.firstPractice;
  const { busy, complete } = useStepSave(warriorId, "first-practice");

  const [title, setTitle] = useState(existing?.title ?? t("onboarding.firstPractice.defaultTitle"));
  const [minutes, setMinutes] = useState(String(existing?.minutes ?? MIN_MINUTES));
  const [domain, setDomain] = useState<Domain>(existing?.domain ?? "spirit");
  const [cue, setCue] = useState(existing?.cue ?? "");
  const [done, setDone] = useState<{ firstTime: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const mins = Number.parseInt(minutes, 10);
  const minutesOk = Number.isFinite(mins) && mins >= MIN_MINUTES;
  const canContinue = title.trim().length > 0 && minutesOk && !saving;

  const accept = async () => {
    setSaving(true);
    try {
      const now = nowIso();
      const description = existing?.description || t("onboarding.firstPractice.defaultDescription");
      const existingTask = existing?.taskId ? tasks.find((x) => x.id === existing.taskId) : undefined;
      const taskId = existingTask?.id ?? newId("task");
      const patch: Partial<Task> = { title: title.trim(), notes: description, domain, updatedAt: now };
      const patched = existingTask ? await actions.patch("tasks", taskId, patch) : null;
      if (!patched) {
        await actions.upsert("tasks", {
          id: taskId,
          warriorId,
          kind: "anchor",
          schedule: "daily",
          xpReward: 10,
          completions: [],
          archived: false,
          system: true,
          title: title.trim(),
          notes: description,
          domain,
          createdAt: now,
          updatedAt: now,
        });
      }

      const firstTime = !onboarding?.completedAt;
      const practice: FirstPractice = {
        title: title.trim(),
        description,
        minutes: mins,
        domain,
        cue: cue.trim() || undefined,
        accepted: true,
        taskId,
      };
      await complete({ firstPractice: practice, completedAt: onboarding?.completedAt ?? now }, { stay: true });
      if (firstTime) {
        await actions.grantXp({ warriorId, baseAmount: COMPLETION_XP, source: "onboarding", note: "Identity workshop complete" });
      }
      setDone({ firstTime });
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <StepFrame step="first-practice" kicker={t("onboarding.firstPractice.kicker")} canContinue={false} onContinue={() => undefined} hideBar>
        <Panel variant="accent" rivets className="flex animate-rise-in flex-col items-center gap-3 py-8 text-center">
          <span className="text-5xl animate-pulse-glow">🔥</span>
          <h2 className="font-display text-2xl text-gild">{t("onboarding.firstPractice.done.title")}</h2>
          <p className="text-sm text-fg-muted">{t("onboarding.firstPractice.done.body")}</p>
          <p className="font-display text-lg text-gold-2">
            {done.firstTime ? t("onboarding.firstPractice.done.xp", { xp: COMPLETION_XP }) : t("onboarding.firstPractice.done.again")}
          </p>
          <Button variant="gold" size="lg" onClick={() => router.push("/dashboard")} className="mt-2">
            {t("onboarding.firstPractice.done.cta")}
          </Button>
        </Panel>
      </StepFrame>
    );
  }

  return (
    <StepFrame
      step="first-practice"
      kicker={t("onboarding.firstPractice.kicker")}
      canContinue={canContinue}
      onContinue={accept}
      busy={busy || saving}
      continueLabel={t("onboarding.nav.finish")}
    >
      <Panel variant="accent" rivets className="flex flex-col gap-3">
        <p className="font-display text-lg leading-snug text-fg">{t("onboarding.firstPractice.directive")}</p>
        <div>
          <span className="text-xs uppercase tracking-widest text-gold">{t("onboarding.firstPractice.rulesTitle")}</span>
          <ol className="mt-1 list-decimal ps-5 text-sm text-fg-muted">
            <li>{t("onboarding.firstPractice.rule1")}</li>
            <li>{t("onboarding.firstPractice.rule2")}</li>
            <li>{t("onboarding.firstPractice.rule3")}</li>
          </ol>
        </div>
        <Epigraph text={t("onboarding.firstPractice.why")} />
      </Panel>

      <Panel className="flex flex-col gap-4">
        <TextField
          label={t("onboarding.firstPractice.titleLabel")}
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label={t("onboarding.firstPractice.minutesLabel")}
          hint={t("onboarding.firstPractice.minutesHint")}
          type="number"
          inputMode="numeric"
          min={MIN_MINUTES}
          max={180}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          wrapClassName="max-w-40"
          className={minutesOk ? undefined : "border-red-2"}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-widest text-fg-muted">{t("onboarding.firstPractice.domainLabel")}</span>
          <div className="flex flex-wrap gap-1.5">
            {DOMAINS.map((d) => (
              <Chip key={d} tone="neutral" className="text-xs" selected={domain === d} onClick={() => setDomain(d)}>
                {t(`domains.${d}`)}
              </Chip>
            ))}
          </div>
        </div>
        <TextField
          label={t("onboarding.firstPractice.cueLabel")}
          placeholder={t("onboarding.firstPractice.cuePlaceholder")}
          value={cue}
          maxLength={80}
          onChange={(e) => setCue(e.target.value)}
        />
        <p className="text-xs text-fg-faint">{t("onboarding.firstPractice.anchorHint")}</p>
      </Panel>
    </StepFrame>
  );
}
