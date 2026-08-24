"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Button, Chip, TextField } from "@/components/ui";
import { useT } from "@/lib/i18n/useT";
import { cleanItem } from "./steps";

export interface ChipListInputProps {
  label?: ReactNode;
  hint?: ReactNode;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  max?: number;
  /** tap-to-add starter chips (hidden once chosen) */
  suggestions?: string[];
  tone?: "accent" | "gold";
}

/** Free-text list edited as chips: type + Enter (or Add) to append, ✕ to remove. */
export function ChipListInput({ label, hint, items, onChange, placeholder, max, suggestions, tone = "accent" }: ChipListInputProps) {
  const { t } = useT();
  const [draft, setDraft] = useState("");
  const full = max !== undefined && items.length >= max;

  const add = (raw: string) => {
    const value = cleanItem(raw);
    if (!value || full) return;
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...items, value]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      add(draft);
    }
  };

  const remaining = suggestions?.filter((s) => !items.some((i) => i.toLowerCase() === s.toLowerCase())) ?? [];

  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip key={item} tone={tone} onRemove={() => onChange(items.filter((i) => i !== item))}>
              {item}
            </Chip>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <TextField
          label={label}
          hint={hint}
          wrapClassName="min-w-0 flex-1"
          value={draft}
          placeholder={placeholder}
          disabled={full}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          enterKeyHint="done"
        />
        <Button
          variant="secondary"
          size="md"
          onClick={() => add(draft)}
          disabled={full || !cleanItem(draft)}
          className={hint ? "mb-6" : undefined}
          aria-label={t("common.add")}
        >
          +
        </Button>
      </div>
      {remaining.length > 0 && !full && (
        <div className="flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <Chip key={s} tone="neutral" onClick={() => add(s)} className="text-xs">
              {s}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
