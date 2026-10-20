import { useState } from "react";
import type { Schedule, TreeRow } from "../types";
import { siblings } from "../scheduleTree";
import { formatPeriod } from "../scheduleDates";
import { ScheduleDragHandle, DRAG_TYPE } from "../components/ScheduleDragHandle";
import { ScheduleTreeLabel } from "../components/ScheduleTreeLabel";

export type TreeViewProps = { items: Schedule[]; rows: TreeRow[]; collapsed: Set<string>; selected: string | null; onToggle: (id: string) => void; onEdit: (id: string) => void; onAddChild: (id: string) => void; disabled: boolean };
export function PriorityTreeView(props: TreeViewProps & { onMove: (id: string, target: string) => void }) {
  const [notice, setNotice] = useState("");
  const selectedAncestors = props.rows.find(row => row.schedule.id === props.selected)?.ancestry ?? [];
  return <section className="priority-view" aria-label="일정 우선순위 목록">
    <div className="view-guide"><strong>위에 있을수록 높은 우선순위</strong><p id="reorder-help">같은 부모 아래에서 ⋮⋮를 끌어 이동하세요. 키보드: Space → 방향키 → Enter, Esc 취소.</p></div>
    <p className="sr-only" role="status">{notice}</p>
    {!props.rows.length ? <p className="empty-state">등록된 일정이 없습니다. 일정 추가로 첫 일정을 만들어 보세요.</p> :
      <div className="schedule-table"><div className="priority-table-head"><span>이동</span><span>일정 · 하위 일정</span><span>기간</span></div>
        {props.rows.map(row => <div key={row.schedule.id} className={`priority-row ${props.selected === row.schedule.id || row.ancestry.includes(props.selected ?? "") || selectedAncestors.includes(row.schedule.id) ? "branch-highlight" : ""}`}
          onDragOver={event => { if (!props.disabled && event.dataTransfer.types.includes(DRAG_TYPE)) event.preventDefault(); }}
          onDrop={event => {
            event.preventDefault(); if (props.disabled) return;
            const id = event.dataTransfer.getData(DRAG_TYPE), source = props.items.find(item => item.id === id);
            if (!source || source.parentId !== row.schedule.parentId) { setNotice("같은 부모 아래의 일정끼리 이동할 수 있습니다."); return; }
            props.onMove(id, row.schedule.id); setNotice("일정 순서를 변경했습니다.");
          }}>
          <ScheduleDragHandle schedule={row.schedule} siblings={siblings(props.items, row.schedule.parentId)} onMove={props.onMove} disabled={props.disabled} />
          <ScheduleTreeLabel {...props} row={row} collapsed={props.collapsed.has(row.schedule.id)} selected={props.selected === row.schedule.id} />
          <span className="schedule-period">{formatPeriod(row.schedule)}</span>
        </div>)}
      </div>}
  </section>;
}
