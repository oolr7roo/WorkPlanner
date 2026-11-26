import type { WorkPlanFeatureService, WorkPlanUiService } from "./features/schedules/workPlanContracts";

export function connectWorkPlan(ui: WorkPlanUiService, feature: WorkPlanFeatureService) {
  const publish = () => ui.show(structuredClone(feature.getState()));
  const unsubscribe = feature.subscribe(publish);
  const disconnect = ui.connect(feature.actions);
  feature.start();
  publish();
  void feature.actions.refreshWorkspace();
  void feature.actions.refreshProposals();

  return () => {
    disconnect();
    unsubscribe();
    feature.stop();
  };
}
