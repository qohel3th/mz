"use client";

import { useMemo } from "react";
import type { AiRefinement, AiTranslation } from "@/lib/domain/types";
import { makeRefinement, makeTranslation, type ExternalRecordType, type RefinePurpose } from "@/lib/ai";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { RefineControls } from "./RefineControls";
import { ExternalAssist } from "./ExternalAssist";

export interface RecordAssistProps {
  collection: "journal" | "reflections" | "idealSelves";
  recordId: string;
  recordType: ExternalRecordType;
  purpose: RefinePurpose;
  /** the original, user-authored text (never overwritten) */
  original: string;
  refined?: AiRefinement;
  translated?: AiTranslation;
  fields?: Record<string, string>;
}

/**
 * Binds RefineControls + ExternalAssist to a stored record: results are
 * patched into `refined` / `translated` alongside the original.
 */
export function RecordAssist({ collection, recordId, recordType, purpose, original, refined, translated, fields }: RecordAssistProps) {
  const { actions } = useStore();
  const { locale, t } = useT();
  const context = useMemo(
    () => ({
      recordType,
      recordId,
      locale,
      instruction: t("ai.externalHelper"),
      fields: fields ?? { original },
    }),
    [recordType, recordId, locale, fields, original, t],
  );
  if (!original.trim()) return null;
  return (
    <div className="flex flex-col gap-3">
      <RefineControls
        original={original}
        refined={refined}
        translated={translated}
        purpose={purpose}
        onRefined={(r) => actions.patch(collection, recordId, { refined: r })}
        onTranslated={(tr) => actions.patch(collection, recordId, { translated: tr })}
      />
      <ExternalAssist
        context={context}
        onImport={(p) => {
          if (p.refined) actions.patch(collection, recordId, { refined: makeRefinement(p.refined, "external", "external") });
          if (p.translated)
            actions.patch(collection, recordId, {
              translated: makeTranslation(p.translated.locale, p.translated.text, "external", "external"),
            });
        }}
      />
    </div>
  );
}
