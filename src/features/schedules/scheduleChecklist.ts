import type { ChecklistItem } from "./types";

export function validateChecklist(value: unknown): string {
  if (value === undefined) return "";
  if (!Array.isArray(value)) return "체크리스트 형식을 확인해 주세요.";
  const ids = new Set<string>();
  for (const item of value) {
    if (!item || typeof item.id !== "string" || !item.id.trim() || ids.has(item.id)
      || typeof item.text !== "string" || typeof item.done !== "boolean") return "체크리스트 항목 형식을 확인해 주세요.";
    if (!item.text.trim()) return "체크리스트의 빈 항목을 입력하거나 삭제해 주세요.";
    ids.add(item.id);
  }
  return "";
}

export function copyChecklist(items: readonly ChecklistItem[] = []): ChecklistItem[] {
  return items.map(item => ({ id: item.id, text: item.text, done: item.done }));
}

/** Call after validation; never mutate the editor's draft or persisted items. */
export function normalizeChecklist(items: readonly ChecklistItem[] = []): ChecklistItem[] {
  return copyChecklist(items).map(item => ({ ...item, text: item.text.trim() }));
}
