"use client";

import type { JournalEntry } from "@/lib/domain/types";
import { formatDate, makeT } from "@/lib/i18n";
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
  /** 1-based page number and total, shown at the foot of the page */
  pageNumber: number;
  pageCount: number;
  /** older page (toward the front of the book) / newer page */
  onOlder?: () => void;
  onNewer?: () => void;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

/** The diary is Hebrew: its date stamp and prompts stay Hebrew whatever the app chrome is. */
const tHe = makeT("he");
function stamp(date: string, at: string): string {
  const time = new Date(at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  return `${formatDate("he", date, { dateStyle: "long" })} · ${time}`;
}

/** One parchment page: a small handwritten date·time stamp on top, then the entry text or the ink textarea. */
export function BookPage({ entry, draft = "", startedAt, onChange, className, active, pageNumber, pageCount, onOlder, onNewer }: BookPageProps) {
  const t = tHe;
  const line = entry ? stamp(entry.date, entry.createdAt) : startedAt ? stamp(startedAt.slice(0, 10), startedAt) : "";

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

      {/* foot: older ‹ · n / N · › newer — a Hebrew book: the front (older pages) is to the right */}
      <div className="book-foot relative z-[1] mt-1 flex shrink-0 items-center justify-between" dir="rtl">
        <button type="button" className="book-nav" aria-label={t("journal.prevPage")} disabled={!onOlder} onClick={onOlder}>
          <Chevron dir="right" />
        </button>
        <span className="font-script-he ink text-lg tabular-nums opacity-80" dir="ltr">
          {pageNumber} / {pageCount}
        </span>
        <button type="button" className="book-nav" aria-label={t("journal.nextPage")} disabled={!onNewer} onClick={onNewer}>
          <Chevron dir="left" />
        </button>
      </div>
    </div>
  );
}
