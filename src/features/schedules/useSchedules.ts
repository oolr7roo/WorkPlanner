import { useMemo } from "react";
import type { ScheduleCompletion, ScheduleDraft } from "./types";
import type { ScheduleWorkspace } from "./useScheduleWorkspace";
import { effectiveSchedules } from "./scheduleDates";
import { draftAutomaticColor, resolveScheduleColors } from "./scheduleColors";
export function useSchedules(workspace: ScheduleWorkspace, colors: readonly string[]) {
  const items = workspace.items;
  const effective = useMemo(() => resolveScheduleColors(effectiveSchedules(items), colors), [items, colors]);
  async function save(draft: ScheduleDraft, id: string | null, parentId: string | null, revision: number, childCompletions: ScheduleCompletion[] = []) {
    if (!draft.title.trim()) return "일정 제목을 입력해 주세요.";
    if (!id) return workspace.command("createTree", { nodes: [{ ...draft, ref: "new", parentId }] }, revision);
    const patch: Partial<ScheduleDraft> = { ...draft };
    if (items.some(item => item.parentId === id)) {
      delete patch.start;
      delete patch.end;
    }
    return workspace.command("update", { id, patch, childCompletions }, revision);
  }
  function moveTime(id: string, start: string, end: string) {
    if (!items.some(item => item.parentId === id)) void workspace.command("update", { id, patch: { start, end } });
  }
  function reorder(id: string, target: string) {
    const sibling = items.find(item => item.id === target);
    if (sibling) void workspace.command("move", { id, parentId: sibling.parentId, beforeId: target });
  }
  return { items, effective, blocked: workspace.blocked || workspace.busy, save, moveTime, reorder,
    automaticColor: (parentId: string | null) => draftAutomaticColor(items, parentId, colors),
    remove: (id: string, revision: number) => workspace.command("delete", { id }, revision) };
}
