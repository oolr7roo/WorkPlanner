import type { Schedule } from "./types";

export function localInputDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return localInputDate(value).slice(0, 10);
}
export function defaultDraft(start = localInputDate(new Date()), end?: string) {
  const later = new Date(start); later.setHours(later.getHours() + 1);
  return { title: "", start: start.slice(0, 16), end: end?.slice(0, 16) ?? localInputDate(later), color: "#3366dd" };
}
export function adjustEndForStartChange(start: string, end: string, nextStart: string): string {
  const previousStart = Date.parse(start), previousEnd = Date.parse(end), next = Date.parse(nextStart);
  if (![previousStart, previousEnd, next].every(Number.isFinite) || previousEnd <= previousStart || next < previousEnd) return end;
  const adjusted = new Date(next + previousEnd - previousStart);
  return Number.isFinite(adjusted.getTime()) ? localInputDate(adjusted) : end;
}
export function effectiveSchedules(items: Schedule[]): Schedule[] {
  const byParent = new Map<string, Schedule[]>();
  for (const item of items) if (item.parentId) byParent.set(item.parentId, [...(byParent.get(item.parentId) ?? []), item]);
  const memo = new Map<string, Schedule>();
  const resolve = (item: Schedule): Schedule => {
    if (memo.has(item.id)) return memo.get(item.id)!;
    const children = (byParent.get(item.id) ?? []).map(resolve);
    const result = children.length ? { ...item,
      start: children.reduce((a, b) => new Date(a.start) < new Date(b.start) ? a : b).start,
      end: children.reduce((a, b) => new Date(a.end) > new Date(b.end) ? a : b).end,
    } : item;
    memo.set(item.id, result); return result;
  };
  return items.map(resolve);
}
export function formatPeriod(item: Pick<Schedule, "start" | "end">): string {
  const format = (value: string) => new Date(value).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
  return `${format(item.start)} ~ ${format(item.end)}`;
}
export function barPosition(item: Schedule, rangeStart: number, rangeEnd: number) {
  const start = new Date(item.start).getTime(), end = new Date(item.end).getTime();
  if (start >= rangeEnd || end <= rangeStart) return null;
  return { left: (Math.max(start, rangeStart) - rangeStart) / (rangeEnd - rangeStart) * 100,
    width: (Math.min(end, rangeEnd) - Math.max(start, rangeStart)) / (rangeEnd - rangeStart) * 100,
    clippedStart: start < rangeStart, clippedEnd: end > rangeEnd };
}
