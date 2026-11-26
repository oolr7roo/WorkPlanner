import { randomUUID } from "node:crypto";
import { WorkspaceError, canonical } from "../../database/repository.mjs";
import { validateChecklist, normalizeChecklist } from "../../src/features/schedules/scheduleChecklist.ts";
import { defaultColorSettings, validateColorSettings, resolveScheduleColors } from "../../src/features/schedules/scheduleColors.ts";
import { effectiveSchedules } from "../../src/features/schedules/scheduleDates.ts";
export { defaultColorSettings, effectiveSchedules };

export function invalid(message) { throw new WorkspaceError(400, "INVALID_INPUT", message); }
export function wallDate(value, timeZone) {
  if (typeof value !== "string") invalid("시작·종료 날짜가 필요합니다.");
  if (/(Z|[+-]\d\d:\d\d)$/.test(value)) {
    const original = value.replace(/(Z|[+-]\d\d:\d\d)$/, "").replace(/\.\d{1,9}$/, "");
    wallDate(original, timeZone);
    const instant = new Date(value);
    if (!Number.isFinite(instant.getTime())) invalid("날짜 형식을 확인해 주세요.");
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(instant).map(p => [p.type, p.value]));
    value = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
  }
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d)?$/.test(value)) invalid("날짜는 현지 YYYY-MM-DDTHH:mm:ss 또는 offset이 있는 ISO 형식이어야 합니다.");
  const full = value.length === 16 ? `${value}:00` : value;
  const check = new Date(`${full}Z`);
  if (!Number.isFinite(check.getTime()) || check.toISOString().slice(0, 19) !== full) invalid("존재하지 않는 날짜 또는 시간입니다.");
  return full;
}
export function normalizeItem(input, timeZone, legacy = false) {
  if (!input || typeof input !== "object" || Array.isArray(input)) invalid("일정 형식을 확인해 주세요.");
  const { completed, ...fields } = input;
  if (completed !== undefined && typeof completed !== "boolean") invalid("완료 상태를 확인해 주세요.");
  const kind = input.kind ?? (legacy ? "task" : "plan"), colorMode = input.colorMode ?? (legacy ? "manual" : "auto");
  if (input.allDay !== undefined && typeof input.allDay !== "boolean") invalid("allDay는 boolean이어야 합니다.");
  if (input.colorMode === null || input.kind === null || !["plan", "task"].includes(kind) || !["auto", "manual"].includes(colorMode)) invalid("일정 구분과 색상 모드를 확인해 주세요.");
  if (typeof input.title !== "string" || !input.title.trim() || input.title.length > 500) invalid("일정 제목은 1~500자로 입력해 주세요.");
  const checklistError = validateChecklist(input.checklist);
  if (checklistError) invalid(checklistError);
  if ((input.checklist?.length ?? 0) > 500) invalid("체크리스트는 일정당 500개까지 지원합니다.");
  const start = wallDate(input.start, timeZone), end = wallDate(input.end, timeZone);
  if (end <= start) invalid("종료 시간을 시작 시간보다 늦게 설정해 주세요.");
  const color = input.color ?? "#3366dd";
  if (typeof color !== "string" || !/^#[0-9a-f]{6}$/i.test(color)) invalid("색상은 #RRGGBB 형식이어야 합니다.");
  if (typeof input.id !== "string" || !input.id.trim() || input.id.length > 128) invalid("일정 ID를 확인해 주세요.");
  if (input.parentId !== null && typeof input.parentId !== "string") invalid("상위 일정 ID를 확인해 주세요.");
  if (!Number.isSafeInteger(input.order) || input.order < 0) invalid("일정 순서를 확인해 주세요.");
  return { ...fields, ...(completed ? { completed } : {}), kind, colorMode, title: input.title.trim(), start, end, color, checklist: normalizeChecklist(input.checklist) };
}
export function validateTree(items) {
  if (items.length > 10000) invalid("일정은 10000개까지 지원합니다.");
  const byId = new Map(items.map(item => [item.id, item]));
  if (byId.size !== items.length) invalid("일정 ID가 중복됩니다.");
  for (const item of items) {
    const seen = new Set([item.id]); let parent = item.parentId;
    while (parent !== null) {
      if (!byId.has(parent) || seen.has(parent)) invalid("상위 일정이 없거나 계층이 순환합니다.");
      seen.add(parent);
      if (seen.size > 100) invalid("일정 계층은 100단계까지 지원합니다.");
      parent = byId.get(parent).parentId;
    }
  }
}
export function normalizeSettings(settings) {
  const message = validateColorSettings(settings);
  if (message) invalid(message);
  if (settings.presets.length > 100 || settings.presets.some(p => p.colors.length > 100)) invalid("프리셋과 단계는 각각 100개까지 지원합니다.");
  return { ...settings, presets: settings.presets.map(p => ({ ...p, name: p.name.trim() })) };
}
export function displayed(state) {
  const colors = state.settings.presets.find(p => p.id === state.settings.activePresetId).colors;
  return resolveScheduleColors(effectiveSchedules(state.items), colors);
}
export function imported(state, args, timeZone) {
  if (!Array.isArray(args.items)) invalid("가져올 일정 목록이 필요합니다.");
  const incoming = args.items.map((item, order) => { if (!item || typeof item !== "object") invalid("가져올 일정 형식을 확인해 주세요."); return normalizeItem({ ...item, parentId: item.parentId ?? null, order: item.order ?? order }, timeZone, true); });
  validateTree(incoming);
  const existing = new Map(state.items.map(item => [item.id, item])); let skipped = 0;
  const additions = incoming.filter(item => {
    const previous = existing.get(item.id);
    if (!previous) return true;
    if (canonical(previous) !== canonical(item)) throw new WorkspaceError(409, "IMPORT_ID_CONFLICT", `기존 일정과 ID가 겹칩니다: ${item.title}. 원본을 덮어쓰지 않았습니다.`);
    skipped++; return false;
  });
  const items = [...state.items, ...additions]; validateTree(items);
  return { items, settings: args.includeSettings ? normalizeSettings(args.settings) : state.settings,
    result: { added: additions.length, skipped, total: items.length, settingsChanged: Boolean(args.includeSettings) } };
}
export function newId() { return randomUUID(); }

// Both direct web creation and AI preview use this exact construction policy.
export function buildScheduleTree(state, nodes, timeZone) {
  if (!Array.isArray(nodes) || !nodes.length || nodes.length > 500) invalid("한 번에 1~500개 일정을 생성할 수 있습니다.");
  const items = [...state.items], refs = new Map();
  const allowed = new Set(["ref", "parentRef", "parentId", "title", "start", "end", "kind", "colorMode", "color", "checklist", "allDay", "completed"]);
  for (const node of nodes) {
    if (!node || typeof node !== "object" || Array.isArray(node) || Object.keys(node).some(key => !allowed.has(key))) invalid("생성할 일정 형식을 확인해 주세요.");
    const { ref, parentRef, parentId: providedParent, ...fields } = node;
    if (typeof ref !== "string" || !ref.trim() || ref.length > 128 || refs.has(ref)) invalid("생성 참조 이름은 고유해야 합니다.");
    if (parentRef !== undefined && !refs.has(parentRef)) invalid("상위 참조를 먼저 생성해 주세요.");
    if (parentRef !== undefined && providedParent !== undefined) invalid("parentRef 또는 parentId 중 하나만 지정해 주세요.");
    const parentId = parentRef !== undefined ? refs.get(parentRef) : providedParent ?? null;
    const parent = parentId ? effectiveSchedules(items).find(item => item.id === parentId) : undefined;
    if (parentId !== null && !parent) invalid("상위 일정을 찾을 수 없습니다.");
    const id = newId();
    let item;
    try { item = normalizeItem({ ...fields, id, parentId, order: items.filter(s => s.parentId === parentId).length, start: fields.start ?? parent?.start, end: fields.end ?? parent?.end }, timeZone); }
    catch (error) { if (error instanceof WorkspaceError) error.nodeRef = ref; throw error; }
    items.push(item); refs.set(ref, id);
  }
  validateTree(items);
  return { items, additions: items.slice(state.items.length), created: Object.fromEntries(refs) };
}
