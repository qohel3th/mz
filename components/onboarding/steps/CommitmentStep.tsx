"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { formatDate } from "@/lib/i18n";
import { nowIso } from "@/lib/domain/ids";
import { Button, Panel, TextField } from "@/components/ui";
import { Epigraph } from "../Epigraph";
import { StepFrame } from "../StepFrame";
import { useStepSave } from "../useStepSave";

export function CommitmentStep({ warriorId }: { warriorId: string }) {
  const { t, locale } = useT();
  const onboarding = useOnboarding(warriorId);
  const existing = onboarding?.commitment;
  const { busy, complete } = useStepSave(warriorId, "commitment");
  const [statement, setStatement] = useState(existing?.statement ?? "");

  const acknowledged = existing?.acknowledged === true;

  const commit = () =>
    complete({
      commitment: {
        acknowledged: true,
        statement: statement.trim() || undefined,
        signedAt: existing?.signedAt ?? nowIso(),
      },
    });

  return (
    <StepFrame step="commitment" kicker={t("onboarding.commitment.kicker")} canContinue={acknowledged} onContinue={commit} busy={busy}>
      <Panel variant="accent" rivets className="flex flex-col gap-3">
        <p className="font-display text-base leading-snug text-fg">{t("onboarding.commitment.line1")}</p>
        <p className="text-sm text-fg-muted">{t("onboarding.commitment.line2")}</p>
        <p className="text-sm text-fg">{t("onboarding.commitment.line3")}</p>
        <Epigraph text={t("onboarding.commitment.epigraph")} />
      </Panel>

      <Panel className="flex flex-col gap-4">
        <TextField
          label={t("onboarding.commitment.statementLabel")}
          hint={t("common.optional")}
          placeholder={t("onboarding.commitment.statementPlaceholder")}
          value={statement}
          maxLength={140}
          onChange={(e) => setStatement(e.target.value)}
        />
        <Button variant="gold" size="lg" block onClick={commit} disabled={busy}>
          {acknowledged ? t("onboarding.commitment.committed") : t("onboarding.commitment.commit")}
        </Button>
        {acknowledged && existing?.signedAt && (
          <p className="text-center text-xs text-fg-faint">
            {t("onboarding.commitment.signedAt", { date: formatDate(locale, existing.signedAt) })}
          </p>
        )}
      </Panel>
    </StepFrame>
  );
}
