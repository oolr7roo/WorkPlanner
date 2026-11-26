import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "trud-calendar";
import { eachDayOfRange, getMonthViewRange, getWeekViewRange } from "trud-calendar-core";
import type { CalendarEvent, ToolbarSlotProps } from "trud-calendar-core";
import type { AppView, Schedule } from "../types";
import { buildCalendarScheduleItems, type CalendarScheduleItem, type ScheduleCalendarView } from "../calendarScheduleItems";
import { formatPeriod } from "../scheduleDates";

const weekStartsOn = 0;
const weekdayName = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });
const fullDayName = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" });

function WeekDatePicker({ date, onDateChange }: { date: string; onDateChange: (date: string) => void }) {
  const { start, end } = getWeekViewRange(date, weekStartsOn);
  return <div className="calendar-week-dates" role="group" aria-label="이번 주 날짜">
    {eachDayOfRange(start, end).map(day => {
      const localDate = new Date(`${day}T12:00:00`);
      return <button type="button" key={day} aria-label={fullDayName.format(localDate)}
        aria-pressed={day === date} onClick={() => onDateChange(day)}>
        <span>{weekdayName.format(localDate)}</span>
        <strong>{localDate.getDate()}</strong>
      </button>;
    })}
  </div>;
}

function CalendarEventDetails({ item, editable, onEdit, onClose }: {
  item: CalendarScheduleItem;
  editable: boolean;
  onEdit: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="editor calendar-event-details" aria-labelledby="calendar-event-title"
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="editor-header">
      <h2 id="calendar-event-title">{item.schedule.title}</h2>
      <button type="button" className="close-button" onClick={onClose} aria-label="상세 닫기">×</button>
    </div>
    <p className="calendar-event-period">{item.summaryDay ?? formatPeriod(item.schedule)}</p>
    <div className="editor-actions">
      <button type="button" className="cancel-button" onClick={onClose}>닫기</button>
      {editable && <button type="button" className="save-button" onClick={() => {
        ref.current?.close();
        onEdit();
      }}>일정 편집</button>}
    </div>
  </dialog>;
}

type Props = {
  schedules: Schedule[];
  hierarchy: boolean;
  date: string;
  view: ScheduleCalendarView;
  onDateChange: (date: string) => void;
  onViewChange: (view: AppView) => void;
  onEdit: (id: string) => void;
  onNew: (start: string, end?: string) => void;
  onMove: (id: string, start: string, end: string) => void;
  toolbar: (props: ToolbarSlotProps) => React.ReactNode;
  disabled: boolean;
};

export function CalendarView(props: Props) {
  const [selected, setSelected] = useState<CalendarScheduleItem | null>(null);
  const items = useMemo<CalendarScheduleItem[]>(() => {
    if (!props.hierarchy) return props.schedules.map(schedule => ({ event: schedule, schedule }));
    const range = props.view === "month" ? getMonthViewRange(props.date, weekStartsOn)
      : props.view === "week" ? getWeekViewRange(props.date, weekStartsOn)
      : { start: props.date, end: props.date };
    return buildCalendarScheduleItems(props.schedules, props.view, range);
  }, [props.date, props.hierarchy, props.schedules, props.view]);
  const byId = useMemo(() => new Map(items.map(item => [item.event.id, item])), [items]);
  const movable = (event: CalendarEvent) => {
    const item = byId.get(event.id);
    return Boolean(item && !item.summaryDay);
  };
  const move = (event: CalendarEvent, start: string, end: string) => {
    if (movable(event)) props.onMove(event.id, start, end);
  };
  return <div className="workplan-calendar">
    <Calendar events={items.map(item => item.event)} date={props.date} view={props.view} dayStartHour={0} dayEndHour={24} enableDnD={!props.disabled}
      dragConstraint={movable} resizeConstraint={movable}
      onDateChange={props.onDateChange} onViewChange={view => { if (view === "month" || view === "week" || view === "day") props.onViewChange(view); }}
      locale={{ locale: "ko-KR", weekStartsOn, labels: { today: "오늘", month: "월", week: "주", day: "일", agenda: "목록", year: "년", timeline: "시간표", allDay: "종일", noEvents: "일정이 없습니다", more: count => `+${count}개 더 보기` } }}
      slots={{ toolbar: toolbarProps => <>
        {props.toolbar(toolbarProps)}
        {props.view === "week" && <WeekDatePicker date={toolbarProps.currentDate} onDateChange={props.onDateChange} />}
      </> }} onEventClick={event => {
        if (props.hierarchy) setSelected(byId.get(event.id) ?? null);
        else props.onEdit(event.id);
      }}
      onSlotClick={start => props.onNew(start)} onSlotSelect={props.onNew} onEventDrop={move} onEventResize={move} />
    {selected && <CalendarEventDetails item={selected} editable={!props.disabled}
      onClose={() => setSelected(null)}
      onEdit={() => { setSelected(null); props.onEdit(selected.schedule.id); }} />}
  </div>;
}
