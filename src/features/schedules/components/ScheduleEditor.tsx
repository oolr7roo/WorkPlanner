import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ScheduleDraft, ScheduleKind } from "../types";
import { adjustEndForStartChange } from "../scheduleDates";
import { copyChecklist } from "../scheduleChecklist";
import { ScheduleColorControl } from "./ScheduleColorControl";
import { ScheduleChecklist } from "./ScheduleChecklist";

type Props = { initial: ScheduleDraft; editing: boolean; parentTitle?: string; hasChildren: boolean; automaticColor: string; onSave: (draft: ScheduleDraft) => Promise<string>; onDelete: () => Promise<string>; onClose: () => void };
export function ScheduleEditor(props: Props) {
  const [draft, setDraft] = useState(() => ({ ...props.initial, checklist: copyChecklist(props.initial.checklist) }));
  const [busy, setBusy] = useState(false);
  const close = () => { if (!busy) props.onClose(); };
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  async function submit(event: FormEvent) { event.preventDefault(); if (busy) return; setBusy(true); const error = await props.onSave(draft); setError(error); setBusy(false); if (!error) props.onClose(); }
  async function remove() { if (!confirmDelete) { setConfirmDelete(true); return; } setBusy(true); const error = await props.onDelete(); setError(error); setBusy(false); if (!error) props.onClose(); }
  function changeStart(start: string) {
    if (props.hasChildren) return;
    setDraft(current => ({ ...current, start,
      end: props.editing ? adjustEndForStartChange(current.start, current.end, start) : current.end }));
  }
  return <dialog ref={dialog} className="editor" aria-labelledby="editor-title" onCancel={event => {
    event.preventDefault();
    close();
  }}
    onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } }}>
    <div className="editor-header"><div className="editor-heading">
      <ScheduleColorControl disabled={busy} color={draft.colorMode === "auto" ? props.automaticColor : draft.color} automaticColor={props.automaticColor} mode={draft.colorMode ?? "manual"}
        onChoose={color => setDraft(current => ({ ...current, color, colorMode: "manual" }))}
        onRestore={() => setDraft(current => ({ ...current, color: props.automaticColor, colorMode: "auto" }))} />
      <h2 id="editor-title">{props.editing ? "일정 수정" : props.parentTitle ? "하위 일정 추가" : "새 일정"}</h2></div><button type="button" className="close-button" disabled={busy} onClick={close} aria-label="닫기">×</button></div>
    {props.parentTitle && <p className="editor-context">상위 일정: {props.parentTitle}</p>}
    <form onSubmit={submit} aria-busy={busy}><fieldset className="editor-fields" disabled={busy}>
      <label>제목<input autoFocus value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="일정 제목" required /></label>
      <label className="schedule-kind-field">구분<select value={draft.kind ?? "task"} onChange={event => setDraft(current => ({ ...current, kind: event.target.value as ScheduleKind }))}>
        <option value="task">작업</option><option value="plan">계획</option>
      </select></label>
      {props.hasChildren && <p className="editor-context">상위 일정의 기간은 하위 일정의 시작·종료에 맞춰 자동 계산됩니다.</p>}
      <div className="time-fields"><label>시작<input type="datetime-local" disabled={props.hasChildren} value={draft.start} onChange={event => changeStart(event.target.value)} required /></label>
        <label>종료<input type="datetime-local" disabled={props.hasChildren} value={draft.end} onChange={event => setDraft({ ...draft, end: event.target.value })} required /></label></div>
      <ScheduleChecklist items={draft.checklist} onChange={checklist => setDraft(current => ({ ...current, checklist }))} />
      {error && <p role="alert" className="form-error">{error}</p>}
      {confirmDelete && <p role="alert" className="form-error">이 일정을 삭제할까요? 하위 일정은 한 단계 위로 이동해 보존됩니다.</p>}
      <div className="editor-actions">{props.editing && <button type="button" className="delete-button" onClick={() => void remove()}>{confirmDelete ? "삭제 확정" : "삭제"}</button>}
        <button type="button" className="cancel-button" disabled={busy} onClick={close}>취소</button><button type="submit" className="save-button">저장</button></div>
    </fieldset></form>
  </dialog>;
}
