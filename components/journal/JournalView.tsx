"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { JournalEntry } from "@/lib/domain/types";
import { newId, nowIso, todayKey } from "@/lib/domain/ids";
import { useT } from "@/lib/i18n/useT";
import { useActiveWarrior, useHydrated, useJournal, useStore } from "@/lib/store";
import { Button, Panel } from "@/components/ui";
import { Book } from "./Book";

const JOURNAL_XP = 15;

/** header 3.5rem + 1px border, main pt-4 (1rem), nav pad 5rem (+ safe-bottom), per AppShell. */
const WRAPPER = "flex h-[calc(100dvh-3.5rem-1px-1rem-5rem-var(--safe-bottom))] flex-col items-center gap-3 overflow-hidden";

/** One-screen antique book: closed cover → parchment pages, one entry per page, blank "today" page last. */
export function JournalView() {
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();
  const { t } = useT();
  const { actions } = useStore();
  const entries = useJournal(warrior?.id);

  /** id of the entry created from this session's blank page — it stays on that page, editable */
  const [draftId, setDraftId] = useState<string | null>(null);
  const draftEntry = useMemo(() => entries.find((e) => e.id === draftId), [entries, draftId]);

  const warriorId = warrior?.id;

  const createEntry = useCallback(
    async (body: string, startedAt: string) => {
      if (!warriorId) return;
      const entry: JournalEntry = {
        id: newId("jr"),
        warriorId,
        date: todayKey(),
        body,
        tags: [],
        createdAt: startedAt,
        updatedAt: nowIso(),
      };
      await actions.upsert("journal", entry);
      setDraftId(entry.id);
      // XP + streak only for NEW entries — later keystrokes patch and never touch progress.
      await actions.grantXp({
        warriorId,
        baseAmount: JOURNAL_XP,
        source: "journal",
        refId: entry.id,
        domain: entry.domain,
        date: entry.date,
      });
      await actions.recordActivity(warriorId, entry.date);
    },
    [actions, warriorId],
  );

  const appendEntry = useCallback(
    async (entry: JournalEntry, body: string) => {
      await actions.patch("journal", entry.id, { body, updatedAt: nowIso() });
    },
    [actions],
  );

  if (!hydrated) {
    return (
      <div className={WRAPPER} aria-busy>
        <div className="skeleton aspect-[3/4] max-h-full w-[78%] rounded-xl" />
      </div>
    );
  }

  if (!warrior) {
    return (
      <div className="px-4 py-6">
        <Panel variant="accent" rivets title={t("nav.journal")}>
          <p className="mb-4 text-sm text-fg-muted">{t("journal.noWarrior")}</p>
          <Link href="/" className="inline-flex">
            <Button variant="gold">{t("journal.chooseWarrior")}</Button>
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className={WRAPPER}>
      <div className="flex min-h-0 w-full flex-1 items-center justify-center py-1">
        <Book entries={entries} onCreate={createEntry} onAppend={appendEntry} draftEntry={draftEntry} className="aspect-[3/4] h-full max-h-full max-w-full" />
      </div>
      <Button variant="secondary" disabled aria-disabled title={t("journal.advisorSoon")} className="shrink-0">
        {t("journal.advisor")}
      </Button>
    </div>
  );
}

export default JournalView;
