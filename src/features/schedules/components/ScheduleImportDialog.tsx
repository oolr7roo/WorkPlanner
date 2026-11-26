import { useEffect, useRef, useState } from "react";
import { readSchedules } from "../scheduleStorage";
import { readColorSettings } from "../scheduleColorStorage";
import type { ScheduleWorkspace } from "../useScheduleWorkspace";
export function ScheduleImportDialog({ workspace, onClose }: { workspace: ScheduleWorkspace; onClose: () => void }) {
  const [legacy] = useState(readSchedules);
  const [colors] = useState(readColorSettings);
  const [includeSettings, setIncludeSettings] = useState(false);
  const [preview, setPreview] = useState<{ revision: number; message: string } | null>(null);
  const [error, setError] = useState(legacy.error);
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  const args = { items: legacy.items, includeSettings, ...(includeSettings ? { settings: colors.settings } : {}) };
  async function inspect() {
    setBusy(true); setPreview(null);
    try {
      const result = await workspace.previewImport(args);
      setPreview({ revision: result.revision, message: `추가 ${result.result.added}개 · 동일 일정 ${result.result.skipped}개` }); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "미리보기에 실패했습니다."); }
    finally { setBusy(false); }
  }
  async function apply() {
    if (!preview) return;
    setBusy(true);
    const message = await workspace.command("import", args, preview.revision);
    setError(message); setBusy(false); if (!message) onClose();
  }
  return <dialog ref={dialog} className="editor import-dialog" aria-labelledby="import-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="editor-header"><h2 id="import-title">기존 일정 가져오기</h2><button type="button" className="close-button" disabled={busy} onClick={onClose} aria-label="가져오기 닫기">×</button></div>
    <p>이 브라우저의 일정 {legacy.items.length}개를 공통 저장소로 가져옵니다. 브라우저 원본은 보존됩니다.</p>
    <label><input type="checkbox" checked={includeSettings} disabled={busy || Boolean(colors.error)} onChange={event => { setIncludeSettings(event.target.checked); setPreview(null); }} />색상 설정도 가져오기 (공통 설정 교체)</label>
    {colors.error && <p role="alert">{colors.error}</p>}
    {preview && <p role="status">{preview.message}</p>}
    {error && <p role="alert" className="form-error">{error}</p>}
    <div className="editor-actions"><button type="button" className="cancel-button" disabled={busy} onClick={onClose}>취소</button>
      <button type="button" className="cancel-button" disabled={busy || Boolean(legacy.error)} onClick={() => void inspect()}>미리보기</button>
      <button type="button" className="save-button" disabled={busy || !preview} onClick={() => void apply()}>가져오기 적용</button></div>
  </dialog>;
}
