import type { TreeRow } from "../types";

type Props = { row: TreeRow; collapsed: boolean; selected: boolean; onToggle: (id: string) => void; onEdit: (id: string) => void; onAddChild: (id: string) => void; disabled: boolean };
export function ScheduleTreeLabel({ row, collapsed, selected, onToggle, onEdit, onAddChild, disabled }: Props) {
  const { schedule, depth, hasChildren, ancestry } = row;
  return <div className={`tree-label ${selected ? "selected" : ""}`} style={{ paddingLeft: Math.min(depth * 8, 24) }}>
    <button type="button" className={`tree-title ${depth ? "nested" : ""}`} title={ancestry.length ? `깊이 ${depth + 1} · ${schedule.title}` : schedule.title}
      aria-expanded={hasChildren ? !collapsed : undefined} onClick={() => onToggle(schedule.id)}>
      <span className="tree-chevron" aria-hidden="true">{hasChildren ? collapsed ? "▸" : "▾" : "·"}</span>
      <span className="schedule-dot" style={{ background: schedule.color ?? "#3366dd" }} />
      <span className="tree-title-text">{schedule.title}</span>
      {depth > 3 && <small className="depth-badge">{depth + 1}단계</small>}
    </button>
    <div className="row-actions">
      <button type="button" disabled={disabled} aria-label={`${schedule.title} 하위 일정 추가`} title="하위 일정 추가" onClick={() => onAddChild(schedule.id)}>＋</button>
      <button type="button" disabled={disabled} aria-label={`${schedule.title} 편집`} onClick={() => onEdit(schedule.id)}>편집</button>
    </div>
  </div>;
}
