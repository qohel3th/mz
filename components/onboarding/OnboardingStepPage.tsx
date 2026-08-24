"use client";

import type { OnboardingStep } from "@/lib/domain/types";
import { useActiveWarrior, useHydrated } from "@/lib/store";
import { NoWarriorCard } from "./NoWarriorCard";
import { CommitmentStep } from "./steps/CommitmentStep";
import { IdealSelvesStep } from "./steps/IdealSelvesStep";
import { FutureBiographyStep } from "./steps/FutureBiographyStep";
import { AttractionsStep } from "./steps/AttractionsStep";
import { EmergencyKitStep } from "./steps/EmergencyKitStep";
import { LifeRulesStep } from "./steps/LifeRulesStep";
import { FirstPracticeStep } from "./steps/FirstPracticeStep";

export function OnboardingSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton h-1.5 w-full" />
      <div className="skeleton h-7 w-2/3" />
      <div className="skeleton h-40 w-full" />
      <div className="skeleton h-56 w-full" />
    </div>
  );
}

/** Renders one onboarding card for the active warrior (hydration + warrior guards included). */
export function OnboardingStepPage({ step }: { step: OnboardingStep }) {
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();

  if (!hydrated) return <OnboardingSkeleton />;
  if (!warrior) return <NoWarriorCard />;

  // key by warrior so local drafts reset when the warrior switches mid-step
  const id = warrior.id;
  switch (step) {
    case "commitment":
      return <CommitmentStep key={id} warriorId={id} />;
    case "ideal-selves":
      return <IdealSelvesStep key={id} warriorId={id} />;
    case "future-biography":
      return <FutureBiographyStep key={id} warriorId={id} />;
    case "attractions":
      return <AttractionsStep key={id} warriorId={id} />;
    case "emergency-kit":
      return <EmergencyKitStep key={id} warriorId={id} />;
    case "life-rules":
      return <LifeRulesStep key={id} warriorId={id} />;
    case "first-practice":
      return <FirstPracticeStep key={id} warriorId={id} />;
  }
}
