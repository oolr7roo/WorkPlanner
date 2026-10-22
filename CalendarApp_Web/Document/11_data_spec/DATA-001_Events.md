# DATA-001 일정 집합

Schedule은 CalendarEvent 필드를 보존하고 parentId: string | null과 order: number를 추가한다. id/title/start/end는 필수 문자열, 새 id는 crypto.randomUUID이다. 날짜는 현지 datetime 문자열이며 유효한 시작보다 종료가 늦어야 한다. title은 trim 후 빈 값을 거부한다. color 기본값은 #3366dd이다.

parentId=null이면 최상위, order 오름차순은 같은 부모 아래의 우선순위다. 숫자 우선순위 필드는 사용하지 않는다. 자식이 있으면 표시 기간은 가장 이른 하위 시작부터 가장 늦은 종료까지 계산한다. 원본 일정과 계산된 표시 일정은 분리한다.

v2 배열을 먼저 읽고 없으면 v1을 읽는다. 기존 항목은 parentId=null, order=기존 배열 위치로 변환한다. v1은 수정하지 않는다. v2 키는 workplan-calendar-events-v2이다. 중복 id·날짜 오류·고아 부모·순환·JSON 오류는 경고하고 자동 저장을 차단해 원본을 보존한다. 쓰기 실패 시 메모리 변경을 유지하며 경고한다. 서버 전송은 없다.

[상위 데이터](../11_DataRequirements.md), [구현](../../../src/features/schedules/types.ts), [저장 계약](../12_api_spec/API-001_LocalStorage.md).

## 색상 모드 호환

colorMode는 선택적 auto/manual이다. 부재는 manual로 해석하며 기존 color와 기존 v1 원본을 보존한다. 신규 일정은 auto, 직접 색상 입력은 manual이다. auto의 저장 color는 보조값이며 표시색은 현재 깊이·활성 프리셋으로 계산한다. 프리셋 변경은 원본 일정 배열을 다시 쓰지 않고 표시 결과만 바꾼다. DATA-002 초안에도 동일한 선택적 모드를 전달한다.
