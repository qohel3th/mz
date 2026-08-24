"use client";

import { useMemo, useState } from "react";
import { Button, Panel } from "@/components/ui";
import { useT } from "@/lib/i18n/useT";
import { useStore, useTasks } from "@/lib/store";
import { todayKey } from "@/lib/domain/ids";
import { nowIso } from "@/lib/domain/ids";
import type { Task, TaskKind, Warrior } from "@/lib/domain/types";
import { quarterlyMultiplier } from "@/lib/game/progression";
import { groupByKind, isDoneOn, newTask, visibleOn } from "@/lib/game/tasks";
import { TaskRow } from "./TaskRow";
import { AddTaskSheet } from "./AddTaskSheet";

const SECTIONS: { kind: TaskKind; key: string }[] = [
  { kind: "anchor", key: "dashboard.anchors" },
  { kind: "major", key: "dashboard.major" },
  { kind: "side", key: "dashboard.side" },
];

export function TodayTasks({ warrior }: { warrior: Warrior }) {
  const { t } = useT();
  const { actions } = useStore();
  const tasks = useTasks(warrior.id);
  const today = todayKey();
  const groups = useMemo(() => groupByKind(visibleOn(tasks, today)), [tasks, today]);
  const [adding, setAdding] = useState<TaskKind | null>(null);

  const toggle = (task: Task) => actions.toggleTaskCompletion(task.id, today, quarterlyMultiplier(warrior, task.domain));
  const archive = (task: Task) => actions.patch("tasks", task.id, { archived: true, updatedAt: nowIso() });

  return (
    <>
      {SECTIONS.map(({ kind, key }) => {
        const list = groups[kind];
        const done = list.filter((task) => isDoneOn(task, today)).length;
        return (
          <Panel
            key={kind}
            title={
              <span>
                {t(key)}
                {list.length > 0 && (
                  <span className="ms-2 text-fg-faint">
                    {done}/{list.length}
                  </span>
                )}
              </span>
            }
            action={
              <Button variant="ghost" size="sm" onClick={() => setAdding(kind)}>
                + {t("dashboard.addTask")}
              </Button>
            }
          >
            {list.length === 0 ? (
              <p className="text-sm text-fg-faint">{t("dashboard.emptySection")}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {list.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    done={isDoneOn(task, today)}
                    multiplier={quarterlyMultiplier(warrior, task.domain)}
                    onToggle={() => void toggle(task)}
                    onArchive={() => void archive(task)}
                  />
                ))}
              </div>
            )}
          </Panel>
        );
      })}

      <AddTaskSheet
        open={adding !== null}
        kind={adding ?? "major"}
        onClose={() => setAdding(null)}
        onSave={(input) => void actions.upsert("tasks", newTask(warrior.id, input))}
      />
    </>
  );
}
