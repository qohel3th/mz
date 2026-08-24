"use client";

import { useMemo, useState } from "react";
import { Button, Chip, Panel, Sheet, TextArea, UserText } from "@/components/ui";
import { useT } from "@/lib/i18n/useT";
import { useMinimumViableWeeks, useStore, useTasks } from "@/lib/store";
import { todayKey } from "@/lib/domain/ids";
import { isoWeekKey } from "@/lib/domain/dates";
import type { Warrior } from "@/lib/domain/types";
import { mvwKeptTasks } from "@/lib/game/tasks";

export function MvwCard({ warrior }: { warrior: Warrior }) {
  const { t } = useT();
  const { actions } = useStore();
  const tasks = useTasks(warrior.id);
  const weeks = useMinimumViableWeeks(warrior.id);
  const today = todayKey();
  const weekKey = isoWeekKey(today);
  const current = weeks.find((m) => m.weekKey === weekKey) ?? null;
  const kept = useMemo(() => mvwKeptTasks(tasks, current), [tasks, current]);
  const anchors = useMemo(() => tasks.filter((x) => x.kind === "anchor" && !x.archived), [tasks]);

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [reason, setReason] = useState("");

  const openSheet = () => {
    setPicked(current?.keptTaskIds ?? anchors.slice(0, 1).map((a) => a.id));
    setReason(current?.reason ?? "");
    setOpen(true);
  };

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    if (picked.length === 0) return;
    await actions.declareMinimumViableWeek(warrior.id, picked, reason.trim() || undefined, today);
    setOpen(false);
  };

  return (
    <Panel
      title={t("dashboard.mvw")}
      action={
        <Button variant={current ? "ghost" : "secondary"} size="sm" onClick={openSheet} disabled={anchors.length === 0}>
          {current ? t("dashboard.mvwUpdate") : t("dashboard.mvwDeclare")}
        </Button>
      }
    >
      <p className="text-sm text-fg-muted">{t("dashboard.mvwHint")}</p>
      {anchors.length === 0 && <p className="mt-2 text-xs text-fg-faint">{t("dashboard.mvwNoAnchors")}</p>}
      {current && (
        <div className="mt-3 rounded-[var(--radius)] border border-gold/40 bg-gold/10 px-3 py-2.5">
          <div className="text-xs uppercase tracking-widest text-gold-2">
            {t("dashboard.mvwDeclared", { week: current.weekKey })} · {t("dashboard.mvwKeeping", { n: kept.length })}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {kept.map((task) => (
              <Chip key={task.id} tone="gold" className="pointer-events-none">
                {task.title}
              </Chip>
            ))}
          </div>
          {current.reason && <UserText as="p" text={current.reason} className="mt-2 text-xs text-fg-muted" />}
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={t("dashboard.mvw")}>
        <p className="mb-3 text-sm text-fg-muted">{t("dashboard.mvwPick")}</p>
        <div className="flex flex-wrap gap-2">
          {anchors.map((a) => (
            <Chip key={a.id} tone="gold" selected={picked.includes(a.id)} onClick={() => togglePick(a.id)}>
              {a.title}
            </Chip>
          ))}
        </div>
        <TextArea
          wrapClassName="mt-4"
          label={t("dashboard.mvwReason")}
          placeholder={t("dashboard.mvwReasonPlaceholder")}
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <p className="mt-3 text-xs text-fg-faint">{t("dashboard.mvwHint")}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("dashboard.cancel")}
          </Button>
          <Button variant="gold" block disabled={picked.length === 0} onClick={() => void submit()}>
            {current ? t("dashboard.mvwUpdate") : t("dashboard.mvwDeclare")}
          </Button>
        </div>
      </Sheet>
    </Panel>
  );
}
