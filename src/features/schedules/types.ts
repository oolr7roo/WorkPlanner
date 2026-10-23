import type { CalendarEvent } from "trud-calendar-core";

export type ColorMode = "auto" | "manual";
export type ScheduleKind = "plan" | "task";
export type ChecklistItem = { id: string; text: string; done: boolean };
export type Schedule = CalendarEvent & { parentId: string | null; order: number; kind?: ScheduleKind; colorMode?: ColorMode; checklist?: ChecklistItem[] };
export type ScheduleDraft = Pick<Schedule, "title" | "start" | "end"> & { color: string; kind?: ScheduleKind; colorMode?: ColorMode; checklist?: ChecklistItem[] };
export type ColorPreset = { id: string; name: string; colors: string[] };
export type ColorSettings = { version: 1; activePresetId: string; presets: ColorPreset[] };
export type AppView = "priority" | "gantt" | "month" | "week" | "day";
export type TreeRow = { schedule: Schedule; depth: number; hasChildren: boolean; ancestry: string[] };
