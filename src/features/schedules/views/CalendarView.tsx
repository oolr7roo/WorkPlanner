import { Calendar } from "trud-calendar";
import type { CalendarEvent, ToolbarSlotProps } from "trud-calendar-core";
import type { AppView, Schedule } from "../types";

type Props = { events: Schedule[]; date: string; view: "month" | "week" | "day"; onDateChange: (date: string) => void; onViewChange: (view: AppView) => void; onEdit: (id: string) => void; onNew: (start: string, end?: string) => void; onMove: (id: string, start: string, end: string) => void; toolbar: (props: ToolbarSlotProps) => React.ReactNode; disabled: boolean };
export function CalendarView(props: Props) {
  const move = (event: CalendarEvent, start: string, end: string) => props.onMove(event.id, start, end);
  return <Calendar events={props.events} date={props.date} view={props.view} dayStartHour={0} dayEndHour={24} enableDnD={!props.disabled}
    onDateChange={props.onDateChange} onViewChange={view => { if (view === "month" || view === "week" || view === "day") props.onViewChange(view); }}
    locale={{ locale: "ko-KR", weekStartsOn: 0, labels: { today: "오늘", month: "월", week: "주", day: "일", agenda: "목록", year: "년", timeline: "시간표", allDay: "종일", noEvents: "일정이 없습니다", more: count => `+${count}개 더 보기` } }}
    slots={{ toolbar: props.toolbar }} onEventClick={event => props.onEdit(event.id)} onSlotClick={start => props.onNew(start)} onSlotSelect={props.onNew} onEventDrop={move} onEventResize={move} />;
}
