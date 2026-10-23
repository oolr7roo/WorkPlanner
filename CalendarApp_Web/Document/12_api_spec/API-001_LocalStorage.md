# API-001 레거시 localStorage 계약

BrowserEventStore는 FR-019의 명시적 가져오기 입력만 읽는다. 일정·색상의 공통 저장은 [API-004](../12_APISpecification.md)가 소유하며 앱 Hook은 localStorage에 자동 쓰지 않는다.

- 일정: workplan-calendar-events-v2가 없으면 workplan-calendar-events-v1을 읽는다. 두 원본 모두 보존한다.
- 설정: workplan-calendar-color-presets-v1을 읽는다. 없으면 기본값을 미리보기에 제공하며 손상되면 설정 가져오기를 비활성화한다.
- 형식·중복·고아 부모·순환·체크리스트·kind 오류는 원본을 유지하고 가져오기를 차단한다. kind 부재는 task, colorMode 부재는 manual이다.
- 공통 저장소 적용은 previewImport 뒤 명시적으로 import한다. ID 충돌은 전체 거부하고 동일 내용은 건너뛴다. 색상 설정 교체는 별도 선택한다.
- 접힘: workplan-calendar-collapsed-v1은 같은 브라우저의 UI 상태로 읽고 쓴다. 쓰기 실패 시 화면 상태를 유지하고 경고한다.

[데이터](../11_data_spec/DATA-001_Events.md), [현재 API](../12_APISpecification.md). 서버와 브라우저 원본 사이 자동 양방향 동기화는 하지 않는다.
