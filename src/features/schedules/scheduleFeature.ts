import { defaultColorSettings } from "./scheduleColors";
import { workspaceRequest } from "./workspaceApi";
import type { WorkspaceSnapshot } from "./workspaceApi";
import type { ProposalResponse } from "./proposalTypes";
import type { ProposalState, WorkPlanActions, WorkPlanFeatureService } from "./workPlanContracts";
import type { ScheduleDraft } from "./types";

type RequestLifetime = {
  controller: AbortController;
  pending: number;
  workspaceRefresh?: Promise<void>;
  proposalRefresh?: Promise<void>;
  workspaceWrites: Map<string, Promise<string>>;
  proposalWrites: Map<string, Promise<ProposalResponse>>;
};

export function createScheduleFeature(request: typeof workspaceRequest): WorkPlanFeatureService {
  let lifetime: RequestLifetime | null = null;
  let snapshot: WorkspaceSnapshot = { revision: -1, items: [], settings: defaultColorSettings(), timeZone: "Asia/Seoul" };
  let workspaceError = "";
  let proposals: ProposalState = { items: [], error: "", notice: "" };
  const listeners = new Set<() => void>();
  const requestIds = new Map<string, string>();
  const unavailable = "공통 저장소에 연결하지 못했습니다. 서버 상태를 확인하고 다시 시도해 주세요.";
  const emit = () => { for (const listener of listeners) listener(); };

  function requestId(key: string) {
    const id = requestIds.get(key) ?? crypto.randomUUID();
    requestIds.set(key, id);
    return id;
  }

  function accept(next: WorkspaceSnapshot) {
    if (next.revision < snapshot.revision) return;
    const { revision, items, settings, timeZone } = next;
    snapshot = { revision, items, settings, timeZone };
    workspaceError = "";
  }

  function refreshWorkspace(): Promise<void> {
    const current = lifetime;
    if (!current) return Promise.resolve();
    return current.workspaceRefresh ??= (async () => {
      try {
        const next = await request<WorkspaceSnapshot>(undefined, current.controller.signal);
        if (lifetime === current) { accept(next); emit(); }
      } catch {
        if (lifetime === current) { workspaceError = unavailable; emit(); }
      } finally { current.workspaceRefresh = undefined; }
    })();
  }

  function refreshProposals(): Promise<void> {
    const current = lifetime;
    if (!current) return Promise.resolve();
    return current.proposalRefresh ??= (async () => {
      try {
        const next = await request<{ result: ProposalState["items"] }>({ operation: "listProposals", args: {} }, current.controller.signal);
        if (lifetime === current) { proposals = { ...proposals, items: next.result, error: "" }; emit(); }
      } catch {
        if (lifetime === current) { proposals = { ...proposals, error: "AI 등록 대기 목록에 연결하지 못했습니다." }; emit(); }
      } finally { current.proposalRefresh = undefined; }
    })();
  }

  function workspaceCommand(operation: string, args: object, expectedRevision = snapshot.revision): Promise<string> {
    const current = lifetime;
    if (!current) return Promise.resolve(unavailable);
    const key = "workspace:" + JSON.stringify({ operation, args, expectedRevision });
    const pending = current.workspaceWrites.get(key);
    if (pending) return pending;
    const id = requestId(key);
    current.pending++;
    const write = Promise.resolve().then(async () => {
      try {
        if (lifetime !== current) return unavailable;
        const next = await request<WorkspaceSnapshot>({ operation, args, expectedRevision, requestId: id }, current.controller.signal);
        if (lifetime !== current) return unavailable;
        accept(next);
        requestIds.delete(key);
        return "";
      } catch (cause) {
        if (lifetime !== current) return unavailable;
        const message = cause instanceof Error ? cause.message : "저장하지 못했습니다. 다시 시도해 주세요.";
        workspaceError = message;
        void refreshWorkspace();
        return message;
      } finally {
        current.pending--;
        current.workspaceWrites.delete(key);
        if (lifetime === current) emit();
      }
    });
    current.workspaceWrites.set(key, write);
    emit();
    return write;
  }

  function proposalCommand(operation: string, args: object, expectedRevision: number): Promise<ProposalResponse> {
    const current = lifetime;
    if (!current) return Promise.reject(new Error(unavailable));
    const key = "proposal:" + JSON.stringify({ operation, args, expectedRevision });
    const pending = current.proposalWrites.get(key);
    if (pending) return pending;
    const id = requestId(key);
    const write = Promise.resolve().then(async () => {
      try {
        if (lifetime !== current) throw new Error(unavailable);
        const response = await request<ProposalResponse>({ operation, args, expectedRevision, requestId: id }, current.controller.signal);
        if (lifetime !== current) throw new Error(unavailable);
        if (operation === "applyProposal") proposals = { ...proposals, notice: `선택한 ${response.proposal.result?.count ?? 0}개 일정을 등록했습니다.` };
        if (operation === "discardProposal") proposals = { ...proposals, notice: "AI 등록 초안을 폐기했습니다." };
        requestIds.delete(key);
        emit();
        const priorRefresh = current.proposalRefresh;
        if (priorRefresh) void priorRefresh.then(() => { if (lifetime === current) void refreshProposals(); });
        else void refreshProposals();
        return response;
      } finally { current.proposalWrites.delete(key); }
    });
    current.proposalWrites.set(key, write);
    return write;
  }

  async function read<T>(operation: string, args: object): Promise<T> {
    const current = lifetime;
    if (!current) throw new Error(unavailable);
    const result = await request<T>({ operation, args }, current.controller.signal);
    if (lifetime !== current) throw new Error(unavailable);
    return result;
  }

  const actions: WorkPlanActions = {
    setProposalNotice(notice) { proposals = { ...proposals, notice }; emit(); },
    previewImport: args => read("previewImport", args),
    getProposal: id => read("getProposal", { id }),
    refreshWorkspace, refreshProposals, workspaceCommand, proposalCommand,
    saveSchedule(draft, id, parentId, revision, childCompletions = []) {
      if (!draft.title.trim()) return Promise.resolve("일정 제목을 입력해 주세요.");
      if (!id) return workspaceCommand("createTree", { nodes: [{ ...draft, ref: "new", parentId }] }, revision);
      const patch: Partial<ScheduleDraft> = { ...draft };
      if (snapshot.items.some(item => item.parentId === id)) {
        delete patch.start;
        delete patch.end;
      }
      return workspaceCommand("update", { id, patch, childCompletions }, revision);
    },
    moveSchedule(id, start, end) {
      if (!snapshot.items.some(item => item.parentId === id)) void workspaceCommand("update", { id, patch: { start, end } });
    },
    reorderSchedule(id, target) {
      const sibling = snapshot.items.find(item => item.id === target);
      if (sibling) void workspaceCommand("move", { id, parentId: sibling.parentId, beforeId: target });
    },
    removeSchedule: (id, revision) => workspaceCommand("delete", { id }, revision),
  };

  return {
    actions,
    getState: () => ({
      workspace: { ...snapshot, error: workspaceError, busy: Boolean(lifetime?.pending), blocked: snapshot.revision < 0 || Boolean(workspaceError) },
      proposals,
    }),
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    start() {
      if (!lifetime) lifetime = { controller: new AbortController(), pending: 0, workspaceWrites: new Map(), proposalWrites: new Map() };
    },
    stop() {
      const closing = lifetime;
      lifetime = null;
      closing?.controller.abort();
    },
  };
}

export function installScheduleFeature() {
  return createScheduleFeature(workspaceRequest);
}
