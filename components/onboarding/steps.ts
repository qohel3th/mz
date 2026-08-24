import { ONBOARDING_STEPS, type OnboardingStep } from "@/lib/domain/types";

export const FIRST_STEP: OnboardingStep = ONBOARDING_STEPS[0];
export const TOTAL_STEPS = ONBOARDING_STEPS.length;

export function isStep(value: string): value is OnboardingStep {
  return (ONBOARDING_STEPS as readonly string[]).includes(value);
}

export function stepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

export function prevStep(step: OnboardingStep): OnboardingStep | undefined {
  return ONBOARDING_STEPS[stepIndex(step) - 1];
}

export function nextStep(step: OnboardingStep): OnboardingStep | undefined {
  return ONBOARDING_STEPS[stepIndex(step) + 1];
}

export function stepHref(step: OnboardingStep): string {
  return `/onboarding/${step}`;
}

/** Normalise a free-text list item: trim + collapse inner whitespace. */
export function cleanItem(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
