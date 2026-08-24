"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Panel, TextField, cn } from "@/components/ui";
import { ChipListInput } from "../ChipListInput";
import { Epigraph } from "../Epigraph";
import { StepFrame } from "../StepFrame";
import { useStepSave } from "../useStepSave";

const MIN = 3;
const MAX = 5;

function Count({ n }: { n: number }) {
  const { t } = useT();
  const ok = n >= MIN && n <= MAX;
  return <span className={cn("text-xs", ok ? "text-success" : "text-fg-faint")}>{t("onboarding.attractions.countHint", { count: n })}</span>;
}

export function AttractionsStep({ warriorId }: { warriorId: string }) {
  const { t } = useT();
  const onboarding = useOnboarding(warriorId);
  const existing = onboarding?.attractions;
  const { busy, complete } = useStepSave(warriorId, "attractions");

  const [receptive, setReceptive] = useState<string[]>(existing?.receptive ?? []);
  const [participatory, setParticipatory] = useState<string[]>(existing?.participatory ?? []);
  const [insight, setInsight] = useState(existing?.insight ?? "");

  const valid = (l: string[]) => l.length >= MIN && l.length <= MAX;
  const canContinue = valid(receptive) && valid(participatory);

  const onContinue = () =>
    complete({ attractions: { receptive, participatory, insight: insight.trim() || undefined } });

  return (
    <StepFrame step="attractions" kicker={t("onboarding.attractions.kicker")} canContinue={canContinue} onContinue={onContinue} busy={busy}>
      <Panel variant="accent" className="flex flex-col gap-3">
        <p className="text-sm text-fg">{t("onboarding.attractions.intro")}</p>
        <Epigraph text={t("onboarding.attractions.epigraph")} />
      </Panel>

      <Panel className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm uppercase tracking-widest text-gold">{t("onboarding.attractions.receptiveTitle")}</h2>
          <Count n={receptive.length} />
        </div>
        <p className="text-xs text-fg-muted">{t("onboarding.attractions.receptiveHelp")}</p>
        <ChipListInput items={receptive} onChange={setReceptive} max={MAX} placeholder={t("onboarding.attractions.receptivePlaceholder")} />
      </Panel>

      <Panel className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm uppercase tracking-widest text-gold">{t("onboarding.attractions.participatoryTitle")}</h2>
          <Count n={participatory.length} />
        </div>
        <p className="text-xs text-fg-muted">{t("onboarding.attractions.participatoryHelp")}</p>
        <ChipListInput items={participatory} onChange={setParticipatory} max={MAX} placeholder={t("onboarding.attractions.participatoryPlaceholder")} tone="gold" />
      </Panel>

      <Panel>
        <TextField
          label={t("onboarding.attractions.insightLabel")}
          placeholder={t("onboarding.attractions.insightPlaceholder")}
          value={insight}
          maxLength={200}
          onChange={(e) => setInsight(e.target.value)}
        />
      </Panel>
    </StepFrame>
  );
}
