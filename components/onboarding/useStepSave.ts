"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { OnboardingState, OnboardingStep } from "@/lib/domain/types";
import { nextStep, stepHref } from "./steps";

/**
 * Saves one onboarding step (marking it complete + advancing currentStep)
 * and routes to the next step. Feature-local helper.
 */
export function useStepSave(warriorId: string, step: OnboardingStep) {
  const router = useRouter();
  const { actions } = useStore();
  const [busy, setBusy] = useState(false);
  const next = nextStep(step);

  const complete = useCallback(
    async (data: Partial<OnboardingState>, opts?: { stay?: boolean }) => {
      setBusy(true);
      try {
        await actions.saveOnboardingStep(warriorId, step, data, { complete: true, nextStep: next ?? step });
        if (!opts?.stay) router.push(next ? stepHref(next) : "/onboarding");
      } finally {
        setBusy(false);
      }
    },
    [actions, warriorId, step, next, router],
  );

  return { busy, complete };
}
