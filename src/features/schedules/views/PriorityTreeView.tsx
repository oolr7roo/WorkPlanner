import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import type { Schedule, TreeRow } from "../types";
import { siblings } from "../scheduleTree";
import { formatPeriod } from "../scheduleDates";
import { ScheduleDragHandle, DRAG_TYPE } from "../components/ScheduleDragHandle";
import { ScheduleTreeLabel } from "../components/ScheduleTreeLabel";

export type TreeViewProps = { items: Schedule[]; rows: TreeRow[]; collapsed: Set<string>; selected: string | null; onToggle: (id: string) => void; onEdit: (id: string) => void; onAddChild: (id: string) => void; disabled: boolean };
const COPY_KEY = "CalendarApp_Web/Document/09_WireframeMockup/SCR-005.json#priority-row-event-1";
const TOUCH_EXCLUDED = ".drag-control, .row-actions";
const HOLD_MS = 600;
const CANCEL_DISTANCE = 10;

type RowMenu = { schedule: Schedule; row: HTMLDivElement; x: number; y: number; revision: number };
type Press = { pointerId: number; x: number; y: number; timer: number };

export function PriorityTreeView(props: TreeViewProps & { onMove: (id: string, target: string) => void; onDelete: (id: string, revision: number) => Promise<string>; revision: number; loading: boolean; loadError: string; onRetry: () => Promise<void> }) {
  const [notice, setNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [menu, setMenu] = useState<RowMenu | null>(null);
  const [deletion, setDeletion] = useState<RowMenu | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const menuElement = useRef<HTMLDivElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const press = useRef<Press | null>(null);
  const suppressClick = useRef(false);
  const lastPointerType = useRef("");
  const selectedAncestors = props.rows.find(row => row.schedule.id === props.selected)?.ancestry ?? [];

  function cancelPress() {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  }

  useEffect(() => cancelPress, []);

  function startPress(event: PointerEvent<HTMLDivElement>, schedule: Schedule) {
    if (event.pointerType !== "touch" || !event.isPrimary || props.disabled ||
        (event.target as Element).closest(TOUCH_EXCLUDED)) return;
    cancelPress();
    const { pointerId, clientX: x, clientY: y, currentTarget: row } = event;
    press.current = {
      pointerId, x, y,
      timer: window.setTimeout(() => {
        press.current = null;
        suppressClick.current = true;
        setCopyNotice("");
        setMenu({ schedule, row, x, y, revision: props.revision });
      }, HOLD_MS),
    };
  }

  useLayoutEffect(() => {
    const element = menuElement.current;
    if (!menu || !element) return;
    const margin = 8;
    const viewport = element.ownerDocument.documentElement;
    element.style.left = `${Math.max(margin, Math.min(menu.x, viewport.clientWidth - element.offsetWidth - margin))}px`;
    element.style.top = `${Math.max(margin, Math.min(menu.y, viewport.clientHeight - element.offsetHeight - margin))}px`;
    element.querySelector("button")?.focus();
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    function dismiss(event: globalThis.PointerEvent) {
      if (!menuElement.current?.contains(event.target as Node)) setMenu(null);
    }
    function dismissOnResize() { setMenu(null); }
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", dismissOnResize);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", dismissOnResize);
    };
  }, [menu]);

  useLayoutEffect(() => {
    const element = deleteDialog.current;
    if (!deletion || !element) return;
    element.showModal();
    return () => element.close();
  }, [deletion]);

  function closeMenu(restoreFocus: boolean) {
    if (restoreFocus) menu?.row.focus({ preventScroll: true });
    setMenu(null);
  }

  async function confirmDeletion() {
    if (!deletion || deletePending || props.disabled) return;
    setDeletePending(true);
    setDeleteError("");
    try {
      const error = await props.onDelete(deletion.schedule.id, deletion.revision);
      if (error) setDeleteError(error);
      else setDeletion(null);
    } catch {
      setDeleteError("일정을 삭제하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setDeletePending(false);
    }
  }

  async function copyKey() {
    closeMenu(true);
    try {
      await navigator.clipboard.writeText(COPY_KEY);
      setCopyNotice("일정 키를 복사했습니다.");
    } catch {
      setCopyNotice("일정 키를 복사하지 못했습니다.");
    }
  }

  return <section className="priority-view" aria-label="일정 우선순위 목록"
    onPointerDownCapture={event => { lastPointerType.current = event.pointerType; suppressClick.current = false; cancelPress(); }}
    onScroll={() => { cancelPress(); setMenu(null); }}
    onClickCapture={event => {
      if (!suppressClick.current || event.detail === 0) return;
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    }}>
    <div className="view-guide"><strong>위에 있을수록 높은 우선순위</strong><p id="reorder-help">같은 부모 아래에서 ⋮⋮를 끌어 이동하세요. 키보드: Space → 방향키 → Enter, Esc 취소.</p></div>
    <p className="sr-only" role="status">{notice}</p>
    {copyNotice && <p className="priority-copy-notice" role="status">{copyNotice}</p>}
    {props.loading ? (props.loadError
      ? <p className="empty-state" role="alert">{props.loadError} <button type="button" onClick={() => void props.onRetry()}>다시 연결</button></p>
      : <p className="empty-state" role="status">공통 저장소에서 일정을 불러오는 중입니다.</p>
    ) : !props.rows.length ? <p className="empty-state">등록된 일정이 없습니다. 일정 추가로 첫 일정을 만들어 보세요.</p> :
      <div className="schedule-table"><div className="priority-table-head"><span>이동</span><span>일정 · 하위 일정</span><span>기간</span></div>
        {props.rows.map(row => <div key={row.schedule.id} className={`priority-row ${props.selected === row.schedule.id || row.ancestry.includes(props.selected ?? "") || selectedAncestors.includes(row.schedule.id) ? "branch-highlight" : ""}`}
          tabIndex={props.disabled ? undefined : 0} aria-label={row.schedule.title} aria-haspopup={props.disabled ? undefined : "menu"}
          onContextMenu={event => {
            if (props.disabled) return;
            const touchMenu = lastPointerType.current === "touch" || (event.nativeEvent as globalThis.PointerEvent).pointerType === "touch";
            if (touchMenu && (event.target as Element).closest(TOUCH_EXCLUDED)) return;
            event.preventDefault();
            if (touchMenu || press.current || suppressClick.current) return;
            setCopyNotice("");
            setMenu({ schedule: row.schedule, row: event.currentTarget, x: event.clientX, y: event.clientY, revision: props.revision });
          }}
          onKeyDown={event => {
            if (props.disabled || !(event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey))) return;
            event.preventDefault();
            const { left, bottom } = event.currentTarget.getBoundingClientRect();
            setCopyNotice("");
            setMenu({ schedule: row.schedule, row: event.currentTarget, x: left, y: bottom, revision: props.revision });
          }}
          onPointerDown={event => startPress(event, row.schedule)}
          onPointerMove={event => {
            const active = press.current;
            if (active?.pointerId === event.pointerId &&
                Math.hypot(event.clientX - active.x, event.clientY - active.y) >= CANCEL_DISTANCE) cancelPress();
          }}
          onPointerUp={cancelPress} onPointerCancel={cancelPress} onDragStart={cancelPress}
          onDragOver={event => { if (!props.disabled && event.dataTransfer.types.includes(DRAG_TYPE)) event.preventDefault(); }}
          onDrop={event => {
            event.preventDefault(); if (props.disabled) return;
            const id = event.dataTransfer.getData(DRAG_TYPE), source = props.items.find(item => item.id === id);
            if (!source || source.parentId !== row.schedule.parentId) { setNotice("같은 부모 아래의 일정끼리 이동할 수 있습니다."); return; }
            props.onMove(id, row.schedule.id); setNotice("일정 순서를 변경했습니다.");
          }}>
          <ScheduleDragHandle schedule={row.schedule} siblings={siblings(props.items, row.schedule.parentId)} onMove={props.onMove} disabled={props.disabled} />
          <ScheduleTreeLabel {...props} row={row} collapsed={props.collapsed.has(row.schedule.id)} selected={props.selected === row.schedule.id} />
          <span className="schedule-period">{formatPeriod(row.schedule)}</span>
        </div>)}
      </div>}
    {menu && <div ref={menuElement} className="priority-context-menu" role="menu" aria-label={`${menu.schedule.title} 메뉴`}
      onBlur={event => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        if (suppressClick.current) {
          requestAnimationFrame(() => menuElement.current?.querySelector("button")?.focus());
        } else {
          setMenu(null);
        }
      }}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu(true);
        } else if (event.key === "Enter" && event.target instanceof HTMLButtonElement) {
          event.preventDefault();
          event.target.click();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
          const index = buttons.findIndex(button => button === document.activeElement);
          const step = event.key === "ArrowDown" ? 1 : -1;
          buttons[(index + step + buttons.length) % buttons.length]?.focus();
        }
      }}>
      <button type="button" role="menuitem" tabIndex={-1} onClick={copyKey}>키 복사</button>
      <button type="button" role="menuitem" tabIndex={-1} disabled={props.disabled} onClick={() => {
        setDeleteError("");
        setDeletion(menu);
        closeMenu(true);
      }}>삭제</button>
    </div>}
    {deletion && <dialog ref={deleteDialog} className="editor priority-delete-dialog" aria-labelledby="priority-delete-title"
      onCancel={event => { event.preventDefault(); if (!deletePending) setDeletion(null); }}>
      <h2 id="priority-delete-title">일정 삭제</h2>
      <p>‘{deletion.schedule.title}’ 일정을 삭제할까요? 하위 일정은 한 단계 위로 이동합니다.</p>
      {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
      <div className="editor-actions">
        <button type="button" className="cancel-button" autoFocus disabled={deletePending} onClick={() => setDeletion(null)}>취소</button>
        <button type="button" className="delete-button" disabled={props.disabled || deletePending} onClick={() => void confirmDeletion()}>
          {deletePending ? "삭제 중…" : "삭제"}
        </button>
      </div>
    </dialog>}
  </section>;
}
