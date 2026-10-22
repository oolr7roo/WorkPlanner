type Props = { date: string };

/** The SDK keeps cell interaction and today/month styling around this label. */
export function MonthDayNumber({ date }: Props) {
  const [year, month, day] = date.split("-").map(Number);
  return <time dateTime={date} aria-label={`${year}년 ${month}월 ${day}일`}>{day}</time>;
}
