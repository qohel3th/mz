"use client";

import { useMemo, useState } from "react";
import type { PatternHypothesis } from "@/lib/domain/types";
import { newId, nowIso } from "@/lib/domain/ids";
import { useHydrated, useJournal, usePatterns, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { getAiProvider } from "@/lib/ai";
import { Button, Panel, ProgressBar, UserText, cn } from "@/components/ui";
import { Spinner } from "./Spinner";

export interface PatternPanelProps {
  warriorId: string;
  className?: string;
}

/**
 * Runs the provider's pattern detection over the warrior's journal and
 * renders the non-dismissed hypotheses as dismissible cards.
 */
export function PatternPanel({ warriorId, className }: PatternPanelProps) {
  const { t, locale } = useT();
  const hydrated = useHydrated();
  const entries = useJournal(warriorId);
  const patterns = usePatterns(warriorId);
  const { actions } = useStore();
  const [detecting, setDetecting] = useState(false);
  const [lastRun, setLastRun] = useState<number | null>(null);

  const visible = useMemo(
    () =>
      patterns
        .filter((p) => !p.dismissed)
        .sort((a, b) => b.confidence - a.confidence || (a.createdAt < b.createdAt ? 1 : -1)),
    [patterns],
  );

  async function detect() {
    if (detecting || entries.length === 0) return;
    setDetecting(true);
    try {
      const provider = getAiProvider();
      const results = await provider.detectPatterns({
        warriorId,
        locale,
        entries: entries.map((e) => ({
          id: e.id,
          date: e.date,
          text: [e.title, e.body].filter(Boolean).join("\n"),
          mood: e.mood,
          tags: e.tags,
        })),
      });
      const now = nowIso();
      for (const r of results) {
        const existing = patterns.find((p) => p.title === r.title);
        if (existing) {
          await actions.patch("patterns", existing.id, {
            hypothesis: r.hypothesis,
            evidence: r.evidence,
            confidence: r.confidence,
            provider: provider.name,
            updatedAt: now,
          });
        } else {
          const record: PatternHypothesis = {
            ...r,
            id: newId("pat"),
            warriorId,
            dismissed: false,
            provider: provider.name,
            createdAt: now,
            updatedAt: now,
          };
          await actions.upsert("patterns", record);
        }
      }
      setLastRun(results.length);
    } finally {
      setDetecting(false);
    }
  }

  const detectButton = (
    <Button
      size="sm"
      variant="secondary"
      onClick={detect}
      disabled={!hydrated || detecting || entries.length === 0}
      icon={detecting ? <Spinner /> : undefined}
    >
      {detecting ? t("ai.detecting") : t("ai.detect")}
    </Button>
  );

  if (!hydrated) {
    return (
      <Panel title={t("ai.patterns")} className={className}>
        <div className="flex flex-col gap-2">
          <div className="skeleton h-9 w-36 rounded-full" />
          <div className="skeleton h-20 w-full" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel title={t("ai.patterns")} action={detectButton} className={className}>
      <div className="flex flex-col gap-3">
        {visible.length === 0 && (
          <p className="text-sm text-fg-muted">
            {entries.length === 0 ? t("ai.noEntries") : lastRun === 0 ? t("ai.nothingFound") : t("ai.noPatterns")}
          </p>
        )}

        {visible.map((p) => (
          <article
            key={p.id}
            className="animate-fade-in rounded-[var(--radius)] border border-border bg-bg-3/40 p-3"
          >
            <header className="mb-1 flex items-start justify-between gap-2">
              <UserText as="h4" text={p.title} className="text-sm font-semibold text-fg" />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 px-2 text-xs"
                onClick={() => actions.patch("patterns", p.id, { dismissed: true, updatedAt: nowIso() })}
              >
                {t("ai.dismiss")}
              </Button>
            </header>
            <UserText as="p" multiline text={p.hypothesis} className="text-sm text-fg-muted" />

            {p.evidence.length > 0 && (
              <div className="mt-2">
                <p className="text-[11px] uppercase tracking-widest text-fg-faint">{t("ai.evidence")}</p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {p.evidence.map((ev, i) => (
                    <li key={i} className="flex gap-1.5 text-xs text-fg-muted">
                      <span aria-hidden="true" className="text-gold">
                        ·
                      </span>
                      <UserText text={ev} className="min-w-0 break-words" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-2 flex items-center gap-2">
              <ProgressBar
                value={p.confidence}
                tone={p.confidence >= 0.65 ? "gold" : "accent"}
                className="flex-1"
                label={t("ai.confidence", { pct: Math.round(p.confidence * 100) })}
              />
              <span className={cn("shrink-0 text-[11px] tabular-nums text-fg-faint")}>
                {t("ai.confidence", { pct: Math.round(p.confidence * 100) })}
              </span>
            </div>
          </article>
        ))}

        <p className="text-[11px] text-fg-faint">{t("ai.mock")}</p>
      </div>
    </Panel>
  );
}
