"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ONBOARDING_STEPS, type OnboardingState, type OnboardingStep } from "@/lib/domain/types";
import { useActiveWarrior, useHydrated, useIdealSelves, useOnboarding } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { formatDate } from "@/lib/i18n";
import { Chip, Panel, UserText } from "@/components/ui";
import { NoWarriorCard } from "./NoWarriorCard";
import { OnboardingSkeleton } from "./OnboardingStepPage";
import { FIRST_STEP, isStep, stepHref } from "./steps";

/**
 * /onboarding: resumes the current step, or — once the workshop is complete —
 * shows a summary of every answer with per-step Edit links.
 */
export function OnboardingIndex() {
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();
  const onboarding = useOnboarding(warrior?.id);
  const router = useRouter();

  const target: OnboardingStep | null =
    hydrated && warrior && !onboarding?.completedAt
      ? isStep(onboarding?.currentStep ?? "")
        ? (onboarding?.currentStep as OnboardingStep)
        : FIRST_STEP
      : null;

  useEffect(() => {
    if (target) router.replace(stepHref(target));
  }, [target, router]);

  if (!hydrated || target) return <OnboardingSkeleton />;
  if (!warrior) return <NoWarriorCard />;
  return <Summary warriorId={warrior.id} onboarding={onboarding!} />;
}

function Summary({ warriorId, onboarding }: { warriorId: string; onboarding: OnboardingState }) {
  const { t, locale } = useT();
  const selves = useIdealSelves(warriorId);
  const completedOn = onboarding.completedAt ? formatDate(locale, onboarding.completedAt) : "";

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <header className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-fg-muted">{t("onboarding.title")}</span>
        <h1 className="font-display text-2xl leading-tight text-gild">{t("onboarding.summary.title")}</h1>
        <p className="text-xs text-fg-muted">{t("onboarding.summary.subtitle", { date: completedOn })}</p>
      </header>

      {ONBOARDING_STEPS.map((step, i) => (
        <Panel
          key={step}
          title={<span className="tabular-nums">{`${i + 1}. ${t(`onboarding.steps.${step}`)}`}</span>}
          action={
            <Link href={stepHref(step)} className="text-xs uppercase tracking-widest text-accent-2 hover:text-fg">
              {t("onboarding.nav.edit")}
            </Link>
          }
        >
          <StepSummary step={step} onboarding={onboarding} selves={selves} />
        </Panel>
      ))}

      <Link href={stepHref(FIRST_STEP)} className="text-center text-xs text-fg-faint underline-offset-2 hover:underline">
        {t("onboarding.summary.restart")}
      </Link>
    </div>
  );
}

function Chips({ items, tone }: { items: string[]; tone?: "accent" | "gold" | "neutral" }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((x) => (
        <Chip key={x} tone={tone ?? "neutral"} className="pointer-events-none text-xs">
          {x}
        </Chip>
      ))}
    </div>
  );
}

function StepSummary({
  step,
  onboarding,
  selves,
}: {
  step: OnboardingStep;
  onboarding: OnboardingState;
  selves: ReturnType<typeof useIdealSelves>;
}) {
  const { t, locale } = useT();
  const empty = <p className="text-xs text-fg-faint">{t("onboarding.summary.notAnswered")}</p>;

  switch (step) {
    case "commitment": {
      const c = onboarding.commitment;
      if (!c?.acknowledged) return empty;
      return (
        <div className="flex flex-col gap-1">
          {c.statement && <UserText as="p" text={c.statement} className="text-sm text-fg" />}
          <span className="text-xs text-fg-faint">
            {t("onboarding.commitment.committed")}
            {c.signedAt ? ` · ${t("onboarding.commitment.signedAt", { date: formatDate(locale, c.signedAt) })}` : ""}
          </span>
        </div>
      );
    }
    case "ideal-selves": {
      if (selves.length === 0) return empty;
      return (
        <div className="flex flex-wrap gap-1.5">
          {selves.map((s) => (
            <Chip key={s.id} tone={s.isActive ? "gold" : "neutral"} selected={s.isActive} className="pointer-events-none text-xs">
              {s.name}
            </Chip>
          ))}
        </div>
      );
    }
    case "future-biography": {
      const b = onboarding.futureBiography;
      if (!b?.article) return empty;
      return (
        <div className="flex flex-col gap-2">
          <UserText as="p" text={b.article.length > 160 ? `${b.article.slice(0, 160)}…` : b.article} className="text-sm text-fg-muted" />
          {b.achievements.length > 0 && <Chips items={b.achievements} tone="gold" />}
        </div>
      );
    }
    case "attractions": {
      const a = onboarding.attractions;
      if (!a) return empty;
      return (
        <div className="flex flex-col gap-2">
          <Chips items={a.receptive} tone="accent" />
          <Chips items={a.participatory} tone="gold" />
        </div>
      );
    }
    case "emergency-kit": {
      const k = onboarding.emergencyKit;
      if (!k || k.items.length === 0) return empty;
      return (
        <ul className="flex flex-col gap-1 text-sm text-fg-muted">
          {k.items.map((it) => (
            <li key={it.id} className="flex gap-2">
              <span className="text-gold">◆</span>
              <UserText text={it.title} />
            </li>
          ))}
        </ul>
      );
    }
    case "life-rules": {
      const r = onboarding.lifeRules;
      if (!r) return empty;
      return (
        <div className="flex flex-col gap-2">
          <Chips items={r.mustAvoid} tone="accent" />
          <Chips items={r.mustHave} tone="gold" />
        </div>
      );
    }
    case "first-practice": {
      const p = onboarding.firstPractice;
      if (!p?.accepted) return empty;
      return (
        <p className="text-sm text-fg">
          <UserText text={p.title} />
          <span className="text-fg-faint"> · {t("onboarding.summary.minutesPerDay", { minutes: p.minutes })}</span>
        </p>
      );
    }
  }
}
