import type { AppView } from "../features/schedules/types";

type Props = { view: AppView; label: string; onViewChange: (view: AppView) => void; onToday: () => void; onPrev: () => void; onNext: () => void };
export function CalendarToolbar({ view, label, onViewChange, onToday, onPrev, onNext }: Props) {
  return <div className="calendar-toolbar">
    <div className="date-controls">
      {view !== "priority" && <>
        <button type="button" onClick={onToday}>오늘</button>
        <button type="button" onClick={onPrev} aria-label="이전 기간">‹</button>
        <button type="button" onClick={onNext} aria-label="다음 기간">›</button>
      </>}
      <strong>{label}</strong>
    </div>
    <div className="view-controls" aria-label="달력 보기">
      {([{ key: "priority", label: "⚑", name: "우선순위" }, { key: "gantt", label: "▰", name: "간트차트" },
        { key: "month", label: "월", name: "월" }, { key: "week", label: "주", name: "주" }, { key: "day", label: "일", name: "일" }] as const).map(item =>
        <button type="button" key={item.key} aria-label={`${item.name} 보기`} title={item.name} aria-pressed={view === item.key}
          className={view === item.key ? "active" : ""} onClick={() => onViewChange(item.key)}>{item.label}</button>)}
    </div>
  </div>;
}
