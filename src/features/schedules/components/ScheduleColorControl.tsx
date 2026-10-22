import type { ColorMode } from "../types";

type Props = { color: string; mode: ColorMode; onChoose: (color: string) => void; onRestore: () => void; onPickerOpen: () => void; onPickerBlur: () => void };
export function ScheduleColorControl({ color, mode, onChoose, onRestore, onPickerOpen, onPickerBlur }: Props) {
  return <div className="editor-color-control">
    <input className="header-color-input" type="color" aria-label="일정 색상 선택" title={mode === "auto" ? "자동 색상 · 선택하여 개별 지정" : "개별 지정 색상"}
      value={color} onClick={onPickerOpen} onBlur={onPickerBlur}
      onChange={event => { if (event.target.value.toLowerCase() !== color.toLowerCase()) onChoose(event.target.value); }} />
    {mode === "manual" && <button className="restore-auto-color" type="button" onClick={onRestore}>자동 색상으로 복원</button>}
  </div>;
}
