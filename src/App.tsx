import { useState } from "react";
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
import type { AppView, ScheduleDraft } from "./features/schedules/types";
import "./features/schedules/schedules.css";
import "./features/schedules/gantt.css";

type EditorState = { id: string | null; parentId: string | null; draft: ScheduleDraft };
export default function App() {
  const colorSettings = useScheduleColorSettings();
  const schedules = useSchedules(colorSettings.colors);
  const tree = useScheduleTree(schedules.effective);
  const [view, setView] = useState<AppView>("month");
  const [date, setDate] = useState(() => localInputDate(new Date()).slice(0, 10));
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  function openNew(start?: string, end?: string, parentId: string | null = null) {
    if (schedules.blocked) return;
    const parent = schedules.effective.find(item => item.id === parentId);
    if (parentId) tree.expand(parentId);
    setEditor({ id: null, parentId, draft: { ...defaultDraft(start ?? parent?.start, end), colorMode: "auto", color: schedules.automaticColor(parentId) } });
  }
  function openEdit(id: string) {
    if (schedules.blocked) return;
    const item = schedules.effective.find(item => item.id === id);
    if (item) setEditor({ id, parentId: item.parentId, draft: { title: item.title, start: item.start.slice(0, 16), end: item.end.slice(0, 16), color: item.color ?? "#3366dd", colorMode: item.colorMode ?? "manual" } });
  }
  const treeProps = { items: schedules.effective, rows: tree.rows, collapsed: tree.collapsed, selected: tree.selected,
    onToggle: tree.toggle, onEdit: openEdit, onAddChild: (id: string) => openNew(undefined, undefined, id), disabled: schedules.blocked };
  const title = view === "priority" ? "일정 우선순위" : view === "gantt" ? "일정 간트차트" : "내 일정 달력";
  return <div className="app-shell">
    <header className="app-header"><div><p className="eyebrow">WORKPLAN</p><div className="page-title-row">
      <a className="home-link" href="https://home-macmini.tail7073a2.ts.net/" aria-label="홈으로 이동">←</a><h1>{title}</h1>
    </div></div><div className="header-actions"><button className="new-event" type="button" disabled={schedules.blocked} onClick={() => openNew()}>+ 일정 추가</button>
      <button className="settings-button" type="button" onClick={() => setSettingsOpen(true)}>설정</button></div></header>
    <main className={`calendar-panel ${view === "priority" || view === "gantt" ? "custom-panel" : ""}`}>
      {view === "priority" || view === "gantt" ? <>
        <CalendarToolbar view={view} label={view === "priority" ? "전체 일정" : `${date.replaceAll("-", ".")} – ${addDays(date, 13).replaceAll("-", ".")}`}
          onViewChange={setView} onToday={() => setDate(localInputDate(new Date()).slice(0, 10))} onPrev={() => setDate(addDays(date, -14))} onNext={() => setDate(addDays(date, 14))} />
        {view === "priority" ? <PriorityTreeView {...treeProps} onMove={schedules.reorder} /> : <GanttView {...treeProps} date={date} />}
      </> : <CalendarView events={schedules.effective} view={view} date={date} onDateChange={setDate} onViewChange={setView} onEdit={openEdit}
        onNew={(start, end) => openNew(start, end)} onMove={schedules.moveTime} disabled={schedules.blocked}
        toolbar={props => <CalendarToolbar {...props} view={view} label={props.formattedDate} onViewChange={setView} />} />}
    </main>
    <p className="storage-note">일정은 이 브라우저에 저장됩니다.</p>
    {schedules.storageError && <p className="storage-error" role="alert">{schedules.storageError}</p>}
    {colorSettings.error && <p className="storage-error" role="alert">{colorSettings.error}</p>}
    {tree.error && <p className="storage-error" role="alert">{tree.error}</p>}
    {editor && <ScheduleEditor initial={editor.draft} editing={Boolean(editor.id)} parentTitle={schedules.items.find(item => item.id === editor.parentId)?.title}
      hasChildren={schedules.items.some(item => item.parentId === editor.id && editor.id !== null)} automaticColor={schedules.automaticColor(editor.parentId)}
      onSave={draft => schedules.save(draft, editor.id, editor.parentId)} onDelete={() => { if (editor.id) schedules.remove(editor.id); }} onClose={() => setEditor(null)} />}
    {settingsOpen && <ScheduleColorSettings initial={colorSettings.settings} initialError={colorSettings.error} onSave={colorSettings.save} onClose={() => setSettingsOpen(false)} />}
  </div>;
}
