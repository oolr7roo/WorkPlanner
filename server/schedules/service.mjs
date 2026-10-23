import { removeSchedule, siblings } from "../../src/features/schedules/scheduleTree.ts";
import { WorkspaceError } from "../../database/repository.mjs";
import { buildScheduleTree, displayed, effectiveSchedules, imported, invalid, normalizeItem, normalizeSettings, validateTree, wallDate } from "./policy.mjs";
import { createProposalService } from "./proposals.mjs";

export function createScheduleService(repository, timeZone = "Asia/Seoul") {
  const proposals = createProposalService(repository, timeZone);
  const present = state => ({ ...state, timeZone });
  const get = (items, id) => { const item = items.find(s => s.id === id); if (!item) throw new WorkspaceError(404, "NOT_FOUND", "일정을 찾을 수 없습니다."); return item; };
  const context = () => ({ timeZone, now: new Date().toISOString(), defaultKind: "plan", legacyKind: "task", views: "priority: all; gantt/month/week/day: task", deletePolicy: "preserve children by promotion", dateFormat: "YYYY-MM-DDTHH:mm:ss in timeZone, or ISO with explicit offset", writes: "Read revision before changing. Reuse requestId AND identical body when retrying. Conflict requires fresh read and a new requestId.", creationPolicy: "AI: propose_schedule_tree submits a pending draft; user reviews and registers in the web app. get_schedule_proposal checks status. Submitting is not registration." });
  return {
    async read() { return present(await repository.read()); },
    async query(operation, args = {}) {
      if (["listProposals", "getProposal"].includes(operation)) return proposals.query(operation, args);
      const state = await repository.read(), items = displayed(state);
      let result;
      if (operation === "context") result = { ...context(), activeColorSettings: state.settings, count: state.items.length };
      else if (operation === "get") {
        const item = get(items, args.id), ancestry = []; let parent = item.parentId;
        while (parent) { const p = get(items, parent); ancestry.unshift({ id: p.id, title: p.title }); parent = p.parentId; }
        result = { schedule: item, stored: get(state.items, args.id), ancestry, children: siblings(items, args.id) };
      } else if (operation === "list") {
        if (args.kind !== undefined && !["plan", "task", "all"].includes(args.kind)) invalid("조회 구분을 확인해 주세요.");
        const start = args.start ? wallDate(args.start, timeZone) : null, end = args.end ? wallDate(args.end, timeZone) : null;
        const filtered = items.filter(item => (!args.kind || args.kind === "all" || item.kind === args.kind)
          && (args.parentId === undefined || item.parentId === args.parentId)
          && (!args.query || item.title.toLocaleLowerCase().includes(String(args.query).toLocaleLowerCase()))
          && (!start || item.end > start) && (!end || item.start < end));
        const offset = args.offset ?? 0, limit = args.limit ?? 100;
        if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 500) invalid("조회 offset/limit을 확인해 주세요.");
        result = { items: filtered.slice(offset, offset + limit), total: filtered.length, offset, limit };
      } else if (operation === "previewImport") result = imported(state, args, timeZone).result;
      else invalid("지원하지 않는 조회입니다.");
      return { revision: state.revision, timeZone, result };
    },
    async command(command) {
      if (["proposeTree", "reviewProposal", "applyProposal", "discardProposal"].includes(command.operation)) return proposals.command(command);
      const response = await repository.mutate(command, state => {
        const args = command.args ?? {}; let result = {};
        if (command.operation === "createTree") {
          const tree = buildScheduleTree(state, args.nodes, timeZone);
          state.items = tree.items; result = { created: tree.created };
        } else if (command.operation === "update") {
          const item = get(state.items, args.id), patch = args.patch;
          if (!patch || typeof patch !== "object" || Array.isArray(patch) || Object.keys(patch).some(k => !["title", "start", "end", "kind", "color", "colorMode", "checklist", "allDay"].includes(k))) invalid("수정할 필드를 확인해 주세요. 계층·순서는 move를 사용하세요.");
          const changes = { ...patch };
          if (state.items.some(s => s.parentId === item.id)) {
            const effective = get(effectiveSchedules(state.items), item.id);
            for (const key of ["start", "end"]) {
              if (changes[key] !== undefined && wallDate(changes[key], timeZone) !== effective[key]) invalid("상위 일정의 기간은 하위 일정에서 계산합니다.");
              delete changes[key];
            }
          }
          const updated = normalizeItem({ ...item, ...changes }, timeZone);
          state.items = state.items.map(s => s.id === item.id ? updated : s); result = { id: item.id };
        } else if (command.operation === "move") {
          const item = get(state.items, args.id);
          if (args.parentId !== null) get(state.items, args.parentId);
          if (args.id === args.parentId) invalid("자기 자신을 상위로 지정할 수 없습니다.");
          const targetGroup = siblings(state.items, args.parentId).filter(s => s.id !== item.id);
          const index = args.beforeId == null ? targetGroup.length : targetGroup.findIndex(s => s.id === args.beforeId);
          if (index < 0) invalid("같은 상위 아래의 이동 위치가 필요합니다.");
          targetGroup.splice(index, 0, item);
          const orders = new Map(targetGroup.map((s, i) => [s.id, i]));
          state.items = state.items.map(s => orders.has(s.id) ? { ...s, parentId: args.parentId, order: orders.get(s.id) } : s);
          result = { id: item.id, parentId: args.parentId };
        } else if (command.operation === "delete") {
          get(state.items, args.id); state.items = removeSchedule(state.items, args.id); result = { deletedId: args.id, childrenPreserved: true };
        } else if (command.operation === "settings") {
          state.settings = normalizeSettings(args.settings); result = { settingsSaved: true };
        } else if (command.operation === "import") return imported(state, args, timeZone);
        else invalid("지원하지 않는 변경입니다.");
        validateTree(state.items);
        return { items: state.items, settings: state.settings, result };
      });
      return present(response);
    }
  };
}
