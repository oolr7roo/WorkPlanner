import { useRef, useState } from "react";
import type { ColorMode } from "../types";
import { ScheduleColorPicker } from "./ScheduleColorPicker";

type Props = { color: string; automaticColor: string; mode: ColorMode; onChoose: (color: string) => void; onRestore: () => void };
export function ScheduleColorControl({ color, automaticColor, mode, onChoose, onRestore }: Props) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return <div className="editor-color-control">
    <button ref={button} className="header-color-button" type="button" aria-label="일정 색상 선택" aria-haspopup="dialog" aria-expanded={open}
      title={mode === "auto" ? "자동 색상 · 선택하여 개별 지정" : "개별 지정 색상"} style={{ backgroundColor: color }} onClick={event => { event.stopPropagation(); setOpen(true); }} />
    {open && <ScheduleColorPicker anchor={button.current!} color={color} automaticColor={automaticColor} onClose={() => setOpen(false)}
      onChoose={next => { if (next.toLowerCase() !== color.toLowerCase()) onChoose(next); setOpen(false); }}
      onDefault={() => { onRestore(); setOpen(false); }} />}
  </div>;
}
