import { useEffect, useState } from "react";
import { installScheduleFeature } from "./features/schedules/scheduleFeature";
import { installWorkPlanUi } from "./features/schedules/workPlanUi";
import { connectWorkPlan } from "./workplanCoordinator";

export default function App() {
  const [ui] = useState(installWorkPlanUi);
  const [feature] = useState(installScheduleFeature);
  useEffect(() => connectWorkPlan(ui.service, feature), [ui, feature]);
  const Screen = ui.Screen;
  return <Screen hierarchy />;
}
