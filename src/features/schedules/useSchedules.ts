import { useEffect, useMemo, useState } from "react";
import type { ScheduleDraft } from "./types";
import { effectiveSchedules } from "./scheduleDates";
import { readSchedules, writeSchedules } from "./scheduleStorage";
import { removeSchedule, reorder, siblings } from "./scheduleTree";
import { draftAutomaticColor, resolveScheduleColors } from "./scheduleColors";

export function useSchedules(colors: readonly string[]) {
  const [initial] = useState(readSchedules);
  const [items, setItems] = useState(initial.items);
  const [storageError, setStorageError] = useState(initial.error);
  useEffect(() => {
    if (initial.error) return;
    try { writeSchedules(items); setStorageError(""); }
    catch { setStorageError("브라우저 저장소에 일정을 저장할 수 없습니다. 현재 변경은 이 화면에만 유지됩니다."); }
  }, [items, initial.error]);
  const effective = useMemo(() => resolveScheduleColors(effectiveSchedules(items), colors), [items, colors]);
  function save(draft: ScheduleDraft, id: string | null, parentId: string | null) {
    if (initial.error) return "일정 복원 오류를 먼저 해결해 주세요.";
    const title = draft.title.trim();
    if (!title) return "일정 제목을 입력해 주세요.";
    if (draft.colorMode !== undefined && draft.colorMode !== "auto" && draft.colorMode !== "manual") return "색상 모드를 확인해 주세요.";
    if (!Number.isFinite(Date.parse(draft.start)) || !Number.isFinite(Date.parse(draft.end)) || Date.parse(draft.end) <= Date.parse(draft.start)) return "종료 시간을 시작 시간보다 늦게 설정해 주세요.";
    const values = { ...draft, title, start: draft.start.length === 16 ? `${draft.start}:00` : draft.start, end: draft.end.length === 16 ? `${draft.end}:00` : draft.end };
    if (id) setItems(current => current.map(item => item.id === id ? { ...item, ...values } : item));
    else {
      const newId = crypto.randomUUID();
      setItems(current => [...current, { ...values, id: newId, parentId, order: siblings(current, parentId).length }]);
    }
    return "";
  }
  function moveTime(id: string, start: string, end: string) {
    if (items.some(item => item.parentId === id) || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end)) || Date.parse(end) <= Date.parse(start)) return;
    setItems(current => current.map(item => item.id === id ? { ...item, start, end } : item));
  }
  return { items, effective, storageError, blocked: Boolean(initial.error), save, moveTime,
    automaticColor: (parentId: string | null) => draftAutomaticColor(items, parentId, colors),
    remove: (id: string) => setItems(current => removeSchedule(current, id)),
    reorder: (id: string, target: string) => setItems(current => reorder(current, id, target)) };
}
