"use client";

import { useState } from "react";
import { useIdealSelves, useOnboarding, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Chip, Panel, TextArea, TextField, UserText } from "@/components/ui";
import { ChipListInput } from "../ChipListInput";
import { Epigraph } from "../Epigraph";
import { StepFrame } from "../StepFrame";
import { useStepSave } from "../useStepSave";

export function FutureBiographyStep({ warriorId }: { warriorId: string }) {
  const { t } = useT();
  const { actions } = useStore();
  const onboarding = useOnboarding(warriorId);
  const selves = useIdealSelves(warriorId);
  const existing = onboarding?.futureBiography;
  const { busy, complete } = useStepSave(warriorId, "future-biography");

  const [article, setArticle] = useState(existing?.article ?? "");
  const [achievements, setAchievements] = useState<string[]>(existing?.achievements ?? []);
  const [horizon, setHorizon] = useState(existing?.horizonYear ? String(existing.horizonYear) : "");

  const active = selves.find((s) => s.isActive) ?? selves[0];
  const year = Number.parseInt(horizon, 10);
  const horizonYear = Number.isFinite(year) && year >= 1900 && year <= 2999 ? year : undefined;
  const canContinue = article.trim().length > 0;

  const onContinue = () =>
    complete({
      futureBiography: {
        ...existing,
        article: article.trim(),
        achievements,
        horizonYear,
      },
    });

  return (
    <StepFrame step="future-biography" kicker={t("onboarding.futureBiography.kicker")} canContinue={canContinue} onContinue={onContinue} busy={busy}>
      {selves.length > 0 && (
        <Panel className="flex flex-col gap-3">
          <p className="text-sm text-fg">{t("onboarding.futureBiography.chooseLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {selves.map((s) => (
              <Chip key={s.id} selected={s.isActive} onClick={() => void actions.setActiveIdealSelf(warriorId, s.id)}>
                {s.name}
              </Chip>
            ))}
          </div>
        </Panel>
      )}

      <Panel variant="accent" className="flex flex-col gap-3">
        <p className="text-sm text-fg">{t("onboarding.futureBiography.write")}</p>
        <Epigraph text={t("onboarding.futureBiography.epigraph")} />
        <details className="text-xs text-fg-muted">
          <summary className="cursor-pointer select-none text-gold">{t("onboarding.futureBiography.exampleToggle")}</summary>
          <p className="mt-2 leading-relaxed">{t("onboarding.futureBiography.exampleText")}</p>
        </details>
      </Panel>

      <Panel className="flex flex-col gap-4">
        <TextArea
          label={t("onboarding.futureBiography.articleLabel")}
          hint={t("onboarding.futureBiography.articleHint")}
          placeholder={t("onboarding.futureBiography.articlePlaceholder", { name: active?.name ?? "…" })}
          rows={8}
          value={article}
          onChange={(e) => setArticle(e.target.value)}
        />
        <ChipListInput
          label={t("onboarding.futureBiography.achievementsLabel")}
          placeholder={t("onboarding.futureBiography.achievementsPlaceholder")}
          items={achievements}
          max={8}
          tone="gold"
          onChange={setAchievements}
        />
        <TextField
          label={t("onboarding.futureBiography.horizonLabel")}
          hint={t("onboarding.futureBiography.horizonHint")}
          type="number"
          inputMode="numeric"
          min={1900}
          max={2999}
          placeholder={String(new Date().getFullYear() + 10)}
          value={horizon}
          onChange={(e) => setHorizon(e.target.value)}
          wrapClassName="max-w-40"
        />
        {active && (
          <p className="text-xs text-fg-faint">
            {t("onboarding.summary.activeSelf")}: <UserText text={active.name} className="text-fg-muted" />
          </p>
        )}
      </Panel>
    </StepFrame>
  );
}
