import { Calendar } from "trud-calendar";
import { eachDayOfRange, getWeekViewRange } from "trud-calendar-core";
import type { CalendarEvent, ToolbarSlotProps } from "trud-calendar-core";
import type { AppView, Schedule } from "../types";

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

type Props = { events: Schedule[]; date: string; view: "month" | "week" | "day"; onDateChange: (date: string) => void; onViewChange: (view: AppView) => void; onEdit: (id: string) => void; onNew: (start: string, end?: string) => void; onMove: (id: string, start: string, end: string) => void; toolbar: (props: ToolbarSlotProps) => React.ReactNode; disabled: boolean };
export function CalendarView(props: Props) {
  const move = (event: CalendarEvent, start: string, end: string) => props.onMove(event.id, start, end);
  return <Calendar events={props.events} date={props.date} view={props.view} dayStartHour={0} dayEndHour={24} enableDnD={!props.disabled}
    onDateChange={props.onDateChange} onViewChange={view => { if (view === "month" || view === "week" || view === "day") props.onViewChange(view); }}
    locale={{ locale: "ko-KR", weekStartsOn, labels: { today: "오늘", month: "월", week: "주", day: "일", agenda: "목록", year: "년", timeline: "시간표", allDay: "종일", noEvents: "일정이 없습니다", more: count => `+${count}개 더 보기` } }}
    slots={{ toolbar: toolbarProps => <>
      {props.toolbar(toolbarProps)}
      {props.view === "week" && <WeekDatePicker date={toolbarProps.currentDate} onDateChange={props.onDateChange} />}
    </> }} onEventClick={event => props.onEdit(event.id)} onSlotClick={start => props.onNew(start)} onSlotSelect={props.onNew} onEventDrop={move} onEventResize={move} />;
}
