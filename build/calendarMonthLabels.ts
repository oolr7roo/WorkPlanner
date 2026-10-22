import type { Plugin } from "vite";

/** Adapt only the SDK's month label; its dayCell slot replaces all cell behavior. */
export function adaptMonthLabels(code: string): string {
  const start = code.indexOf("function MonthView()");
  const end = code.indexOf("\nfunction TimeEvent(", start);
  const label = "children: formatDayNumber(day, locale)";
  if (start < 0 || end < 0) throw new Error("WorkPlanner: unsupported calendar SDK MonthView structure.");
  const month = code.slice(start, end);
  if (month.split(label).length !== 2) throw new Error("WorkPlanner: expected exactly one month date label in the calendar SDK.");
  return 'import { MonthDayNumber as WorkPlannerMonthDayNumber } from "/src/features/schedules/components/MonthDayNumber.tsx";\n'
    + code.slice(0, start)
    + month.replace(label, "children: jsx(WorkPlannerMonthDayNumber, { date: day })")
    + code.slice(end);
}

export function calendarMonthLabels(): Plugin {
  return {
    name: "workplanner-month-date-labels",
    enforce: "pre",
    transform(code, id) {
      if (!id.split("?")[0].replaceAll("\\", "/").endsWith("/node_modules/trud-calendar/dist/index.js")) return null;
      return { code: adaptMonthLabels(code), map: null };
    },
  };
}
