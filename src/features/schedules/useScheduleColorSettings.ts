import { useState } from "react";
import { validateColorSettings } from "./scheduleColors";
import { readColorSettings, writeColorSettings } from "./scheduleColorStorage";
import type { ColorSettings } from "./types";

export function useScheduleColorSettings() {
  const [initial] = useState(readColorSettings);
  const [settings, setSettings] = useState(initial.settings);
  const [error, setError] = useState(initial.error);
  const colors = settings.presets.find(preset => preset.id === settings.activePresetId)!.colors;
  function save(next: ColorSettings): string {
    const validation = validateColorSettings(next);
    if (validation) return validation;
    const normalized: ColorSettings = { ...next, presets: next.presets.map(preset => ({ ...preset, name: preset.name.trim() })) };
    try { writeColorSettings(normalized); }
    catch { return "색상 설정을 저장하지 못했습니다. 기존 설정은 유지됩니다. 브라우저 저장소를 확인한 뒤 다시 시도해 주세요."; }
    setSettings(normalized);
    setError("");
    return "";
  }
  return { settings, colors, error, save };
}
