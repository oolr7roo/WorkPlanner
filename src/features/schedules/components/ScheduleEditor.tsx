import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ScheduleDraft } from "../types";
import { adjustEndForStartChange } from "../scheduleDates";

type Props = { initial: ScheduleDraft; editing: boolean; parentTitle?: string; hasChildren: boolean; automaticColor: string; onSave: (draft: ScheduleDraft) => string; onDelete: () => void; onClose: () => void };
export function ScheduleEditor(props: Props) {
  const [draft, setDraft] = useState(props.initial);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  function submit(event: FormEvent) { event.preventDefault(); const error = props.onSave(draft); setError(error); if (!error) props.onClose(); }
  function changeStart(start: string) {
    if (props.hasChildren) return;
    setDraft(current => ({ ...current, start,
      end: props.editing ? adjustEndForStartChange(current.start, current.end, start) : current.end }));
  }
  return <dialog ref={dialog} className="editor" aria-labelledby="editor-title" onCancel={event => { event.preventDefault(); props.onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) props.onClose(); } }}>
    <div className="editor-header"><h2 id="editor-title">{props.editing ? "일정 수정" : props.parentTitle ? "하위 일정 추가" : "새 일정"}</h2><button type="button" className="close-button" onClick={props.onClose} aria-label="닫기">×</button></div>
    {props.parentTitle && <p className="editor-context">상위 일정: {props.parentTitle}</p>}
    <form onSubmit={submit}>
      <label>제목<input autoFocus value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="일정 제목" required /></label>
      {props.hasChildren && <p className="editor-context">상위 일정의 기간은 하위 일정의 시작·종료에 맞춰 자동 계산됩니다.</p>}
      <div className="time-fields"><label>시작<input type="datetime-local" disabled={props.hasChildren} value={draft.start} onChange={event => changeStart(event.target.value)} required /></label>
        <label>종료<input type="datetime-local" disabled={props.hasChildren} value={draft.end} onChange={event => setDraft({ ...draft, end: event.target.value })} required /></label></div>
      <div className="color-mode-fields"><label>색상 방식<select value={draft.colorMode ?? "manual"} onChange={event => setDraft({ ...draft, colorMode: event.target.value === "auto" ? "auto" : "manual" })}>
        <option value="auto">자동 · 단계별 색상</option><option value="manual">직접 지정</option>
      </select></label><label className="color-field">색상<input type="color" disabled={draft.colorMode === "auto"} value={draft.colorMode === "auto" ? props.automaticColor : draft.color} onChange={event => setDraft({ ...draft, color: event.target.value, colorMode: "manual" })} /></label></div>
      {error && <p role="alert" className="form-error">{error}</p>}
      {confirmDelete && <p role="alert" className="form-error">이 일정을 삭제할까요? 하위 일정은 한 단계 위로 이동해 보존됩니다.</p>}
      <div className="editor-actions">{props.editing && <button type="button" className="delete-button" onClick={() => { if (confirmDelete) { props.onDelete(); props.onClose(); } else setConfirmDelete(true); }}>{confirmDelete ? "삭제 확정" : "삭제"}</button>}
        <button type="button" className="cancel-button" onClick={props.onClose}>취소</button><button type="submit" className="save-button">저장</button></div>
    </form>
  </dialog>;
}
