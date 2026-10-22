import { useEffect, useRef, useState } from "react";
import type { ChecklistItem } from "../types";

type Props = { items: ChecklistItem[]; onChange: (items: ChecklistItem[]) => void };
export function ScheduleChecklist({ items, onChange }: Props) {
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
  return <section className="schedule-checklist" aria-labelledby="checklist-title">
    <div className="checklist-heading"><h3 id="checklist-title">체크리스트</h3><span aria-live="polite">{items.filter(item => item.done).length}/{items.length} 완료</span></div>
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
