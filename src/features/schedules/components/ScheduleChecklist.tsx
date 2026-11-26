import { useEffect, useRef, useState } from "react";
import { formatPeriod } from "../scheduleDates";
import type { ChecklistItem, Schedule } from "../types";

type Props = {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  titleId?: string;
  linked?: {
    children: Schedule[];
    changes: ReadonlyMap<string, boolean>;
    onToggle: (id: string, completed: boolean, wasCompleted: boolean) => void;
    onAdd: () => void;
  };
};
export function ScheduleChecklist({ items, onChange, titleId = "checklist-title", linked }: Props) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const inputs = useRef(new Map<string, HTMLInputElement>());
  const addButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (focusId) inputs.current.get(focusId)?.focus(); }, [focusId, items.length]);
  function add() {
    const id = crypto.randomUUID();
    onChange([...items, { id, text: "", done: false }]);
    setFocusId(id);
  }
  function update(id: string, values: Partial<ChecklistItem>) {
    onChange(items.map(item => item.id === id ? { ...item, ...values } : item));
  }
  function remove(index: number) {
    const next = items[index + 1] ?? items[index - 1];
    onChange(items.filter((_, position) => position !== index));
    if (next) setFocusId(next.id); else { setFocusId(null); addButton.current?.focus(); }
  }
  const children = linked?.children ?? [];
  const done = items.filter(item => item.done).length
    + children.filter(child => linked?.changes.get(child.id) ?? child.completed ?? false).length;
  return <section className="schedule-checklist" aria-labelledby={titleId}>
    <div className="checklist-heading"><h3 id={titleId}>체크리스트</h3><span aria-live="polite">{done}/{items.length + children.length} 완료</span></div>
    {linked && <section className="linked-checklist" aria-labelledby={`${titleId}-children`}>
      <div className="linked-checklist-heading">
        <h4 id={`${titleId}-children`}>하위 일정</h4>
        <button type="button" className="cancel-button checklist-add" onClick={linked.onAdd}>하위 일정 추가</button>
      </div>
      {children.length ? <ul>{children.map(child => {
        const wasCompleted = child.completed ?? false;
        const checked = linked.changes.get(child.id) ?? wasCompleted;
        return <li key={child.id} className="linked-checklist-item">
          <label>
            <input type="checkbox" checked={checked} aria-label={`하위 일정 완료: ${child.title}`}
              onChange={event => linked.onToggle(child.id, event.target.checked, wasCompleted)} />
            <span>{child.title}<small>{formatPeriod(child)}</small></span>
          </label>
        </li>;
      })}</ul> : <p className="checklist-empty">하위 일정이 없습니다.</p>}
      <h4>직접 추가한 항목</h4>
    </section>}
    {items.length === 0 && <p className="checklist-empty">일정에 필요한 할 일을 추가하세요.</p>}
    <ul>{items.map((item, index) => <li key={item.id} className={item.done ? "checklist-item is-done" : "checklist-item"}>
      <input type="checkbox" checked={item.done} aria-label={`${index + 1}번 항목 완료`} onChange={event => update(item.id, { done: event.target.checked })} />
      <input ref={element => { if (element) inputs.current.set(item.id, element); else inputs.current.delete(item.id); }}
        value={item.text} aria-label={`${index + 1}번 체크항목`} placeholder="할 일을 입력하세요" onChange={event => update(item.id, { text: event.target.value })}
        onKeyDown={event => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); add(); } }} />
      <button type="button" className="checklist-remove" aria-label={`${index + 1}번 항목 삭제`} onClick={() => remove(index)}>삭제</button>
    </li>)}</ul>
    <button ref={addButton} type="button" className="cancel-button checklist-add" onClick={add}>+ 항목 추가</button>
  </section>;
}
