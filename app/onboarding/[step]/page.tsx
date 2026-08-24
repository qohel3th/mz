import { redirect } from "next/navigation";
import { OnboardingStepPage } from "@/components/onboarding/OnboardingStepPage";
import { FIRST_STEP, isStep, stepHref } from "@/components/onboarding/steps";

export default async function OnboardingStepRoute({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!isStep(step)) redirect(stepHref(FIRST_STEP));
  return <OnboardingStepPage step={step} />;
}
