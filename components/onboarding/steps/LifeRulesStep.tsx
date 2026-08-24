"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Panel } from "@/components/ui";
import { ChipListInput } from "../ChipListInput";
import { Epigraph } from "../Epigraph";
import { StepFrame } from "../StepFrame";
import { useStepSave } from "../useStepSave";

const MAX = 12;

export function LifeRulesStep({ warriorId }: { warriorId: string }) {
  const { t } = useT();
  const onboarding = useOnboarding(warriorId);
  const existing = onboarding?.lifeRules;
  const { busy, complete } = useStepSave(warriorId, "life-rules");

  const [mustAvoid, setMustAvoid] = useState<string[]>(existing?.mustAvoid ?? []);
  const [mustHave, setMustHave] = useState<string[]>(existing?.mustHave ?? []);

  const canContinue = mustAvoid.length >= 1 && mustHave.length >= 1;
  const onContinue = () => complete({ lifeRules: { mustAvoid, mustHave } });

  return (
    <StepFrame step="life-rules" kicker={t("onboarding.lifeRules.kicker")} canContinue={canContinue} onContinue={onContinue} busy={busy}>
      <Panel variant="accent" className="flex flex-col gap-3">
        <p className="text-sm text-fg">{t("onboarding.lifeRules.intro")}</p>
        <Epigraph text={t("onboarding.lifeRules.epigraph")} />
      </Panel>

      <Panel title={t("onboarding.lifeRules.avoidTitle")} className="flex flex-col gap-3">
        <p className="text-xs text-fg-muted">{t("onboarding.lifeRules.avoidHelp")}</p>
        <ChipListInput items={mustAvoid} onChange={setMustAvoid} max={MAX} placeholder={t("onboarding.lifeRules.avoidPlaceholder")} />
      </Panel>

      <Panel title={t("onboarding.lifeRules.haveTitle")} className="flex flex-col gap-3">
        <p className="text-xs text-fg-muted">{t("onboarding.lifeRules.haveHelp")}</p>
        <ChipListInput items={mustHave} onChange={setMustHave} max={MAX} placeholder={t("onboarding.lifeRules.havePlaceholder")} tone="gold" />
      </Panel>

      <div className="flex flex-col gap-1 text-center text-xs text-fg-faint">
        <span>{t("onboarding.lifeRules.countHint")}</span>
        <span className="text-fg-muted">{t("onboarding.lifeRules.pacing")}</span>
      </div>
    </StepFrame>
  );
}
