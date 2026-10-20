import type { CalendarEvent } from "trud-calendar-core";

export type Schedule = CalendarEvent & { parentId: string | null; order: number };
export type ScheduleDraft = Pick<Schedule, "title" | "start" | "end"> & { color: string };
export type AppView = "priority" | "gantt" | "month" | "week" | "day";
export type TreeRow = { schedule: Schedule; depth: number; hasChildren: boolean; ancestry: string[] };
