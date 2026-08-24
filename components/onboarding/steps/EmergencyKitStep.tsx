"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { newId } from "@/lib/domain/ids";
import { EMERGENCY_KIT_KINDS, type EmergencyKitItem, type EmergencyKitKind } from "@/lib/domain/types";
import { Button, Chip, Panel, TextField, UserText } from "@/components/ui";
import { StepFrame } from "../StepFrame";
import { useStepSave } from "../useStepSave";
import { cleanItem } from "../steps";

const EXAMPLES = ["example1", "example2", "example3", "example4"] as const;
const MAX = 12;

export function EmergencyKitStep({ warriorId }: { warriorId: string }) {
  const { t } = useT();
  const onboarding = useOnboarding(warriorId);
  const { busy, complete } = useStepSave(warriorId, "emergency-kit");

  const [items, setItems] = useState<EmergencyKitItem[]>(onboarding?.emergencyKit?.items ?? []);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<EmergencyKitKind | undefined>(undefined);
  const [url, setUrl] = useState("");

  const canAdd = cleanItem(title).length > 0 && items.length < MAX;
  const add = () => {
    if (!canAdd) return;
    setItems((xs) => [...xs, { id: newId("kit"), title: cleanItem(title), kind, url: url.trim() || undefined }]);
    setTitle("");
    setKind(undefined);
    setUrl("");
  };

  const onContinue = () => complete({ emergencyKit: { items } });

  return (
    <StepFrame step="emergency-kit" kicker={t("onboarding.emergencyKit.kicker")} canContinue={items.length > 0} onContinue={onContinue} busy={busy}>
      <Panel variant="accent" className="flex flex-col gap-3">
        <p className="text-sm text-fg">{t("onboarding.emergencyKit.intro")}</p>
        <details className="text-xs text-fg-muted">
          <summary className="cursor-pointer select-none text-gold">{t("onboarding.emergencyKit.exampleToggle")}</summary>
          <p className="mt-2 font-display text-fg">{t("onboarding.emergencyKit.exampleTitle")}</p>
          <ul className="mt-1 list-disc ps-4 leading-relaxed">
            {EXAMPLES.map((k) => (
              <li key={k}>{t(`onboarding.emergencyKit.${k}`)}</li>
            ))}
          </ul>
        </details>
      </Panel>

      <Panel title={items.length > 0 ? t("onboarding.emergencyKit.count", { count: items.length }) : undefined} className="flex flex-col gap-2">
        {items.length === 0 && <p className="text-xs text-fg-faint">{t("onboarding.emergencyKit.empty")}</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-start gap-3 rounded-[var(--radius)] border border-border bg-panel px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <UserText as="p" text={it.title} className="text-sm text-fg" />
              <div className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-fg-muted">
                {it.kind && <span>{t(`onboarding.emergencyKit.kinds.${it.kind}`)}</span>}
                {it.url && (
                  <a href={it.url} target="_blank" rel="noreferrer" className="truncate text-accent-2 underline-offset-2 hover:underline">
                    <UserText text={it.url} />
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              aria-label={t("common.remove")}
              onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))}
              className="text-xs text-fg-faint hover:text-red-2"
            >
              ✕
            </button>
          </div>
        ))}
      </Panel>

      <Panel title={t("onboarding.emergencyKit.addTitle")} className="flex flex-col gap-3">
        <TextField
          label={t("onboarding.emergencyKit.titleLabel")}
          placeholder={t("onboarding.emergencyKit.titlePlaceholder")}
          value={title}
          maxLength={160}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              add();
            }
          }}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-widest text-fg-muted">{t("onboarding.emergencyKit.kindLabel")}</span>
          <div className="flex flex-wrap gap-1.5">
            {EMERGENCY_KIT_KINDS.map((k) => (
              <Chip key={k} tone="neutral" className="text-xs" selected={kind === k} onClick={() => setKind(kind === k ? undefined : k)}>
                {t(`onboarding.emergencyKit.kinds.${k}`)}
              </Chip>
            ))}
          </div>
        </div>
        <TextField
          label={t("onboarding.emergencyKit.urlLabel")}
          placeholder={t("onboarding.emergencyKit.urlPlaceholder")}
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button variant="secondary" block onClick={add} disabled={!canAdd}>
          + {t("onboarding.emergencyKit.add")}
        </Button>
      </Panel>

      <p className="text-center text-xs text-fg-faint">{t("onboarding.emergencyKit.use")}</p>
    </StepFrame>
  );
}
