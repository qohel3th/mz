import type { Domain, ISODate, MinimumViableWeek, Task, TaskKind, WarriorId } from "@/lib/domain/types";
import { newId, nowIso } from "@/lib/domain/ids";

export const DEFAULT_XP: Record<TaskKind, number> = { anchor: 10, major: 25, side: 40 };

export interface TaskGroups {
  anchor: Task[];
  major: Task[];
  side: Task[];
}

export function groupByKind(tasks: Task[]): TaskGroups {
  const groups: TaskGroups = { anchor: [], major: [], side: [] };
  for (const t of tasks) groups[t.kind].push(t);
  return groups;
}

export function isDoneOn(task: Task, date: ISODate): boolean {
  return task.completions.includes(date);
}

/** Daily tasks are always visible; once-tasks hide after being completed before `date`. Archived tasks never show. */
export function visibleOn(tasks: Task[], date: ISODate): Task[] {
  return tasks.filter((t) => {
    if (t.archived) return false;
    if (t.schedule === "daily") return true;
    return !t.completions.some((d) => d < date);
  });
}

/** Share of visible daily (anchor + major) tasks completed on `date`; 0 when none. */
export function dailyCompletionRatio(tasks: Task[], date: ISODate): number {
  const daily = visibleOn(tasks, date).filter((t) => t.schedule === "daily");
  if (daily.length === 0) return 0;
  const done = daily.filter((t) => isDoneOn(t, date)).length;
  return done / daily.length;
}

export function newTask(
  warriorId: WarriorId,
  partial: Partial<Task> & { title: string; kind?: TaskKind; domain?: Domain },
): Task {
  const kind = partial.kind ?? "major";
  const now = nowIso();
  const { title, domain, ...rest } = partial;
  return {
    id: newId("task"),
    warriorId,
    kind,
    title,
    domain: domain ?? "purpose",
    xpReward: DEFAULT_XP[kind],
    schedule: kind === "side" ? "once" : "daily",
    completions: [],
    archived: false,
    system: false,
    createdAt: now,
    updatedAt: now,
    ...rest,
  };
}

/** Tasks kept during a Minimum Viable Week (in the order they were declared). */
export function mvwKeptTasks(tasks: Task[], mvw: MinimumViableWeek | null | undefined): Task[] {
  if (!mvw) return [];
  const byId = new Map(tasks.map((t) => [t.id, t]));
  return mvw.keptTaskIds.map((id) => byId.get(id)).filter((t): t is Task => Boolean(t));
}
