import type { Schedule, ScheduleKind, TreeRow } from "./types";
import { visibleRows } from "./scheduleTree";

export function validScheduleKind(value: unknown): boolean {
  return value === undefined || value === "plan" || value === "task";
}
export function scheduleKind(item: { kind?: ScheduleKind }): ScheduleKind { return item.kind ?? "task"; }
export function taskSchedules(items: Schedule[]): Schedule[] { return items.filter(item => scheduleKind(item) === "task"); }

// Keep the complete hierarchy for dates/colors. Hidden plans cannot collapse tasks.
export function taskRows(items: Schedule[], collapsed: Set<string>): TreeRow[] {
  const tasks = new Set(taskSchedules(items).map(item => item.id));
  const allTasks = visibleRows(items, new Set()).filter(row => tasks.has(row.schedule.id));
  const taskCollapsed = new Set([...collapsed].filter(id => tasks.has(id)));
  return visibleRows(items, taskCollapsed).filter(row => tasks.has(row.schedule.id)).map(row => ({
    ...row,
    depth: row.ancestry.filter(id => tasks.has(id)).length,
    hasChildren: allTasks.some(child => child.ancestry.includes(row.schedule.id))
  }));
}
