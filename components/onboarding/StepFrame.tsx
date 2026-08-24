"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_STEPS, type OnboardingStep } from "@/lib/domain/types";
import { useActiveWarrior, useOnboarding } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Button, cn } from "@/components/ui";
import { prevStep, stepHref, stepIndex, TOTAL_STEPS } from "./steps";

export interface StepFrameProps {
  step: OnboardingStep;
  /** small label above the title, e.g. "1st assignment" */
  kicker?: string;
  canContinue: boolean;
  onContinue: () => void | Promise<void>;
  busy?: boolean;
  continueLabel?: string;
  /** hide the sticky bar (e.g. on the celebration card) */
  hideBar?: boolean;
  children: ReactNode;
}

/** Progress header + sticky Back/Continue bar shared by every onboarding card. */
export function StepFrame({ step, kicker, canContinue, onContinue, busy, continueLabel, hideBar, children }: StepFrameProps) {
  const { t } = useT();
  const router = useRouter();
  const warrior = useActiveWarrior();
  const onboarding = useOnboarding(warrior?.id);
  const index = stepIndex(step);
  const completed = new Set(onboarding?.completedSteps ?? []);
  const prev = prevStep(step);

  return (
    <div className="flex flex-col gap-4 pb-24 animate-fade-in">
      <header className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-fg-muted">{t("onboarding.title")}</span>
          <span className="text-xs text-fg-muted">{t("onboarding.progress", { current: index + 1, total: TOTAL_STEPS })}</span>
        </div>
        <div className="flex gap-1" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          {ONBOARDING_STEPS.map((s, i) => (
            <span
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                i === index ? "bg-accent-2 shadow-[0_0_10px_-2px_var(--accent)]" : completed.has(s) ? "bg-gold" : "bg-bg-3",
              )}
            />
          ))}
        </div>
        {kicker && <span className="mt-1 text-xs uppercase tracking-widest text-gold">{kicker}</span>}
        <h1 className="font-display text-2xl leading-tight text-gild">{t(`onboarding.steps.${step}`)}</h1>
      </header>

      {children}

      {!hideBar && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+var(--safe-bottom))] z-30 border-t border-border bg-bg/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
            <Button
              variant="ghost"
              onClick={() => router.push(prev ? stepHref(prev) : "/onboarding")}
              disabled={busy}
            >
              {t("onboarding.nav.back")}
            </Button>
            <Button variant="primary" onClick={() => void onContinue()} disabled={!canContinue || busy} className="min-w-36">
              {busy ? t("onboarding.nav.saving") : (continueLabel ?? t("onboarding.nav.continue"))}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
