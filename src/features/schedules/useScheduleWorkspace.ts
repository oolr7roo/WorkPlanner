import { useSyncExternalStore } from "react";
import type { WorkPlanUiService } from "./workPlanContracts";

export function useScheduleWorkspace(ui: WorkPlanUiService) {
  const view = useSyncExternalStore(ui.subscribe, () => ui.getState().workspace);
  return {
    ...view,
    getSnapshot: () => ui.getState().workspace,
    refresh: ui.actions.refreshWorkspace,
    previewImport: ui.actions.previewImport,
    command: ui.actions.workspaceCommand,
    saveSchedule: ui.actions.saveSchedule,
    moveSchedule: ui.actions.moveSchedule,
    reorderSchedule: ui.actions.reorderSchedule,
    removeSchedule: ui.actions.removeSchedule,
  };
}

export type ScheduleWorkspace = ReturnType<typeof useScheduleWorkspace>;
