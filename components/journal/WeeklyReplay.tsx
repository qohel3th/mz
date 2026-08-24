"use client";

import { useEffect, useMemo, useRef } from "react";
import type { JournalEntry } from "@/lib/domain/types";
import { lastDays } from "@/lib/domain/dates";
import { todayKey } from "@/lib/domain/ids";
import { formatDate } from "@/lib/i18n";
import { useT } from "@/lib/i18n/useT";
import { UserText, cn } from "@/components/ui";
import { MOOD_GLYPH } from "./moods";

interface WeeklyReplayProps {
  entries: JournalEntry[];
  onOpenEntry: (entry: JournalEntry) => void;
  onWriteFor: (date: string) => void;
}

/** Horizontal scroll-snap strip: one card per day for the last 7 days, oldest to newest. */
export function WeeklyReplay({ entries, onOpenEntry, onWriteFor }: WeeklyReplayProps) {
  const { t, locale } = useT();
  const today = todayKey();
  const days = useMemo(() => lastDays(today, 7), [today]);
  const lastRef = useRef<HTMLDivElement>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const e of entries) {
      const list = map.get(e.date);
      if (list) list.push(e);
      else map.set(e.date, [e]);
    }
    return map;
  }, [entries]);

  useEffect(() => {
    lastRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, []);

  return (
    <section aria-label={t("journal.weeklyReplay")} className="flex flex-col gap-2">
      <header className="flex items-baseline justify-between gap-3 px-1">
        <h2 className="text-sm uppercase tracking-widest text-gold">{t("journal.weeklyReplay")}</h2>
        <span className="text-xs text-fg-faint">{t("journal.replayHint")}</span>
      </header>
      <div className="snap-x-mandatory -mx-4 flex gap-3 overflow-x-auto px-[7.5vw] py-2">
        {days.map((day, i) => {
          const list = byDay.get(day) ?? [];
          const isToday = day === today;
          const isLast = i === days.length - 1;
          return (
            <div
              key={day}
              ref={isLast ? lastRef : undefined}
              className={cn(
                "snap-child panel flex w-[85vw] max-w-[340px] shrink-0 flex-col gap-2 p-4",
                isToday && "panel-accent rivets",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-widest text-fg-muted">
                  {formatDate(locale, day, { weekday: "short", day: "numeric", month: "short" })}
                </span>
                {isToday && <span className="text-[10px] uppercase tracking-[0.2em] text-gold-2">{t("common.today")}</span>}
              </div>

              {list.length === 0 ? (
                <button
                  type="button"
                  onClick={() => onWriteFor(day)}
                  className="flex min-h-24 flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius)] border border-dashed border-border text-sm text-fg-faint transition hover:border-gold hover:text-fg-muted"
                >
                  <span>{t("journal.nothingThatDay")}</span>
                  <span className="text-xs text-accent-2">{t("journal.new")}</span>
                </button>
              ) : (
                <ul className="flex flex-col gap-2">
                  {list.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onOpenEntry(e)}
                        className="flex w-full flex-col gap-1 rounded-[var(--radius)] bg-bg-3/50 px-3 py-2 text-start transition hover:bg-bg-3"
                      >
                        <span className="flex items-center gap-2">
                          {e.mood && <span aria-hidden>{MOOD_GLYPH[e.mood]}</span>}
                          <UserText
                            text={e.title || e.body.split("\n")[0]}
                            className="line-clamp-1 flex-1 text-sm font-medium text-fg"
                          />
                        </span>
                        {e.title && <UserText text={e.body} className="line-clamp-2 text-xs text-fg-muted" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
