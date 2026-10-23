import type { Schedule, ScheduleDraft } from "./types";

export type ProposalNode = Omit<ScheduleDraft, "start" | "end" | "color"> & { ref: string; parentRef?: string; parentId?: string | null; start?: string; end?: string; color?: string; allDay?: boolean };
export type ProposalSummary = { id: string; version: number; status: string; title: string; count: number; createdAt: string };
export type ScheduleProposal = { id: string; version: number; status: "pending" | "applied" | "discarded"; original: ProposalNode[];
  draft: { nodes: ProposalNode[]; selectedRefs: string[] };
  preview: { baseRevision: number; rows: (Schedule & { ref: string })[]; additions: Schedule[]; created: Record<string, string> };
  result: { created: Record<string, string>; count: number } | null };
export type ProposalResponse = { revision: number; timeZone: string; proposal: ScheduleProposal };
