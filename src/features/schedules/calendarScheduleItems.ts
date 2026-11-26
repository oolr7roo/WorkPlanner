import { eachDayOfRange } from "trud-calendar-core";
import type { CalendarEvent } from "trud-calendar-core";
import { addDays } from "./scheduleDates";
import { scheduleKind } from "./scheduleKinds";
import type { Schedule } from "./types";

export type ScheduleCalendarView = "month" | "week" | "day";
export type CalendarScheduleItem = {
  event: CalendarEvent;
  schedule: Schedule;
  summaryDay?: string;
};

export function buildCalendarScheduleItems(
  schedules: Schedule[],
  view: ScheduleCalendarView,
  range: { start: string; end: string },
): CalendarScheduleItem[] {
  const byId = new Map(schedules.map(schedule => [schedule.id, schedule]));
  const parents = new Set(schedules.map(schedule => schedule.parentId));
  const items: CalendarScheduleItem[] = [];
  const summaries = new Set<string>();

  for (const schedule of schedules) {
    if (scheduleKind(schedule) !== "task" || parents.has(schedule.id)) continue;

    const firstDay = schedule.start.slice(0, 10);
    const endDay = schedule.end.slice(0, 10);
    const lastDay = /^00:00(?::00)?$/.test(schedule.end.slice(11)) ? addDays(endDay, -1) : endDay;
    const start = firstDay > range.start ? firstDay : range.start;
    const end = lastDay < range.end ? lastDay : range.end;
    if (start > end) continue;

    const path = [schedule];
    for (let parentId = schedule.parentId; parentId;) {
      const parent = byId.get(parentId);
      if (!parent) break;
      path.push(parent);
      parentId = parent.parentId;
    }
    path.reverse();

    if (path.length === 1 || (view === "day" && path.length >= 3)) {
      items.push({ event: schedule, schedule });
      continue;
    }
    if (view === "day") continue;

    const topic = path[view === "month" ? 0 : 1];
    for (const day of eachDayOfRange(start, end)) {
      const id = `workplan-summary:${view}:${topic.id}:${day}`;
      if (summaries.has(id)) continue;
      summaries.add(id);
      items.push({
        schedule: topic,
        summaryDay: day,
        event: {
          id,
          title: topic.title,
          start: `${day}T00:00:00`,
          end: `${day}T23:59:59`,
          color: topic.color,
          allDay: true,
        },
      });
    }
  }
  return items;
}
