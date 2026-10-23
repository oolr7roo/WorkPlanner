import { WorkspaceError } from "../../database/repository.mjs";
import { buildScheduleTree, displayed, invalid, newId, validateTree } from "./policy.mjs";

export function createProposalService(repository, timeZone) {
  function preview(state, nodes, selectedRefs) {
    // Validate the entire editable draft, including currently excluded entries.
    buildScheduleTree(state, nodes, timeZone);
    if (!Array.isArray(selectedRefs) || selectedRefs.some(ref => typeof ref !== "string") || new Set(selectedRefs).size !== selectedRefs.length) invalid("선택한 일정 목록을 확인해 주세요.");
    const known = new Set(nodes.map(n => n.ref)), selected = new Set(selectedRefs);
    if (selectedRefs.some(ref => !known.has(ref))) invalid("선택한 일정이 초안에 없습니다.");
    if (nodes.some(n => selected.has(n.ref) && n.parentRef !== undefined && !selected.has(n.parentRef))) invalid("하위 일정을 등록하려면 상위 계획도 선택해 주세요.");
    const subset = nodes.filter(n => selected.has(n.ref));
    if (!subset.length) return { additions: [], rows: [], created: {}, baseRevision: state.revision };
    const tree = buildScheduleTree(state, subset, timeZone);
    const display = new Map(displayed({ ...state, items: tree.items }).map(item => [item.id, item]));
    return { additions: tree.additions, created: tree.created, baseRevision: state.revision,
      rows: subset.map(node => ({ ref: node.ref, ...display.get(tree.created[node.ref]) })) };
  }
  return {
    async query(operation, args) {
      if (operation === "getProposal" && (typeof args.id !== "string" || !args.id)) invalid("초안 ID가 필요합니다.");
      const result = await repository.proposals(operation === "getProposal" ? args.id : undefined);
      const state = await repository.read();
      return { revision: state.revision, timeZone, result };
    },
    async command(command) {
      const args = command.args;
      if (!args || typeof args !== "object" || Array.isArray(args)) invalid("초안 입력을 확인해 주세요.");
      if (command.operation === "proposeTree" && args.id !== undefined) invalid("새 초안에 기존 ID를 지정할 수 없습니다.");
      if (command.operation !== "proposeTree" && (typeof args.id !== "string" || !Number.isSafeInteger(args.version))) invalid("초안 ID와 버전이 필요합니다.");
      const response = await repository.proposalCommand(command, (state, current) => {
        if (command.operation === "proposeTree") {
          const selectedRefs = Array.isArray(args.nodes) ? args.nodes.map(n => n?.ref) : [];
          const checked = preview(state, args.nodes, selectedRefs);
          return { proposal: { id: newId(), version: 1, status: "pending", original: structuredClone(args.nodes),
            draft: { nodes: structuredClone(args.nodes), selectedRefs }, preview: checked, result: null } };
        }
        if (current.status !== "pending") throw new WorkspaceError(409, "PROPOSAL_CLOSED", "이미 처리된 AI 초안입니다.");
        if (current.version !== args.version) throw new WorkspaceError(409, "PROPOSAL_CONFLICT", "다른 창에서 초안이 변경되었습니다. 편집 내용은 유지됩니다. 최신 버전으로 다시 확인해 주세요.");
        const next = { ...current, version: current.version + 1 };
        if (command.operation === "reviewProposal") {
          next.preview = preview(state, args.nodes, args.selectedRefs);
          next.draft = { nodes: structuredClone(args.nodes), selectedRefs: [...args.selectedRefs] };
        } else if (command.operation === "discardProposal") next.status = "discarded";
        else if (command.operation === "applyProposal") {
          if (current.preview.baseRevision !== state.revision) throw new WorkspaceError(409, "PREVIEW_STALE", "일정이 변경되었습니다. 미리보기를 다시 확인해 주세요.");
          if (!current.preview.additions.length) invalid("등록할 일정을 선택해 주세요.");
          const items = [...state.items, ...current.preview.additions]; validateTree(items);
          next.status = "applied"; next.result = { created: current.preview.created, count: current.preview.additions.length };
          return { proposal: next, workspace: { items, settings: state.settings, result: next.result } };
        } else invalid("지원하지 않는 초안 변경입니다.");
        return { proposal: next };
      });
      return { ...response, timeZone };
    }
  };
}
