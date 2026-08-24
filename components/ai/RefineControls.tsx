"use client";

import { useState } from "react";
import type { AiRefinement, AiTranslation } from "@/lib/domain/types";
import { useT } from "@/lib/i18n/useT";
import { getAiProvider, makeRefinement, makeTranslation, otherLocale, type RefinePurpose } from "@/lib/ai";
import { Button, UserText, cn } from "@/components/ui";
import { Spinner } from "./Spinner";

export interface RefineControlsProps {
  original: string;
  refined?: AiRefinement;
  translated?: AiTranslation;
  purpose: RefinePurpose;
  onRefined(r: AiRefinement): void;
  onTranslated(t: AiTranslation): void;
  className?: string;
}

type Tab = "original" | "refined" | "translated";

/**
 * Refine / Translate buttons + a 3-tab view (Original / Refined / Translated).
 * The original is always shown as-is; results are handed back via callbacks
 * so the caller stores them ALONGSIDE the original (never overwriting it).
 */
export function RefineControls({
  original,
  refined,
  translated,
  purpose,
  onRefined,
  onTranslated,
  className,
}: RefineControlsProps) {
  const { t, locale } = useT();
  const [tab, setTab] = useState<Tab>("original");
  const [refining, setRefining] = useState(false);
  const [translating, setTranslating] = useState(false);
  const target = otherLocale(locale);
  const hasText = original.trim().length > 0;

  async function refine() {
    if (!hasText || refining) return;
    setRefining(true);
    try {
      const provider = getAiProvider();
      const { text } = await provider.refine({ text: original, locale, purpose });
      onRefined(makeRefinement(text, provider.name, "internal"));
      setTab("refined");
    } finally {
      setRefining(false);
    }
  }

  async function translate() {
    if (!hasText || translating) return;
    setTranslating(true);
    try {
      const provider = getAiProvider();
      const { text } = await provider.translate({ text: original, from: locale, to: target });
      onTranslated(makeTranslation(target, text, provider.name, "internal"));
      setTab("translated");
    } finally {
      setTranslating(false);
    }
  }

  const tabs: Array<{ id: Tab; label: string; available: boolean }> = [
    { id: "original", label: t("ai.original"), available: true },
    { id: "refined", label: t("ai.refined"), available: !!refined },
    { id: "translated", label: t("ai.translated"), available: !!translated },
  ];

  const shown = tab === "refined" ? refined?.text : tab === "translated" ? translated?.text : original;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={refine}
          disabled={!hasText || refining}
          icon={refining ? <Spinner /> : undefined}
        >
          {refining ? t("ai.refining") : t("ai.refine")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={translate}
          disabled={!hasText || translating}
          icon={translating ? <Spinner /> : undefined}
        >
          {translating ? t("ai.translating") : t("ai.translate")}
          <span className="text-xs uppercase text-fg-faint">{target}</span>
        </Button>
      </div>

      <div role="tablist" className="flex gap-1 rounded-full bg-bg-3/60 p-1">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={cn(
              "flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition",
              tab === x.id ? "bg-panel-strong text-fg shadow" : "text-fg-muted hover:text-fg",
              !x.available && tab !== x.id && "opacity-50",
            )}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="rounded-[var(--radius)] border border-border bg-bg-3/40 p-3 text-sm">
        {shown ? (
          <UserText as="p" multiline text={shown} />
        ) : (
          <p className="text-fg-faint">{hasText ? t("ai.notYet") : t("ai.empty")}</p>
        )}
        {tab !== "original" && (refined || translated) && (
          <p className="mt-2 text-[11px] text-fg-faint">
            {tab === "refined" && refined ? `${refined.provider} · ${refined.origin}` : null}
            {tab === "translated" && translated
              ? `${translated.provider} · ${translated.origin} · ${translated.locale}`
              : null}
          </p>
        )}
      </div>

      <p className="text-[11px] text-fg-faint">{t("ai.mock")}</p>
    </div>
  );
}
