import { useState } from "react";
import type { Schedule } from "../types";

export const DRAG_TYPE = "application/x-calendar-schedule";
type Props = { schedule: Schedule; siblings: Schedule[]; onMove: (id: string, target: string) => void; disabled: boolean };
export function ScheduleDragHandle({ schedule, siblings, onMove, disabled }: Props) {
  const [target, setTarget] = useState<number | null>(null);
  const position = siblings.findIndex(item => item.id === schedule.id);
  return <span className="drag-control">
    <button type="button" className="drag-handle" draggable={!disabled} disabled={disabled}
      aria-label={`${schedule.title} 순서 이동`} aria-describedby="reorder-help"
      onDragStart={event => { event.dataTransfer.setData(DRAG_TYPE, schedule.id); event.dataTransfer.effectAllowed = "move"; }}
      onKeyDown={event => {
        if (event.key === " " && target === null) { event.preventDefault(); setTarget(position); }
        else if (target !== null && ["ArrowUp", "ArrowDown"].includes(event.key)) {
          event.preventDefault(); setTarget(Math.max(0, Math.min(siblings.length - 1, target + (event.key === "ArrowUp" ? -1 : 1))));
        } else if (event.key === "Enter" && target !== null) { event.preventDefault(); onMove(schedule.id, siblings[target].id); setTarget(null); }
        else if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setTarget(null); }
        else if (event.key === "Tab") setTarget(null);
      }} onBlur={() => setTarget(null)}>⋮⋮</button>
    {target !== null && <span className="reorder-preview" role="status">{target + 1}번째로 이동 · Enter 확정 / Esc 취소</span>}
  </span>;
}
