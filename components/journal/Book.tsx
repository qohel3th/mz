"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { JournalEntry } from "@/lib/domain/types";
import { nowIso } from "@/lib/domain/ids";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/components/ui";
import { BookPage } from "./BookPage";

export interface BookProps {
  entries: JournalEntry[];
  /** first non-empty keystroke on the blank page, debounced → creates the entry (grants XP once) */
  onCreate: (body: string, startedAt: string) => Promise<void>;
  /** later keystrokes on the same page → patch the entry */
  onAppend: (entry: JournalEntry, body: string) => Promise<void>;
  /** the entry created from this session's blank page; it stays on the blank page, editable */
  draftEntry?: JournalEntry;
  className?: string;
}

const SWIPE_PX = 40;
const EDGE = 0.18;
const FLIP_MS = 600;
const SAVE_DEBOUNCE_MS = 800;

function Flourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 34" className={cn("book-ornament", className)} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden>
      <path d="M3 3 C 14 4, 20 8, 22 18 M3 3 C 4 14, 8 20, 18 22" />
      <path d="M3 3 c 6 2, 9 5, 10 10 M3 3 c 2 6, 5 9, 10 10" opacity="0.7" />
      <circle cx="24" cy="24" r="1.6" fill="currentColor" stroke="none" />
      <path d="M28 6 c -2 3, -2 5, 0 8 M6 28 c 3 -2, 5 -2, 8 0" opacity="0.6" />
    </svg>
  );
}

/** Closed leather cover with a dog-eared corner → tap opens onto parchment pages you flip through. */
export function Book({ entries, onCreate, onAppend, draftEntry, className }: BookProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  // read once on the client — no SSR access to document
  const rtlRef = useRef(false);
  useEffect(() => {
    rtlRef.current = document.documentElement.dir === "rtl";
  }, []);

  // oldest → newest, blank page last (the store hook sorts newest-first; reverse locally)
  const pages = useMemo(() => {
    const list = entries
      .filter((e) => e.id !== draftEntry?.id)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
    return [...list, null] as (JournalEntry | null)[];
  }, [entries, draftEntry?.id]);
  const blankIndex = pages.length - 1;

  const [pageIndex, setPageIndex] = useState(blankIndex);
  const [anim, setAnim] = useState<{ phase: "out" | "in"; to: number } | null>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // draft state for the blank page
  const [draft, setDraft] = useState(draftEntry?.body ?? "");
  const [startedAt, setStartedAt] = useState<string | undefined>(draftEntry?.createdAt);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creating = useRef(false);
  const latestBody = useRef(draft);
  const savedBody = useRef(draftEntry?.body ?? "");

  // once the created entry arrives, flush anything typed while the create was in flight
  useEffect(() => {
    if (draftEntry && latestBody.current !== savedBody.current && !creating.current) {
      savedBody.current = latestBody.current;
      void onAppend(draftEntry, latestBody.current);
    }
  }, [draftEntry, onAppend]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (animRef.current) clearTimeout(animRef.current);
    },
    [],
  );

  const onDraftChange = (v: string) => {
    setDraft(v);
    latestBody.current = v;
    let started = startedAt;
    if (!started && v.trim()) {
      started = nowIso();
      setStartedAt(started);
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (!v.trim() && !draftEntry) return;
    saveTimer.current = setTimeout(async () => {
      const body = latestBody.current;
      if (draftEntry) {
        if (body === savedBody.current) return;
        savedBody.current = body;
        await onAppend(draftEntry, body);
      } else if (!creating.current && started) {
        creating.current = true;
        savedBody.current = body;
        try {
          await onCreate(body, started);
        } finally {
          creating.current = false;
        }
      }
    }, SAVE_DEBOUNCE_MS);
  };

  const go = (to: number) => {
    if (anim || to < 0 || to >= pages.length || to === pageIndex) return;
    setAnim({ phase: "out", to });
    animRef.current = setTimeout(() => {
      setPageIndex(to);
      setAnim({ phase: "in", to });
      animRef.current = setTimeout(() => setAnim(null), FLIP_MS);
    }, FLIP_MS);
  };
  const next = () => go(pageIndex + 1);
  const prev = () => go(pageIndex - 1);

  // swipe / edge-tap on the page stack
  const downX = useRef<number | null>(null);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    downX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (downX.current === null) return;
    const dx = e.clientX - downX.current;
    downX.current = null;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    // logical: +1 = toward the next page. LTR: swipe left / tap right edge. RTL: mirrored.
    const rtl = rtlRef.current;
    const sign = rtl ? -1 : 1;
    if (Math.abs(dx) > SWIPE_PX) {
      if (dx * sign < 0) next();
      else prev();
      return;
    }
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    const rel = (e.clientX - rect.left) / rect.width; // 0 = left edge
    const outer = rtl ? rel < EDGE : rel > 1 - EDGE;
    const inner = rtl ? rel > 1 - EDGE : rel < EDGE;
    if (outer) next();
    else if (inner) prev();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    const sign = rtlRef.current ? -1 : 1;
    if (e.key === "ArrowRight") {
      if (sign > 0) next();
      else prev();
    } else if (e.key === "ArrowLeft") {
      if (sign > 0) prev();
      else next();
    } else return;
    e.preventDefault();
  };

  const renderPage = (i: number, cls: string) => {
    const entry = pages[i];
    return (
      <BookPage
        key={entry ? entry.id : "blank"}
        entry={entry ?? undefined}
        draft={entry ? undefined : draft}
        startedAt={entry ? undefined : startedAt}
        onChange={entry ? undefined : onDraftChange}
        active={!entry && i === pageIndex && open}
        className={cls}
      />
    );
  };

  return (
    <div className={cn("book-scene", className)}>
      {/* pages */}
      <div
        className="book-pages"
        role="group"
        aria-roledescription="book"
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (downX.current = null)}
        onKeyDown={onKeyDown}
      >
        {pageIndex > 0 && renderPage(pageIndex - 1, "book-page-behind")}
        {pageIndex < pages.length - 1 && renderPage(pageIndex + 1, "book-page-behind")}
        {renderPage(
          pageIndex,
          cn("book-page-current", anim?.phase === "out" && "book-page-flip-out", anim?.phase === "in" && "book-page-flip-in"),
        )}

        {open && (
          <>
            <button type="button" className="book-close" aria-label={t("journal.close")} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <span className="sr-only">
              {t("journal.prevPage")} / {t("journal.nextPage")}
            </span>
          </>
        )}
      </div>

      {/* cover */}
      <div className={cn("book-cover", open && "book-cover-open")} aria-hidden={open}>
        <div className="book-spine" aria-hidden />
        <Flourish className="left-4 top-4" />
        <Flourish className="right-4 top-4 -scale-x-100" />
        <Flourish className="bottom-4 left-4 -scale-y-100" />
        <div className="book-monogram" aria-hidden>
          <span className="book-monogram-ring">
            <span className="font-display text-gild text-3xl font-semibold tracking-[-0.02em]">MZ</span>
          </span>
        </div>
        <button type="button" className="book-corner" aria-label={t("journal.open")} onClick={() => setOpen(true)}>
          <span className="book-corner-fold" aria-hidden />
        </button>
      </div>
    </div>
  );
}
