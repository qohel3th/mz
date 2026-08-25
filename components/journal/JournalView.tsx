"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { JournalEntry } from "@/lib/domain/types";
import { newId, nowIso, todayKey } from "@/lib/domain/ids";
import { formatDate } from "@/lib/i18n";
import { useT } from "@/lib/i18n/useT";
import { useActiveWarrior, useHydrated, useJournal, useStore } from "@/lib/store";
import { Button, Panel, Sheet, UserText } from "@/components/ui";
import { EntryComposer, draftFromEntry, type EntryDraft } from "./EntryComposer";
import { EntrySheet } from "./EntrySheet";
import { WeeklyReplay } from "./WeeklyReplay";
import { MOOD_GLYPH } from "./moods";
import { PatternPanel } from "@/components/ai";

const JOURNAL_XP = 15;

export function JournalView() {
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();
  const { t, locale } = useT();
  const { actions } = useStore();
  const entries = useJournal(warrior?.id);

  const [composeDate, setComposeDate] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const openEntry = useMemo(() => entries.find((e) => e.id === openId) ?? null, [entries, openId]);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-40 w-full" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  if (!warrior) {
    return (
      <div className="px-4 py-6">
        <Panel variant="accent" rivets title={t("journal.title")}>
          <p className="mb-4 text-sm text-fg-muted">{t("journal.noWarrior")}</p>
          <Link href="/" className="inline-flex">
            <Button variant="gold">{t("journal.chooseWarrior")}</Button>
          </Link>
        </Panel>
      </div>
    );
  }

  const warriorId = warrior.id;

  const createEntry = async (draft: EntryDraft) => {
    const now = nowIso();
    const entry: JournalEntry = {
      id: newId("jr"),
      warriorId,
      date: draft.date,
      title: draft.title || undefined,
      body: draft.body,
      mood: draft.mood,
      tags: draft.tags,
      domain: draft.domain,
      createdAt: now,
      updatedAt: now,
    };
    await actions.upsert("journal", entry);
    // XP + streak only for NEW entries — edits and deletes never touch progress.
    await actions.grantXp({
      warriorId,
      baseAmount: JOURNAL_XP,
      source: "journal",
      refId: entry.id,
      domain: entry.domain,
      date: entry.date,
    });
    await actions.recordActivity(warriorId, entry.date);
    setComposeDate(null);
  };

  const updateEntry = async (entry: JournalEntry, draft: EntryDraft) => {
    await actions.patch("journal", entry.id, {
      date: draft.date,
      title: draft.title || undefined,
      body: draft.body,
      mood: draft.mood,
      tags: draft.tags,
      domain: draft.domain,
      updatedAt: nowIso(),
    });
  };

  const deleteEntry = async (entry: JournalEntry) => {
    await actions.remove("journal", entry.id);
    setOpenId(null);
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="font-display text-gild text-2xl leading-tight">{t("journal.title")}</h1>
          <span className="text-xs text-fg-faint">{t("journal.xpHint")}</span>
        </div>
        <Button onClick={() => setComposeDate(todayKey())}>{t("journal.new")}</Button>
      </header>

      <WeeklyReplay entries={entries} onOpenEntry={(e) => setOpenId(e.id)} onWriteFor={(d) => setComposeDate(d)} />

      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-3 px-1">
          <h2 className="text-sm uppercase tracking-widest text-gold">{t("journal.entries")}</h2>
          <span className="text-xs tabular-nums text-fg-faint">
            {entries.length === 1 ? t("journal.oneEntry") : t("journal.entryCount", { count: entries.length })}
          </span>
        </header>

        {entries.length === 0 ? (
          <Panel rivets className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-fg-muted">{t("journal.empty")}</p>
            <Button variant="secondary" size="sm" onClick={() => setComposeDate(todayKey())}>
              {t("journal.writeToday")}
            </Button>
          </Panel>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((e) => (
              <li key={e.id}>
                <Panel
                  padded={false}
                  className="transition hover:border-border-strong"
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenId(e.id)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      setOpenId(e.id);
                    }
                  }}
                >
                  <div className="flex cursor-pointer flex-col gap-2 p-4">
                    <div className="flex items-center justify-between gap-2 text-xs text-fg-muted">
                      <span>{formatDate(locale, e.date)}</span>
                      <span className="flex items-center gap-2">
                        {e.domain && <span className="text-accent-2">{t(`domains.${e.domain}`)}</span>}
                        {e.mood && <span aria-hidden>{MOOD_GLYPH[e.mood]}</span>}
                      </span>
                    </div>
                    {e.title && <UserText as="h3" text={e.title} className="font-display text-lg leading-snug text-fg" />}
                    <UserText as="p" multiline text={e.body} className="line-clamp-4 text-sm leading-relaxed text-fg-muted" />
                    {e.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {e.tags.map((tag) => (
                          <UserText key={tag} className="text-xs text-fg-faint" text={`#${tag}`} />
                        ))}
                      </div>
                    )}
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PatternPanel warriorId={warrior.id} />

      <Sheet open={composeDate !== null} onClose={() => setComposeDate(null)} title={t("journal.new")}>
        {composeDate !== null && (
          <EntryComposer
            initial={draftFromEntry(null, composeDate)}
            onCancel={() => setComposeDate(null)}
            onSave={createEntry}
          />
        )}
      </Sheet>

      <EntrySheet entry={openEntry} onClose={() => setOpenId(null)} onSave={updateEntry} onDelete={deleteEntry} />
    </div>
  );
}

export default JournalView;
