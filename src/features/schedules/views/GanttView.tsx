import { useEffect, useState } from "react";
import { addDays, barPosition, formatPeriod } from "../scheduleDates";
import { ScheduleTreeLabel } from "../components/ScheduleTreeLabel";
import type { TreeViewProps } from "./PriorityTreeView";

export function GanttView(props: TreeViewProps & { date: string }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(timer); }, []);
  const start = new Date(`${props.date}T00:00:00`).getTime();
  const end = new Date(`${addDays(props.date, 14)}T00:00:00`).getTime();
  // Summary periods already include descendants, keeping their ancestors in range.
  const overlapping = props.items.filter(item => barPosition(item, start, end));
  const relevant = new Set(overlapping.map(item => item.id));
  const rows = props.rows.filter(row => relevant.has(row.schedule.id));
  const selectedAncestors = props.rows.find(row => row.schedule.id === props.selected)?.ancestry ?? [];
  return <section className="gantt-view" aria-label="2주 간트차트">
    <div className="view-guide"><strong>일정별 진행 기간</strong><p>제목으로 하위 일정을 펼치고, 막대 또는 편집 버튼으로 수정하세요. 세로선은 현재 시각입니다.</p></div>
    {!rows.length ? <p className="empty-state">이 기간에 표시할 일정이 없습니다.</p> : <div className="gantt-scroll">
      <div className="gantt-grid">
        <div className="gantt-heading"><div className="gantt-label-heading">일정 · 하위 일정</div><div className="gantt-dates">
          {Array.from({ length: 14 }, (_, index) => {
            const day = addDays(props.date, index), dayStart = new Date(`${day}T00:00:00`).getTime();
            const dayEnd = new Date(`${addDays(day, 1)}T00:00:00`).getTime();
            return <span key={day} style={{ left: `${(dayStart - start) / (end - start) * 100}%`, width: `${(dayEnd - dayStart) / (end - start) * 100}%` }}>{new Date(`${day}T12:00:00`).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", weekday: "short" })}</span>;
          })}</div></div>
        {rows.map(row => {
          const bar = barPosition(row.schedule, start, end)!;
          return <div className={`gantt-row ${props.selected === row.schedule.id || row.ancestry.includes(props.selected ?? "") || selectedAncestors.includes(row.schedule.id) ? "branch-highlight" : ""}`} key={row.schedule.id}>
            <div className="gantt-label"><ScheduleTreeLabel {...props} row={row} collapsed={props.collapsed.has(row.schedule.id)} selected={props.selected === row.schedule.id} /></div>
            <div className="gantt-track">
              <button type="button" className={`gantt-bar ${row.hasChildren ? "summary" : ""}`} disabled={props.disabled} onClick={() => props.onEdit(row.schedule.id)}
                title={`${row.schedule.title} · ${formatPeriod(row.schedule)}`} aria-label={`${row.schedule.title} ${formatPeriod(row.schedule)} 편집`}
                style={{ left: `${bar.left}%`, width: `${bar.width}%`, background: row.schedule.color ?? "#3366dd" }}>
                {bar.width > 4 ? <>{bar.clippedStart && "◀ "}{row.schedule.title}{bar.clippedEnd && " ▶"}</> : <span aria-hidden="true">{bar.clippedStart || bar.clippedEnd ? "◆" : ""}</span>}
              </button>
              {now >= start && now < end && <span className="gantt-now" aria-hidden="true" style={{ left: `${(now - start) / (end - start) * 100}%` }} />}
            </div>
          </div>;
        })}
      </div>
    </div>}
  </section>;
}
