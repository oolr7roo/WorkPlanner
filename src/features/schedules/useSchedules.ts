import { useMemo } from "react";
import type { ScheduleWorkspace } from "./useScheduleWorkspace";
import { effectiveSchedules } from "./scheduleDates";
import { draftAutomaticColor, resolveScheduleColors } from "./scheduleColors";

export function useSchedules(workspace: ScheduleWorkspace, colors: readonly string[]) {
  const items = workspace.items;
  const effective = useMemo(() => resolveScheduleColors(effectiveSchedules(items), colors), [items, colors]);
  return {
    items, effective, blocked: workspace.blocked || workspace.busy,
    save: workspace.saveSchedule, moveTime: workspace.moveSchedule, reorder: workspace.reorderSchedule, remove: workspace.removeSchedule,
    automaticColor: (parentId: string | null) => draftAutomaticColor(items, parentId, colors),
  };
}
