import type { ColorSettings } from "./types";
import type { ScheduleWorkspace } from "./useScheduleWorkspace";
export function useScheduleColorSettings(workspace: ScheduleWorkspace) {
  const settings = workspace.settings;
  return { settings, colors: settings.presets.find(preset => preset.id === settings.activePresetId)!.colors,
    error: workspace.error, save: (next: ColorSettings, revision: number) => workspace.command("settings", { settings: next }, revision) };
}
