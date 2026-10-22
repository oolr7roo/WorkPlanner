import { defaultColorSettings, validateColorSettings } from "./scheduleColors";
import type { ColorSettings } from "./types";

const KEY = "workplan-calendar-color-presets-v1";

export function readColorSettings(): { settings: ColorSettings; error: string } {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === null) return { settings: defaultColorSettings(), error: "" };
    const parsed: unknown = JSON.parse(saved);
    if (validateColorSettings(parsed)) throw new Error("Invalid color settings");
    return { settings: parsed as ColorSettings, error: "" };
  } catch {
    return { settings: defaultColorSettings(), error: "색상 설정을 불러오지 못해 기본색으로 표시합니다. 원본은 보존했습니다. 설정에서 확인 후 저장해 주세요." };
  }
}

export function writeColorSettings(settings: ColorSettings): void {
  const error = validateColorSettings(settings);
  if (error) throw new Error(error);
  localStorage.setItem(KEY, JSON.stringify(settings));
}
