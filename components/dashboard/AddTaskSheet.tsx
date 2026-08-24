"use client";

import { useState } from "react";
import { Button, Chip, Sheet, TextField } from "@/components/ui";
import { useT } from "@/lib/i18n/useT";
import { DOMAINS, type Domain, type TaskKind } from "@/lib/domain/types";
import { DEFAULT_XP } from "@/lib/game/tasks";
import { DomainChip } from "./DomainChip";

const KINDS: TaskKind[] = ["anchor", "major", "side"];

export interface AddTaskSheetProps {
  open: boolean;
  kind: TaskKind;
  onClose: () => void;
  onSave: (input: { title: string; domain: Domain; kind: TaskKind }) => void;
}

export function AddTaskSheet({ open, kind: preset, onClose, onSave }: AddTaskSheetProps) {
  const { t } = useT();
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState<Domain>("purpose");
  const [kind, setKind] = useState<TaskKind>(preset);
  // re-sync preset when the sheet is opened from a different section
  const [lastPreset, setLastPreset] = useState(preset);
  if (preset !== lastPreset) {
    setLastPreset(preset);
    setKind(preset);
  }

  const reset = () => {
    setTitle("");
    setDomain("purpose");
    setKind(preset);
  };

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({ title: trimmed, domain, kind });
    reset();
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={t("dashboard.newTask")}
    >
      <div className="flex flex-col gap-4">
        <TextField
          label={t("dashboard.taskTitle")}
          placeholder={t("dashboard.taskTitlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
        />

        <div>
          <div className="mb-1.5 text-xs uppercase tracking-widest text-fg-muted">{t("dashboard.kind")}</div>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <Chip key={k} selected={kind === k} onClick={() => setKind(k)} tone="neutral">
                {t(`dashboard.kind${k[0].toUpperCase()}${k.slice(1)}`)} · +{DEFAULT_XP[k]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs uppercase tracking-widest text-fg-muted">{t("dashboard.domain")}</div>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((d) => (
              <DomainChip key={d} domain={d} selected={domain === d} onClick={() => setDomain(d)} />
            ))}
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("dashboard.cancel")}
          </Button>
          <Button block onClick={submit} disabled={!title.trim()}>
            {t("dashboard.save")}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
