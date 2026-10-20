import { useMemo, useState } from "react";
import { readCollapsed, writeCollapsed } from "./scheduleStorage";
import { visibleRows } from "./scheduleTree";
import type { Schedule } from "./types";

export function useScheduleTree(items: Schedule[]) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  function toggle(id: string) {
    setSelected(id);
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsed(next);
    try { writeCollapsed(next); setError(""); }
    catch { setError("접힘 상태를 저장하지 못했습니다. 현재 화면에서는 유지됩니다."); }
  }
  function expand(id: string) {
    if (collapsed.has(id)) toggle(id);
  }
  return { rows: useMemo(() => visibleRows(items, collapsed), [items, collapsed]), collapsed, selected, toggle, expand, error };
}
