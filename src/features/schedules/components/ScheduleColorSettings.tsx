import { useEffect, useRef, useState, type FormEvent } from "react";
import { colorAtDepth, validateColorSettings } from "../scheduleColors";
import type { ColorPreset, ColorSettings } from "../types";

type Props = { initial: ColorSettings; initialError: string; onSave: (settings: ColorSettings) => string; onClose: () => void };
export function ScheduleColorSettings(props: Props) {
  const [draft, setDraft] = useState(() => structuredClone(props.initial));
  const [error, setError] = useState(props.initialError);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  const preset = draft.presets.find(item => item.id === draft.activePresetId)!;
  function updatePreset(next: ColorPreset) {
    setDraft(current => ({ ...current, presets: current.presets.map(item => item.id === next.id ? next : item) }));
  }
  function addPreset() {
    const next = { id: crypto.randomUUID(), name: `새 프리셋 ${draft.presets.length + 1}`, colors: [...preset.colors] };
    setDraft(current => ({ ...current, activePresetId: next.id, presets: [...current.presets, next] }));
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const message = validateColorSettings(draft) || props.onSave(draft);
    setError(message);
    if (!message) props.onClose();
  }
  const repeated = preset.colors.some((color, index) => color.toLowerCase() === preset.colors[(index + 1) % preset.colors.length].toLowerCase());
  const preview: string[] = [];
  for (let depth = 0; depth < preset.colors.length + 1; depth++) preview.push(colorAtDepth(depth, preset.colors, preview[depth - 1]));
  return <dialog ref={dialog} className="editor color-settings" aria-labelledby="color-settings-title"
    onCancel={event => { event.preventDefault(); props.onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) props.onClose(); } }}>
    <div className="editor-header"><h2 id="color-settings-title">단계별 색상 설정</h2><button type="button" className="close-button" onClick={props.onClose} aria-label="설정 닫기">×</button></div>
    <form onSubmit={submit}>
      <p className="settings-help">자동 색상 일정에 적용됩니다. 직접 지정한 색상은 유지됩니다.</p>
      <div className="preset-choice"><label>프리셋 선택<select value={draft.activePresetId} onChange={event => setDraft({ ...draft, activePresetId: event.target.value })}>
        {draft.presets.map(item => <option key={item.id} value={item.id}>{item.name || "이름 없는 프리셋"}</option>)}
      </select></label><button type="button" className="cancel-button" onClick={addPreset}>프리셋 추가</button></div>
      <label>프리셋 이름<input value={preset.name} onChange={event => updatePreset({ ...preset, name: event.target.value })} required /></label>
      <fieldset className="depth-colors"><legend>단계별 기본색</legend>
        {preset.colors.map((color, index) => <label key={index}>{index + 1}단계<input type="color" value={color} onChange={event => updatePreset({ ...preset, colors: preset.colors.map((value, position) => position === index ? event.target.value : value) })} /></label>)}
      </fieldset>
      <div className="settings-tools"><button type="button" className="cancel-button" onClick={() => updatePreset({ ...preset, colors: [...preset.colors, preset.colors[0]] })}>단계 추가</button>
        <button type="button" className="cancel-button" disabled={preset.colors.length <= 2} onClick={() => updatePreset({ ...preset, colors: preset.colors.slice(0, -1) })}>마지막 단계 제거</button></div>
      {repeated && <p className="settings-help" role="status">인접 단계의 기본색이 같습니다. 자동 색상은 부모와 다른 후보색을 사용합니다.</p>}
      <section className="color-preview" aria-label="단계별 색상 미리보기"><h3>트리 미리보기</h3>
        {preview.map((color, index) => <div key={index} style={{ paddingLeft: Math.min(index * 12, 48) }}><span style={{ background: color }} />{index + 1}단계 {index === 0 ? "최상위 일정" : "하위 일정"}<code>{color}</code></div>)}
      </section>
      <p className="settings-help">설정한 단계보다 깊으면 색상을 순환합니다. 설정은 이 브라우저에 저장되며 저장을 눌러야 반영됩니다.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="editor-actions"><button type="button" className="cancel-button" onClick={props.onClose}>취소</button><button type="submit" className="save-button">설정 저장</button></div>
    </form>
  </dialog>;
}
