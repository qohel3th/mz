"use client";

import { useMemo, useState } from "react";
import { useActiveWarrior, useIdealSelves, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { newId, nowIso } from "@/lib/domain/ids";
import type { IdealSelf, ThemeId } from "@/lib/domain/types";
import { Button, Chip, Panel, TextArea, TextField, cn } from "@/components/ui";
import { ChipListInput } from "../ChipListInput";
import { Epigraph } from "../Epigraph";
import { StepFrame } from "../StepFrame";
import { useStepSave } from "../useStepSave";

const THEMES: ThemeId[] = ["arcane", "ember", "gilded"];
const THEME_DOT: Record<ThemeId, string> = { arcane: "bg-purple-2", ember: "bg-red-2", gilded: "bg-gold-2" };
const SIDES = ["extrovert", "contemplative", "spiritual", "builder", "nurturing", "artistic"] as const;
const SLOT_KEYS = ["slot1", "slot2", "slot3"] as const;
const MIN = 2;
const MAX = 3;

function isComplete(s: IdealSelf): boolean {
  return s.name.trim().length > 0 && s.description.trim().length > 0;
}

/** Soft guardrail from the PDF: "I am…", not "I want to become…". */
function startsWithWant(text: string): boolean {
  const head = text.trim().toLowerCase();
  return head.startsWith("i want") || head.startsWith("i wish") || head.startsWith("אני רוצה");
}

export function IdealSelvesStep({ warriorId }: { warriorId: string }) {
  const { t } = useT();
  const { actions } = useStore();
  const warrior = useActiveWarrior();
  const persisted = useIdealSelves(warriorId);
  const { busy, complete } = useStepSave(warriorId, "ideal-selves");
  const [saving, setSaving] = useState(false);

  const [drafts, setDrafts] = useState<IdealSelf[]>(() =>
    [...persisted].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)).slice(0, MAX),
  );
  const persistedIds = useMemo(() => new Set(persisted.map((s) => s.id)), [persisted]);

  const update = (id: string, partial: Partial<IdealSelf>) =>
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, ...partial } : d)));

  const addDraft = (name = "") => {
    if (drafts.length >= MAX) return;
    const now = nowIso();
    setDrafts((ds) => [
      ...ds,
      {
        id: newId("is"),
        warriorId,
        name,
        tagline: "",
        description: "",
        traits: [],
        theme: warrior?.theme ?? "arcane",
        isActive: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  };

  const removeDraft = async (id: string) => {
    setDrafts((ds) => ds.filter((d) => d.id !== id));
    if (persistedIds.has(id)) await actions.remove("idealSelves", id);
  };

  const persist = async (self: IdealSelf) => actions.upsert("idealSelves", { ...self, updatedAt: nowIso() });

  /** Persist + activate: switches the app theme immediately. */
  const makeActive = async (self: IdealSelf) => {
    setSaving(true);
    try {
      await persist({ ...self, isActive: true });
      await actions.setActiveIdealSelf(warriorId, self.id);
      setDrafts((ds) => ds.map((d) => ({ ...d, isActive: d.id === self.id })));
    } finally {
      setSaving(false);
    }
  };

  const setTheme = async (self: IdealSelf, theme: ThemeId) => {
    update(self.id, { theme });
    if (self.isActive) await makeActive({ ...self, theme });
  };

  const active = drafts.find((d) => d.isActive);
  const canContinue =
    drafts.length >= MIN && drafts.length <= MAX && drafts.every(isComplete) && Boolean(active) && !saving;

  const onContinue = async () => {
    setSaving(true);
    try {
      for (const d of drafts) await persist(d);
      if (active) await actions.setActiveIdealSelf(warriorId, active.id);
      await complete({});
    } finally {
      setSaving(false);
    }
  };

  const sideChips = SIDES.map((k) => t(`onboarding.idealSelves.sides.${k}`));

  return (
    <StepFrame step="ideal-selves" kicker={t("onboarding.idealSelves.kicker")} canContinue={canContinue} onContinue={onContinue} busy={busy || saving}>
      <Panel variant="accent" className="flex flex-col gap-3">
        <p className="text-sm text-fg">{t("onboarding.idealSelves.intro")}</p>
        <p className="text-xs text-fg-muted">{t("onboarding.idealSelves.guardrail")}</p>
        <Epigraph text={t("onboarding.idealSelves.epigraph")} by={t("onboarding.idealSelves.epigraphBy")} />
      </Panel>

      {drafts.map((self, i) => {
        const wantWarn = startsWithWant(self.description);
        return (
          <Panel key={self.id} variant={self.isActive ? "strong" : "default"} rivets={self.isActive} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-gold">{t(`onboarding.idealSelves.${SLOT_KEYS[i] ?? "slot3"}`)}</span>
              {self.isActive ? (
                <span className="rounded-full border border-gold/50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold-2">
                  {t("onboarding.idealSelves.active")}
                </span>
              ) : (
                <Button size="sm" variant="secondary" disabled={saving || !self.name.trim()} onClick={() => void makeActive(self)}>
                  {t("onboarding.idealSelves.makeActive")}
                </Button>
              )}
            </div>

            <TextField
              label={t("onboarding.idealSelves.nameLabel")}
              placeholder={t("onboarding.idealSelves.namePlaceholder")}
              value={self.name}
              maxLength={60}
              onChange={(e) => update(self.id, { name: e.target.value })}
            />
            <TextField
              label={t("onboarding.idealSelves.taglineLabel")}
              placeholder={t("onboarding.idealSelves.taglinePlaceholder")}
              value={self.tagline}
              maxLength={120}
              onChange={(e) => update(self.id, { tagline: e.target.value })}
            />
            <TextArea
              label={t("onboarding.idealSelves.descriptionLabel")}
              placeholder={t("onboarding.idealSelves.descriptionPlaceholder")}
              hint={wantWarn ? <span className="text-red-2">{t("onboarding.idealSelves.wantWarning")}</span> : t("onboarding.idealSelves.descriptionHint")}
              value={self.description}
              rows={3}
              onChange={(e) => update(self.id, { description: e.target.value })}
            />
            <ChipListInput
              label={t("onboarding.idealSelves.traitsLabel")}
              placeholder={t("onboarding.idealSelves.traitsPlaceholder")}
              items={self.traits}
              max={8}
              onChange={(traits) => update(self.id, { traits })}
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest text-fg-muted">{t("onboarding.idealSelves.themeLabel")}</span>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((theme) => (
                  <Chip key={theme} tone="neutral" selected={self.theme === theme} onClick={() => void setTheme(self, theme)}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn("inline-block h-2.5 w-2.5 rounded-full", THEME_DOT[theme])} />
                      {t(`themes.${theme}`)}
                    </span>
                  </Chip>
                ))}
              </div>
            </div>

            {drafts.length > 1 && (
              <Button size="sm" variant="ghost" className="self-end text-red-2" onClick={() => void removeDraft(self.id)} disabled={saving}>
                {t("onboarding.idealSelves.remove")}
              </Button>
            )}
          </Panel>
        );
      })}

      {drafts.length < MAX && (
        <Panel className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest text-fg-muted">{t("onboarding.idealSelves.inspiration")}</span>
          <div className="flex flex-wrap gap-1.5">
            {sideChips.map((label) => (
              <Chip key={label} tone="gold" className="text-xs" onClick={() => addDraft(label)}>
                {label}
              </Chip>
            ))}
          </div>
          <Button variant="secondary" block onClick={() => addDraft()}>
            + {t("onboarding.idealSelves.add")}
          </Button>
        </Panel>
      )}

      <p className="text-center text-xs text-fg-faint">
        {!active && drafts.length >= MIN && drafts.every(isComplete)
          ? t("onboarding.idealSelves.needActive")
          : t("onboarding.idealSelves.countHint")}
      </p>
    </StepFrame>
  );
}
