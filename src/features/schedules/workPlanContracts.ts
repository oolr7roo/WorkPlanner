import type { ProposalResponse, ProposalSummary, ScheduleProposal } from "./proposalTypes";
import type { ScheduleCompletion, ScheduleDraft } from "./types";
import type { WorkspaceSnapshot } from "./workspaceApi";

export type WorkspaceState = WorkspaceSnapshot & { error: string; busy: boolean; blocked: boolean };
export type ProposalState = { items: ProposalSummary[]; error: string; notice: string };
export type WorkPlanState = { workspace: WorkspaceState; proposals: ProposalState };

export type WorkPlanActions = {
  refreshWorkspace: () => Promise<void>;
  refreshProposals: () => Promise<void>;
  setProposalNotice: (notice: string) => void;
  previewImport: (args: object) => Promise<{ revision: number; result: { added: number; skipped: number } }>;
  getProposal: (id: string) => Promise<{ revision: number; result: ScheduleProposal }>;
  workspaceCommand: (operation: string, args: object, revision?: number) => Promise<string>;
  proposalCommand: (operation: string, args: object, revision: number) => Promise<ProposalResponse>;
  saveSchedule: (draft: ScheduleDraft, id: string | null, parentId: string | null, revision: number, completions?: ScheduleCompletion[]) => Promise<string>;
  moveSchedule: (id: string, start: string, end: string) => void;
  reorderSchedule: (id: string, target: string) => void;
  removeSchedule: (id: string, revision: number) => Promise<string>;
};

export type WorkPlanUiService = {
  getState: () => WorkPlanState;
  subscribe: (listener: () => void) => () => void;
  show: (state: WorkPlanState) => void;
  connect: (actions: WorkPlanActions) => () => void;
  actions: WorkPlanActions;
};

export type WorkPlanFeatureService = {
  start: () => void;
  stop: () => void;
  getState: () => WorkPlanState;
  subscribe: (listener: () => void) => () => void;
  actions: WorkPlanActions;
};
