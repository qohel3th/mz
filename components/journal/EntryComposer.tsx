"use client";

import { useState, type KeyboardEvent } from "react";
import { DOMAINS, type Domain, type JournalEntry } from "@/lib/domain/types";
import { todayKey } from "@/lib/domain/ids";
import { useT } from "@/lib/i18n/useT";
import { Button, Chip, TextArea, TextField } from "@/components/ui";
import { MOODS, MOOD_GLYPH, moodLabelKey, type Mood } from "./moods";

export interface EntryDraft {
  date: string;
  title: string;
  body: string;
  mood?: Mood;
  tags: string[];
  domain?: Domain;
}

export function draftFromEntry(entry?: JournalEntry | null, date?: string): EntryDraft {
  return {
    date: entry?.date ?? date ?? todayKey(),
    title: entry?.title ?? "",
    body: entry?.body ?? "",
    mood: entry?.mood,
    tags: entry?.tags ?? [],
    domain: entry?.domain,
  };
}

interface EntryComposerProps {
  initial: EntryDraft;
  onSave: (draft: EntryDraft) => Promise<void> | void;
  onCancel: () => void;
  saveLabel?: string;
}

/** Card-native journal form: date, optional title, body, mood chips, tags, domain. */
export function EntryComposer({ initial, onSave, onCancel, saveLabel }: EntryComposerProps) {
  const { t } = useT();
  const [draft, setDraft] = useState<EntryDraft>(initial);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = draft.body.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(draft.date);

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    setDraft((d) => (d.tags.includes(tag) ? d : { ...d, tags: [...d.tags, tag] }));
    setTagInput("");
  };

  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const submit = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSave({ ...draft, title: draft.title.trim(), body: draft.body.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[minmax(0,10rem)_1fr] gap-3">
        <TextField
          label={t("journal.date")}
          type="date"
          value={draft.date}
          max={todayKey()}
          onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
        />
        <TextField
          label={
            <>
              {t("journal.titleLabel")} <span className="normal-case tracking-normal">({t("common.optional")})</span>
            </>
          }
          value={draft.title}
          maxLength={80}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
        />
      </div>

      <TextArea
        label={t("journal.body")}
        placeholder={t("journal.placeholder")}
        rows={6}
        value={draft.body}
        autoFocus
        onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
      />

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs uppercase tracking-widest text-fg-muted">{t("journal.mood")}</legend>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <Chip
              key={m}
              tone="gold"
              selected={draft.mood === m}
              aria-pressed={draft.mood === m}
              onClick={() => setDraft((d) => ({ ...d, mood: d.mood === m ? undefined : m }))}
            >
              <span aria-hidden>{MOOD_GLYPH[m]}</span> {t(moodLabelKey(m))}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <TextField
          label={t("journal.tags")}
          placeholder={t("journal.tagPlaceholder")}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onTagKey}
          onBlur={addTag}
          enterKeyHint="done"
        />
        {draft.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {draft.tags.map((tag) => (
              <Chip
                key={tag}
                tone="neutral"
                onRemove={() => setDraft((d) => ({ ...d, tags: d.tags.filter((x) => x !== tag) }))}
              >
                #{tag}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs uppercase tracking-widest text-fg-muted">
          {t("journal.domain")} <span className="normal-case tracking-normal">({t("common.optional")})</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((dom) => (
            <Chip
              key={dom}
              selected={draft.domain === dom}
              aria-pressed={draft.domain === dom}
              onClick={() => setDraft((d) => ({ ...d, domain: d.domain === dom ? undefined : dom }))}
            >
              {t(`domains.${dom}`)}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="mt-2 flex gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button className="flex-1" onClick={submit} disabled={!canSave || saving}>
          {saveLabel ?? t("journal.save")}
        </Button>
      </div>
    </div>
  );
}
