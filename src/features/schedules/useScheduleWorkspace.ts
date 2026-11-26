import { useCallback, useEffect, useRef, useState } from "react";
import { defaultColorSettings } from "./scheduleColors";
import { workspaceRequest, type WorkspaceSnapshot } from "./workspaceApi";
export function useScheduleWorkspace() {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>({ revision: -1, items: [], settings: defaultColorSettings(), timeZone: "Asia/Seoul" });
  const current = useRef(snapshot);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(0);
  const requests = useRef(new Map<string, string>());
  const accept = useCallback((next: WorkspaceSnapshot) => {
    if (next.revision >= current.current.revision) { current.current = next; setSnapshot(next); }
  }, []);
  const refresh = useCallback(async () => {
    try { accept(await workspaceRequest<WorkspaceSnapshot>()); setError(""); }
    catch { setError("공통 저장소에 연결하지 못했습니다. 서버 상태를 확인하고 다시 시도해 주세요."); }
  }, [accept]);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 5000);
    const focus = () => { void refresh(); };
    window.addEventListener("focus", focus);
    return () => { clearInterval(timer); window.removeEventListener("focus", focus); };
  }, [refresh]);
  async function command(operation: string, args: object, expectedRevision = current.current.revision): Promise<string> {
    const key = JSON.stringify({ operation, args, expectedRevision });
    const requestId = requests.current.get(key) ?? crypto.randomUUID();
    requests.current.set(key, requestId); setPending(value => value + 1);
    try {
      accept(await workspaceRequest<WorkspaceSnapshot>({ operation, args, expectedRevision, requestId }));
      requests.current.delete(key); setError(""); return "";
    } catch (cause) {
      void refresh();
      const message = cause instanceof Error ? cause.message : "저장하지 못했습니다. 다시 시도해 주세요.";
      setError(message); return message;
    } finally { setPending(value => value - 1); }
  }
  return { ...snapshot, getSnapshot: () => current.current, error, busy: pending > 0, blocked: snapshot.revision < 0 || Boolean(error), refresh, command };
}
export type ScheduleWorkspace = ReturnType<typeof useScheduleWorkspace>;
