import { useCallback, useEffect, useRef, useState } from "react";
import { workspaceRequest } from "./workspaceApi";
import type { ProposalResponse, ProposalSummary } from "./proposalTypes";

export function useScheduleProposals() {
  const [items, setItems] = useState<ProposalSummary[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requests = useRef(new Map<string, string>());
  const refresh = useCallback(async () => {
    try {
      const value = await workspaceRequest<{ result: ProposalSummary[] }>({ operation: "listProposals", args: {} });
      setItems(value.result); setError("");
    } catch { setError("AI 등록 대기 목록에 연결하지 못했습니다."); }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 5000);
    const focus = () => { void refresh(); };
    window.addEventListener("focus", focus);
    return () => { clearInterval(timer); window.removeEventListener("focus", focus); };
  }, [refresh]);
  async function command(operation: string, args: object, expectedRevision: number) {
    const key = JSON.stringify({ operation, args, expectedRevision });
    const requestId = requests.current.get(key) ?? crypto.randomUUID();
    requests.current.set(key, requestId);
    const response = await workspaceRequest<ProposalResponse>({ operation, args, expectedRevision, requestId });
    if (operation === "applyProposal") setNotice(`선택한 ${response.proposal.result?.count ?? 0}개 일정을 등록했습니다.`);
    if (operation === "discardProposal") setNotice("AI 등록 초안을 폐기했습니다.");
    requests.current.delete(key); void refresh(); return response;
  }
  return { items, error, notice, setNotice, refresh, command };
}
export type ScheduleProposals = ReturnType<typeof useScheduleProposals>;
