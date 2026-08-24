"use client";

import { useState } from "react";
import type { Reflection, ReflectionCadence } from "@/lib/domain/types";
import { formatDate } from "@/lib/i18n";
import { useT } from "@/lib/i18n/useT";
import { Panel, UserText, cn } from "@/components/ui";
import { RecordAssist } from "@/components/ai";

interface ReflectionHistoryProps {
  cadence: ReflectionCadence;
  reflections: Reflection[];
  /** periodKey of the current period — excluded from history */
  currentKey: string;
}

/** Expandable list of past reflections for one cadence, newest first. */
export function ReflectionHistory({ cadence, reflections, currentKey }: ReflectionHistoryProps) {
  const { t, locale } = useT();
  const [openId, setOpenId] = useState<string | null>(null);

  const past = reflections
    .filter((r) => r.cadence === cadence && r.periodKey !== currentKey && r.completedAt)
    .sort((a, b) => (a.periodKey < b.periodKey ? 1 : a.periodKey > b.periodKey ? -1 : 0));

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-sm uppercase tracking-widest text-gold">{t("reflections.history")}</h2>
      {past.length === 0 ? (
        <Panel className="text-center text-sm text-fg-muted">{t("reflections.historyEmpty")}</Panel>
      ) : (
        <ul className="flex flex-col gap-3">
          {past.map((r) => {
            const open = openId === r.id;
            const filled = r.answers.filter((a) => a.answer.trim());
            return (
              <li key={r.id}>
                <Panel padded={false}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : r.id)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-start"
                  >
                    <span className="flex flex-col">
                      <span className="font-display text-lg text-fg">{r.periodKey}</span>
                      <span className="text-xs text-fg-faint">
                        {r.completedAt && t("reflections.completedOn", { date: formatDate(locale, r.completedAt) })}
                      </span>
                    </span>
                    <span className={cn("text-fg-faint transition-transform", open && "rotate-180")} aria-hidden>
                      ⌄
                    </span>
                  </button>
                  {open && (
                    <div className="flex flex-col gap-4 border-t border-border px-4 pb-4 pt-3 animate-fade-in">
                      {filled.map((a) => (
                        <div key={a.promptKey} className="flex flex-col gap-1">
                          <UserText as="p" text={a.prompt} className="text-xs text-gold-2" />
                          <UserText as="p" multiline text={a.answer} className="text-sm leading-relaxed text-fg" />
                        </div>
                      ))}
                      <RecordAssist
                        collection="reflections"
                        recordId={r.id}
                        recordType="reflection"
                        purpose="reflection"
                        original={filled.map((a) => `${a.prompt}\n${a.answer}`).join("\n\n")}
                        refined={r.refined}
                        translated={r.translated}
                      />
                    </div>
                  )}
                </Panel>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
