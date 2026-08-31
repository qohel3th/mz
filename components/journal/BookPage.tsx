"use client";

import type { JournalEntry } from "@/lib/domain/types";
import { formatDate } from "@/lib/i18n";
import { useT } from "@/lib/i18n/useT";
import { UserText, cn } from "@/components/ui";

export interface BookPageProps {
  /** a saved entry → read-only page */
  entry?: JournalEntry;
  /** the blank "today" page: current draft text */
  draft?: string;
  /** set on the first keystroke; drives the stamp line */
  startedAt?: string;
  onChange?: (v: string) => void;
  className?: string;
  /** the textarea is only mounted on the visible blank page */
  active?: boolean;
}

function stamp(locale: Parameters<typeof formatDate>[0], date: string, at: string): string {
  const time = new Date(at).toLocaleTimeString(locale === "he" ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit" });
  return `${formatDate(locale, date)} · ${time}`;
}

/** One parchment page: a small handwritten date·time stamp on top, then the entry text or the ink textarea. */
export function BookPage({ entry, draft = "", startedAt, onChange, className, active }: BookPageProps) {
  const { t, locale } = useT();
  const line = entry ? stamp(locale, entry.date, entry.createdAt) : startedAt ? stamp(locale, startedAt.slice(0, 10), startedAt) : "";

  return (
    <div className={cn("book-page", className)}>
      <svg className="book-page-grain" width="100%" height="100%" aria-hidden>
        <filter id="book-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="11" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#book-grain)" />
      </svg>

      <p dir="auto" className="font-script-he ink relative z-[1] h-[1.9rem] shrink-0 text-base leading-[1.9rem] opacity-80">
        {line}
      </p>

      {entry ? (
        <UserText
          as="div"
          multiline
          text={entry.body}
          className="font-script-he ink relative z-[1] min-h-0 flex-1 overflow-y-auto text-[1.35rem] leading-[1.9rem]"
        />
      ) : active ? (
        <textarea
          dir="auto"
          value={draft}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={t("journal.blankPage")}
          aria-label={t("journal.body")}
          className="ink-input font-script-he ink relative z-[1] min-h-0 w-full flex-1 text-[1.35rem] leading-[1.9rem]"
        />
      ) : (
        <div className="min-h-0 flex-1" />
      )}
    </div>
  );
}
