import { useEffect } from "react";
import { defaultColorSettings } from "./scheduleColors";
import { WorkPlanScreen } from "./WorkPlanScreen";
import type { WorkPlanActions, WorkPlanState, WorkPlanUiService } from "./workPlanContracts";

export function createWorkPlanUi(): WorkPlanUiService {
  let state: WorkPlanState = {
    workspace: { revision: -1, items: [], settings: defaultColorSettings(), timeZone: "Asia/Seoul", error: "", busy: false, blocked: true },
    proposals: { items: [], error: "", notice: "" },
  };
  let connected: WorkPlanActions | null = null;
  const listeners = new Set<() => void>();
  const unavailable = "공통 저장소에 연결하지 못했습니다. 서버 상태를 확인하고 다시 시도해 주세요.";
  return {
    getState: () => state,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    show(next) { state = next; for (const listener of listeners) listener(); },
    connect(actions) {
      connected = actions;
      return () => { if (connected === actions) connected = null; };
    },
    actions: {
      refreshWorkspace: () => connected?.refreshWorkspace() ?? Promise.resolve(),
      refreshProposals: () => connected?.refreshProposals() ?? Promise.resolve(),
      setProposalNotice: notice => connected?.setProposalNotice(notice),
      previewImport: args => connected?.previewImport(args) ?? Promise.reject(new Error(unavailable)),
      getProposal: id => connected?.getProposal(id) ?? Promise.reject(new Error(unavailable)),
      workspaceCommand: (...args) => connected?.workspaceCommand(...args) ?? Promise.resolve(unavailable),
      proposalCommand: (...args) => connected?.proposalCommand(...args) ?? Promise.reject(new Error(unavailable)),
      saveSchedule: (...args) => connected?.saveSchedule(...args) ?? Promise.resolve(unavailable),
      moveSchedule: (...args) => connected?.moveSchedule(...args),
      reorderSchedule: (...args) => connected?.reorderSchedule(...args),
      removeSchedule: (...args) => connected?.removeSchedule(...args) ?? Promise.resolve(unavailable),
    },
  };
}

export function installWorkPlanUi() {
  const service = createWorkPlanUi();
  function Screen({ hierarchy }: { hierarchy: boolean }) {
    useEffect(() => {
      const refresh = () => { void service.actions.refreshWorkspace(); void service.actions.refreshProposals(); };
      const timer = window.setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 5000);
      window.addEventListener("focus", refresh);
      return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
    }, []);
    return <WorkPlanScreen ui={service} hierarchy={hierarchy} />;
  }
  return { service, Screen };
}
