"use client";

import { useState } from "react";
import type { JournalEntry } from "@/lib/domain/types";
import { formatDate } from "@/lib/i18n";
import { useT } from "@/lib/i18n/useT";
import { Button, Chip, Sheet, UserText } from "@/components/ui";
import { EntryComposer, draftFromEntry, type EntryDraft } from "./EntryComposer";
import { MOOD_GLYPH, moodLabelKey } from "./moods";
import { RecordAssist } from "@/components/ai";

interface EntrySheetProps {
  entry: JournalEntry | null;
  onClose: () => void;
  onSave: (entry: JournalEntry, draft: EntryDraft) => Promise<void> | void;
  onDelete: (entry: JournalEntry) => Promise<void> | void;
}

/** Expanded entry: read view with edit + delete. Deleting never touches XP. */
export function EntrySheet({ entry, onClose, onSave, onDelete }: EntrySheetProps) {
  const { locale } = useT();
  return (
    <Sheet open={entry !== null} onClose={onClose} title={entry ? formatDate(locale, entry.date) : undefined}>
      {entry && <EntryDetail key={entry.id} entry={entry} onSave={onSave} onDelete={onDelete} />}
    </Sheet>
  );
}

interface EntryDetailProps {
  entry: JournalEntry;
  onSave: EntrySheetProps["onSave"];
  onDelete: EntrySheetProps["onDelete"];
}

/** Keyed by entry id by the parent so mode/confirm state resets per entry. */
function EntryDetail({ entry, onSave, onDelete }: EntryDetailProps) {
  const { t } = useT();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirming, setConfirming] = useState(false);

  if (mode === "edit") {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm uppercase tracking-widest text-fg-muted">{t("journal.editTitle")}</h3>
        <EntryComposer
          initial={draftFromEntry(entry)}
          saveLabel={t("common.save")}
          onCancel={() => setMode("view")}
          onSave={async (draft) => {
            await onSave(entry, draft);
            setMode("view");
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
        {entry.mood && (
          <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 px-2.5 py-1 text-gold-2">
            <span aria-hidden>{MOOD_GLYPH[entry.mood]}</span>
            {t(moodLabelKey(entry.mood))}
          </span>
        )}
        {entry.domain && (
          <span className="rounded-full border border-accent/50 px-2.5 py-1 text-accent-2">
            {t(`domains.${entry.domain}`)}
          </span>
        )}
      </div>

      {entry.title && <UserText as="h3" text={entry.title} className="font-display text-xl leading-snug text-fg" />}

      <UserText as="p" multiline text={entry.body} className="text-base leading-relaxed text-fg" />

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <Chip key={tag} tone="neutral" className="pointer-events-none">
              #{tag}
            </Chip>
          ))}
        </div>
      )}

      <RecordAssist
        collection="journal"
        recordId={entry.id}
        recordType="journal"
        purpose="journal"
        original={entry.body}
        refined={entry.refined}
        translated={entry.translated}
      />

      <div className="mt-2 flex flex-col gap-2">
        {confirming ? (
          <div className="panel panel-accent flex flex-col gap-3 p-3">
            <p className="text-sm text-fg">{t("journal.confirmDelete")}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                {t("common.cancel")}
              </Button>
              <Button variant="danger" size="sm" className="flex-1" onClick={() => onDelete(entry)}>
                {t("journal.delete")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setConfirming(true)}>
              {t("common.remove")}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setMode("edit")}>
              {t("common.edit")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
