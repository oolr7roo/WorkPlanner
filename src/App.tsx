import { useState } from "react";
import { useScheduleWorkspace } from "./features/schedules/useScheduleWorkspace";
import { ScheduleImportDialog } from "./features/schedules/components/ScheduleImportDialog";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { useSchedules } from "./features/schedules/useSchedules";
import { useScheduleTree } from "./features/schedules/useScheduleTree";
import { addDays, defaultDraft, localInputDate } from "./features/schedules/scheduleDates";
import { ScheduleEditor } from "./features/schedules/components/ScheduleEditor";
import { ScheduleColorSettings } from "./features/schedules/components/ScheduleColorSettings";
import { useScheduleColorSettings } from "./features/schedules/useScheduleColorSettings";
import { PriorityTreeView } from "./features/schedules/views/PriorityTreeView";
import { GanttView } from "./features/schedules/views/GanttView";
import { CalendarView } from "./features/schedules/views/CalendarView";
import { scheduleKind, taskRows, taskSchedules } from "./features/schedules/scheduleKinds";
import type { AppView, ScheduleDraft } from "./features/schedules/types";
import "./features/schedules/schedules.css";
import "./features/schedules/gantt.css";

type EditorState = { revision: number; id: string | null; parentId: string | null; draft: ScheduleDraft };
export default function App() {
  const workspace = useScheduleWorkspace();
  const colorSettings = useScheduleColorSettings(workspace);
  const schedules = useSchedules(workspace, colorSettings.colors);
  const tree = useScheduleTree(schedules.effective);
  const [view, setView] = useState<AppView>("month");
  const [date, setDate] = useState(() => localInputDate(new Date()).slice(0, 10));
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [settingsRevision, setSettingsRevision] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  function openNew(start?: string, end?: string, parentId: string | null = null) {
    if (schedules.blocked) return;
    const parent = schedules.effective.find(item => item.id === parentId);
    if (parentId) tree.expand(parentId);
    setEditor({ revision: workspace.revision, id: null, parentId, draft: { ...defaultDraft(start ?? parent?.start, end), kind: "plan", colorMode: "auto", color: schedules.automaticColor(parentId), checklist: [] } });
  }
  function openEdit(id: string) {
    if (schedules.blocked) return;
    const item = schedules.effective.find(item => item.id === id);
    if (item) setEditor({ revision: workspace.revision, id, parentId: item.parentId, draft: { title: item.title, start: item.start.slice(0, 16), end: item.end.slice(0, 16), kind: scheduleKind(item), color: item.color ?? "#3366dd", colorMode: item.colorMode ?? "manual", checklist: item.checklist } });
  }
  const treeProps = { items: schedules.effective, rows: tree.rows, collapsed: tree.collapsed, selected: tree.selected,
    onToggle: tree.toggle, onEdit: openEdit, onAddChild: (id: string) => openNew(undefined, undefined, id), disabled: schedules.blocked };
  const title = view === "priority" ? "일정 우선순위" : view === "gantt" ? "일정 간트차트" : "내 일정 달력";
  return <div className="app-shell">
    <header className="app-header"><div><p className="eyebrow">WORKPLAN</p><div className="page-title-row">
      <a className="home-link" href="https://home-macmini.tail7073a2.ts.net/" aria-label="홈으로 이동">←</a><h1>{title}</h1>
    </div></div><div className="header-actions"><button className="new-event" type="button" disabled={schedules.blocked} onClick={() => openNew()}>+ 일정 추가</button>
      <button className="settings-button" type="button" disabled={schedules.blocked} onClick={() => setSettingsRevision(workspace.revision)}>설정</button><button type="button" className="settings-button" disabled={schedules.blocked} onClick={() => setImportOpen(true)}>기존 일정 가져오기</button></div></header>
    <main className={`calendar-panel ${view === "priority" || view === "gantt" ? "custom-panel" : ""}`}>
      {view === "priority" || view === "gantt" ? <>
        <CalendarToolbar view={view} label={view === "priority" ? "전체 일정" : `${date.replaceAll("-", ".")} – ${addDays(date, 13).replaceAll("-", ".")}`}
          onViewChange={setView} onToday={() => setDate(localInputDate(new Date()).slice(0, 10))} onPrev={() => setDate(addDays(date, -14))} onNext={() => setDate(addDays(date, 14))} />
        {view === "priority" ? <PriorityTreeView {...treeProps} onMove={schedules.reorder} /> : <GanttView {...treeProps} items={taskSchedules(schedules.effective)} rows={taskRows(schedules.effective, tree.collapsed)} date={date} />}
      </> : <CalendarView events={taskSchedules(schedules.effective)} view={view} date={date} onDateChange={setDate} onViewChange={setView} onEdit={openEdit}
        onNew={(start, end) => openNew(start, end)} onMove={schedules.moveTime} disabled={schedules.blocked}
        toolbar={props => <CalendarToolbar {...props} view={view} label={props.formattedDate} onViewChange={setView} />} />}
    </main>
    <p className="storage-note">일정과 색상 설정은 공통 저장소에 저장됩니다. {workspace.revision < 0 ? "연결 중…" : workspace.timeZone}</p>
    {workspace.error && <p className="storage-error" role="alert">{workspace.error} <button type="button" onClick={() => void workspace.refresh()}>다시 연결</button></p>}
    {tree.error && <p className="storage-error" role="alert">{tree.error}</p>}
    {editor && <ScheduleEditor initial={editor.draft} editing={Boolean(editor.id)} parentTitle={schedules.items.find(item => item.id === editor.parentId)?.title}
      hasChildren={schedules.items.some(item => item.parentId === editor.id && editor.id !== null)} automaticColor={schedules.automaticColor(editor.parentId)}
      onSave={draft => schedules.save(draft, editor.id, editor.parentId, editor.revision)} onDelete={() => editor.id ? schedules.remove(editor.id, editor.revision) : Promise.resolve("")} onClose={() => setEditor(null)} />}
    {settingsRevision !== null && <ScheduleColorSettings initial={colorSettings.settings} initialError={colorSettings.error} onSave={next => colorSettings.save(next, settingsRevision)} onClose={() => setSettingsRevision(null)} />}
    {importOpen && <ScheduleImportDialog workspace={workspace} onClose={() => setImportOpen(false)} />}
  </div>;
}
