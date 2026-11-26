import { useEffect, useRef, useState } from "react";
import type { ProposalNode, ScheduleProposal } from "../proposalTypes";
import type { ScheduleWorkspace } from "../useScheduleWorkspace";
import type { ScheduleProposals } from "../useScheduleProposals";
import { ScheduleChecklist } from "./ScheduleChecklist";
import { ScheduleColorControl } from "./ScheduleColorControl";

export function ScheduleProposalDialog({ proposals, workspace, onClose }: { proposals: ScheduleProposals; workspace: ScheduleWorkspace; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [proposal, setProposal] = useState<ScheduleProposal | null>(null);
  const [nodes, setNodes] = useState<ProposalNode[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [revision, setRevision] = useState(workspace.revision);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorRef, setErrorRef] = useState<string>();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const busyRef = useRef(false);
  useEffect(() => { const el = dialog.current!; el.showModal(); return () => el.close(); }, []);
  async function load(id: string) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError("");
    try {
      const value = await proposals.get(id);
      setProposal(value.result); setNodes(structuredClone(value.result.draft.nodes)); setSelected([...value.result.draft.selectedRefs]);
      setRevision(value.revision); setDirty(value.result.preview.baseRevision !== value.revision); setConfirmDiscard(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "초안을 불러오지 못했습니다."); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function edit(ref: string, patch: Partial<ProposalNode>) {
    setNodes(current => current.map(node => node.ref === ref ? { ...node, ...patch } : node)); setDirty(true); setError(""); setErrorRef(undefined);
  }
  function toggle(ref: string, value: boolean) {
    const next = new Set(selected);
    if (value) {
      let node = nodes.find(n => n.ref === ref);
      while (node) { next.add(node.ref); node = node.parentRef ? nodes.find(n => n.ref === node!.parentRef) : undefined; }
    } else {
      const excluded = new Set([ref]);
      for (const node of nodes) if (node.parentRef && excluded.has(node.parentRef)) excluded.add(node.ref);
      for (const item of excluded) next.delete(item);
    }
    setSelected([...next]); setDirty(true); setError("");
  }
  async function act(operation: "reviewProposal" | "applyProposal" | "discardProposal") {
    if (!proposal || busyRef.current) return;
    if (operation === "discardProposal" && !confirmDiscard) { setConfirmDiscard(true); return; }
    busyRef.current = true; setBusy(true); setError(""); setErrorRef(undefined);
    try {
      const args = { id: proposal.id, version: proposal.version, ...(operation === "reviewProposal" ? { nodes, selectedRefs: selected } : {}) };
      const result = await proposals.command(operation, args, operation === "applyProposal" ? proposal.preview.baseRevision : revision);
      setProposal(result.proposal); setRevision(result.revision); setDirty(false); setConfirmDiscard(false);
      if (operation !== "reviewProposal") { await workspace.refresh(); onClose(); }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "처리하지 못했습니다.");
      setErrorRef(cause instanceof Error && "ref" in cause && typeof cause.ref === "string" ? cause.ref : undefined);
      // Refresh only server metadata; never replace the user's editable nodes/selection.
      try {
        const latest = await proposals.get(proposal.id);
        setRevision(latest.revision);
        // A completed request with a lost response is recovered by replaying its exact request.
        if (latest.result.status !== "pending") {
          proposals.setNotice(latest.result.status === "applied" ? `선택한 ${latest.result.result?.count ?? 0}개 일정의 등록을 확인했습니다.` : "AI 등록 초안이 폐기되었습니다.");
          await proposals.refresh(); await workspace.refresh(); onClose();
        }
        else if (latest.result.version !== proposal.version || latest.revision !== proposal.preview.baseRevision) {
          setProposal(latest.result); setDirty(true);
        }
      } catch { /* Retain request identity and inputs for a network retry. */ }
    } finally { busyRef.current = false; setBusy(false); }
  }
  const stale = proposal && (dirty || workspace.revision !== proposal.preview.baseRevision);
  const selectedNodes = nodes.filter(n => selected.includes(n.ref));
  const plans = selectedNodes.filter(n => (n.kind ?? "plan") === "plan").length;
  return <dialog ref={dialog} className="editor proposal-dialog" aria-labelledby="proposal-title" onCancel={event => { if (event.target !== event.currentTarget) return; event.preventDefault(); if (!busy) onClose(); }}>
    <div className="editor-header"><h2 id="proposal-title">AI 일정 등록 미리보기</h2><button type="button" className="close-button" disabled={busy} onClick={onClose} aria-label="미리보기 닫기">×</button></div>
    {!proposal ? <>
      <p>AI가 제안한 초안을 선택해 확인한 후 등록하세요.</p>
      {proposals.error && <p role="alert">{proposals.error}</p>}
      {!proposals.items.length && <p>등록을 기다리는 AI 초안이 없습니다.</p>}
      <div className="proposal-list">{proposals.items.map(item => <button type="button" className="proposal-entry" key={item.id} disabled={busy} onClick={() => void load(item.id)}><strong>{item.title}</strong><span>{item.count}개 일정 · 확인하기</span></button>)}</div>
    </> : <>
      <div className="proposal-summary" role="status">계획 {plans}개 · 작업 {selectedNodes.length - plans}개 · 선택 {selectedNodes.length}개 <span>{workspace.timeZone}</span></div>
      <p className="editor-context">작업만 달력·간트에 표시됩니다. 하위 선택 시 상위도 선택되며, 상위 해제 시 하위도 제외됩니다.</p>
      <div className="proposal-body" aria-busy={busy}>
        {nodes.map(node => {
          const row = proposal.preview.rows.find(r => r.ref === node.ref);
          const hasChildren = nodes.some(n => n.parentRef === node.ref);
          let depth = 0, parent = node.parentRef;
          while (parent && depth < 100) { depth++; parent = nodes.find(n => n.ref === parent)?.parentRef; }
          return <article key={node.ref} aria-invalid={errorRef === node.ref} className={`proposal-node ${selected.includes(node.ref) ? "" : "proposal-excluded"}`} style={{ marginLeft: Math.min(depth * 12, 36) }}>
            <div className="proposal-node-heading"><input type="checkbox" aria-label={`${node.title} 등록 선택`} checked={selected.includes(node.ref)} disabled={busy} onChange={event => toggle(node.ref, event.target.checked)} /><span className="proposal-color" style={{ background: row?.color ?? node.color ?? "#3366dd" }} /><strong>{node.title}</strong><span>{(node.kind ?? "plan") === "task" ? "작업 · 달력 표시" : "계획"}</span></div>
            <p className="proposal-period">{row ? `${row.start.replace("T", " ")} ~ ${row.end.replace("T", " ")}` : "선택 후 미리보기에서 적용 기간을 확인하세요."}</p>
            {errorRef === node.ref && <p className="form-error">{error}</p>}
            <details><summary>상세 편집</summary><fieldset disabled={busy} className="proposal-fields">
              <label>제목<input value={node.title} maxLength={500} onChange={e => edit(node.ref, { title: e.target.value })} /></label>
              <label>구분<select aria-label="구분" value={node.kind ?? "plan"} onChange={e => edit(node.ref, { kind: e.target.value as "plan" | "task" })}><option value="plan">계획</option><option value="task">작업</option></select></label>
              <div className="time-fields"><label>시작<input type="datetime-local" step="1" value={node.start ?? ""} onChange={e => edit(node.ref, { start: e.target.value || undefined })} placeholder="상위 기간 상속" /></label>
                <label>종료<input type="datetime-local" step="1" value={node.end ?? ""} onChange={e => edit(node.ref, { end: e.target.value || undefined })} /></label></div>
              {hasChildren && <p className="editor-context">상위의 최종 표시 기간은 선택한 하위 일정에서 계산됩니다.</p>}
              <div className="proposal-color-field"><span>일정 색상</span><ScheduleColorControl color={node.color ?? row?.color ?? "#3366dd"} automaticColor={row?.color ?? "#3366dd"} mode={node.colorMode ?? "auto"} disabled={busy}
                onChoose={color => edit(node.ref, { color, colorMode: "manual" })} onRestore={() => edit(node.ref, { colorMode: "auto" })} /></div>
              <ScheduleChecklist titleId={`proposal-checklist-${node.ref}`} items={node.checklist ?? []} onChange={checklist => edit(node.ref, { checklist })} />
            </fieldset></details>
          </article>;
        })}
      </div>
      {stale && <p className="proposal-notice" role="status">내용이 변경되었습니다. 미리보기 갱신 후 등록할 수 있습니다.</p>}
      {confirmDiscard && <p role="alert">이 초안을 폐기할까요? 실제 일정은 변경되지 않습니다.</p>}
    </>}
    {error && <p role="alert" className="form-error">{error}</p>}
    <div className="editor-actions proposal-actions">
      {proposal && <button type="button" className="delete-button" disabled={busy} onClick={() => void act("discardProposal")}>{confirmDiscard ? "초안 폐기 확정" : "초안 폐기"}</button>}
      <button type="button" className="cancel-button" disabled={busy} onClick={onClose}>나중에</button>
      {proposal && <><button type="button" className="cancel-button" disabled={busy} onClick={() => void act("reviewProposal")}>미리보기 갱신</button><button type="button" className="save-button" disabled={busy || Boolean(stale) || !selected.length || proposal.status !== "pending"} onClick={() => void act("applyProposal")}>{busy ? "처리 중…" : "선택 항목 등록"}</button></>}
    </div>
  </dialog>;
}
