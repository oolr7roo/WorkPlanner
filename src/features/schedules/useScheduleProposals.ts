import { useSyncExternalStore } from "react";
import type { WorkPlanUiService } from "./workPlanContracts";

export function useScheduleProposals(ui: WorkPlanUiService) {
  const view = useSyncExternalStore(ui.subscribe, () => ui.getState().proposals);
  return {
    ...view,
    setNotice: ui.actions.setProposalNotice,
    refresh: ui.actions.refreshProposals,
    get: ui.actions.getProposal,
    command: ui.actions.proposalCommand,
  };
}

export type ScheduleProposals = ReturnType<typeof useScheduleProposals>;
