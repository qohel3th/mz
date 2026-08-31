"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { JournalEntry } from "@/lib/domain/types";
import { nowIso } from "@/lib/domain/ids";
import { makeT } from "@/lib/i18n";
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
  /** controlled open state (the page shows a save button while open) */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** receives a "save now" function so the page can flush the draft on demand */
  saveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

const SWIPE_PX = 40;
const EDGE = 0.18;
const FLIP_MS = 600;
const SAVE_DEBOUNCE_MS = 800;

/** The closed cover: an old letter — stained rough-edged paper, envelope flap, wax seal, twine, faint postmark. */
function LetterFace() {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="none" className="book-letter" aria-hidden>
      <defs>
        <filter id="ltr-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="ltr-mottle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="4" seed="9" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.08  0 0 0 0.55 0" />
        </filter>
        <filter id="ltr-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" result="g" />
          <feComponentTransfer in="g">
            <feFuncA type="table" tableValues="0 0.22" />
          </feComponentTransfer>
        </filter>
        <filter id="ltr-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="ltr-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#2a180a" floodOpacity="0.6" />
        </filter>
        <radialGradient id="ltr-wax" cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#b8342e" />
          <stop offset="0.55" stopColor="#7e1a17" />
          <stop offset="1" stopColor="#4a0c0b" />
        </radialGradient>
        <linearGradient id="ltr-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2d1a8" />
          <stop offset="0.5" stopColor="#d3bf92" />
          <stop offset="1" stopColor="#b99f6c" />
        </linearGradient>
      </defs>

      {/* paper with rough edges */}
      <g filter="url(#ltr-rough)">
        <rect x="9" y="9" width="282" height="382" rx="2" fill="url(#ltr-paper)" />
      </g>
      <rect x="9" y="9" width="282" height="382" filter="url(#ltr-mottle)" opacity="0.55" style={{ mixBlendMode: "multiply" }} />
      <rect x="9" y="9" width="282" height="382" filter="url(#ltr-grain)" style={{ mixBlendMode: "multiply" }} />
      {/* burnt / foxed edges */}
      <rect x="9" y="9" width="282" height="382" rx="2" fill="none" stroke="#6a4a22" strokeWidth="18" opacity="0.28" filter="url(#ltr-blur)" />
      {/* stains */}
      <ellipse cx="236" cy="96" rx="34" ry="22" fill="#7a5426" opacity="0.16" filter="url(#ltr-blur)" />
      <ellipse cx="70" cy="330" rx="26" ry="16" fill="#7a5426" opacity="0.14" filter="url(#ltr-blur)" />
      <circle cx="222" cy="300" r="14" fill="none" stroke="#7a5426" strokeWidth="3" opacity="0.14" filter="url(#ltr-blur)" />

      {/* envelope flap */}
      <path d="M 10 10 L 150 172 L 290 10" fill="#cbb686" opacity="0.55" />
      <path d="M 10 10 L 150 172 L 290 10" fill="none" stroke="#5b3d1e" strokeWidth="1" opacity="0.55" />
      <path d="M 10 10 L 150 172 L 290 10" fill="none" stroke="#2a180a" strokeWidth="6" opacity="0.18" filter="url(#ltr-blur)" />

      {/* faint postmark */}
      <g transform="translate(232 62) rotate(-14)" opacity="0.28" stroke="#3b2a16" fill="none">
        <circle r="26" strokeWidth="1.4" />
        <circle r="21" strokeWidth="0.8" />
        <path d="M -60 -6 h 120 M -60 0 h 120 M -60 6 h 120" strokeWidth="1.2" strokeDasharray="3 2" />
      </g>

      {/* twine: shadow, base, twist */}
      <g strokeLinecap="round">
        <path d="M -4 246 C 80 250, 200 242, 304 248 M 118 -4 C 114 120, 122 280, 116 404" stroke="#2a180a" strokeWidth="9" opacity="0.35" filter="url(#ltr-blur)" />
        <path d="M -4 246 C 80 250, 200 242, 304 248 M 118 -4 C 114 120, 122 280, 116 404" stroke="#6b4a2a" strokeWidth="6" />
        <path d="M -4 246 C 80 250, 200 242, 304 248 M 118 -4 C 114 120, 122 280, 116 404" stroke="#a5804f" strokeWidth="6" strokeDasharray="2.5 4.5" />
        {/* knot + loose ends */}
        <path d="M 118 246 c -14 -10, -30 10, -16 22 M 118 246 c 16 12, 34 -6, 22 -20" stroke="#6b4a2a" strokeWidth="5" fill="none" />
        <path d="M 118 246 c -14 -10, -30 10, -16 22 M 118 246 c 16 12, 34 -6, 22 -20" stroke="#a5804f" strokeWidth="5" strokeDasharray="2.5 4.5" fill="none" />
        <ellipse cx="118" cy="247" rx="9" ry="7" fill="#5a3d20" stroke="#3b2a16" strokeWidth="1" filter="url(#ltr-shadow)" />
      </g>

      {/* wax seal on the flap */}
      <g transform="translate(150 174)" filter="url(#ltr-shadow)">
        <path d="M -22 -2 C -24 -14, -12 -24, 0 -23 C 12 -24, 24 -14, 22 -1 C 25 11, 12 23, 0 22 C -12 24, -25 12, -22 -2 Z" fill="url(#ltr-wax)" filter="url(#ltr-rough)" />
        <circle r="14" fill="none" stroke="#3d0908" strokeWidth="1" opacity="0.6" />
        <text y="5" textAnchor="middle" fontSize="12" fontFamily="var(--font-display)" fontWeight="700" fill="#3d0908" opacity="0.85">
          MZ
        </text>
        <text y="5" textAnchor="middle" fontSize="12" fontFamily="var(--font-display)" fontWeight="700" fill="#d97c72" opacity="0.35" transform="translate(-0.6 -0.8)">
          MZ
        </text>
      </g>
    </svg>
  );
}

/** The diary itself is Hebrew: its strings, stamps and reading direction stay Hebrew whatever the app chrome is. */
const tHe = makeT("he");

/** An old letter tied with twine → tap the dog-ear to open onto parchment pages you flip through (spine on the right). */
export function Book({ entries, onCreate, onAppend, draftEntry, className, open, onOpenChange, saveRef }: BookProps) {
  const t = tHe;
  const setOpen = onOpenChange;
  // a Hebrew book: spine on the right, pages turn from the left, whatever <html dir> says
  const rtl = true;

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

  /** flush the draft immediately (used by the save button); safe to call with nothing pending */
  const saveNow = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const body = latestBody.current;
    if (draftEntry) {
      if (body !== savedBody.current) {
        savedBody.current = body;
        await onAppend(draftEntry, body);
      }
    } else if (!creating.current && startedAt && body.trim()) {
      creating.current = true;
      savedBody.current = body;
      try {
        await onCreate(body, startedAt);
      } finally {
        creating.current = false;
      }
    }
  };
  useEffect(() => {
    if (saveRef) saveRef.current = saveNow;
  });

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
    const sign = rtl ? -1 : 1;
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
    <div dir="rtl" className={cn("book-scene", className)}>
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
        <LetterFace />
        <div className="book-title font-script-he ink" aria-hidden>
          {t("journal.coverTitle")}
        </div>
        <button type="button" className="book-corner" aria-label={t("journal.open")} onClick={() => setOpen(true)}>
          <span className="book-corner-fold" aria-hidden />
        </button>
      </div>
    </div>
  );
}
