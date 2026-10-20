# API-003 Calendar SDK 계약

## 1. 기본 정보

SDK 제공자는 trud-calendar / trud-calendar-core이며 App UI가 FR-001·FR-002·FR-003·FR-005를 위해 소비한다. UI 위치는 SCR-001~003의 calendar와 COMMON-002의 toolbar다. 실제 앱의 기본 진입은 월 보기이며 세 문서는 같은 SDK 보기 상태를 표현한다.

## 2. 엔드포인트 / 채널 / 메서드

Calendar props와 CalendarToolbar slot의 콜백 계약이다. HTTP API가 아니다. [구현](../../../src/App.tsx)과 [패키지 타입](../../../node_modules/trud-calendar-core/dist/index.d.ts)을 참조한다.

## 3. 요청

events, defaultView=month, dayStartHour=0, dayEndHour=24, enableDnD=true, locale=ko-KR, weekStartsOn=0. toolbar는 formattedDate·view·onPrev·onNext·onToday·onViewChange를 소비한다. UI에 노출되는 보기 버튼은 month·week·day뿐이다.

## 4. 응답

onEventClick(event)은 편집 진입, onSlotClick(start)은 새 일정 진입, onSlotSelect(start,end)는 기간 초기값 제공, onEventDrop(event,start,end)·onEventResize(event,start,end)는 시간 변경을 전달한다. App은 같은 ID 항목을 갱신한다.

## 5. 에러

SDK 콜백 오류를 감싸는 별도 error boundary는 없다. moveEvent는 받은 시간의 유효성·순서를 다시 검사하지 않는다. 라이브러리 내부 정합성까지 App의 보장으로 확대하지 않는다.

## 6. 관련 데이터

DATA-001은 입력 일정 집합, DATA-002는 편집 초기값으로 변환된다. [데이터 정본](../11_DataRequirements.md).

## 7. 확인 필요 사항

드래그·리사이즈·기간 선택의 실제 이벤트 전 범위, 라이브러리 지원 보기별 UI와 접근성은 QA에서 검증해야 한다. [상위 API](../12_APISpecification.md).
