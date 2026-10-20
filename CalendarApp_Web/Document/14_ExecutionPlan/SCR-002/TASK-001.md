# TASK-001 주 보기 본문·상태·전환 기준선

## 1. 작업 목적과 전체 처리 흐름

소유 흐름: [SCR-002](../SCR-002.md). 소유 대상은 SCR-002의 본문·공통 배치·override이며 COMMON 정의나 결합 도구를 수정하지 않는다. 실행 모드 SEQUENTIAL, 병렬 그룹 NONE.

source·Runtime 확인 → 주 보기 DOM 대응 → JSON 상태·배치 작성 → 공통 결합 → 참조·좌표·전환 검증 → Review 판정.

## 2. 단계별 실제 작업

1. [App](../../../../src/App.tsx), [SDK](../../../../node_modules/trud-calendar/dist/index.js), [SRS](../../../../Document/8_SoftwareRequirementsSpecification.md), [모듈](../../10_ModuleMapping.md), [Runtime](../../../../Document/Evidence/ViewSplit/runtime.json)을 확인한다.
2. [SCR-002](../../09_WireframeMockup/SCR-002.json)의 calendar, week-scroll-001, week-time-grid-001과 반복 셀·일정 control을 실측 DOM index로 대응한다. 캡처 날짜·이벤트는 표본이며 일정 정본이 아니다.
3. COMMON 참조의 mount와 날짜 문구·선택 states·style·내부 배치 override를 작성한다. 공통 component를 복사하지 않는다.
4. 소유 [공통 Task](../SCR-001/TASK-001.md)의 결합 도구로 파생 표준 v3를 생성하고 schema·ID·부모·source·bindings를 검증한다.

## 3. 데이터·API 상세 연결 방법

| 대상 ID | 연결 대상 | 실제 작업 | 참조 계약 | 검증 기준 |
| --- | --- | --- | --- | --- |
| DATA-001, DATA-002 | calendar·시간 선택·일정 control | 공유 일정 표시·모달 생성/수정 진입 대조 | [데이터](../../11_DataRequirements.md) | 보기 전환으로 저장 집합 불변 |
| API-003 | COMMON-002 / calendar callback | onViewChange·기간 이동 대조 | [API](../../12_APISpecification.md) | 선택 버튼·표시 기간·같은 URL |

## 4. 도메인 분기와 Workflow

Web implementation-derived. 실제 구현은 source·SDK가 소유하고 JSON은 문서 의미·상태·추적을 소유한다. 별도 MVVM·Service가 구현되어 있다고 서술하지 않는다.

## 5. 리스크·차단 대응과 작업 범위

- 수정 허용: CalendarApp_Web/Document/09_WireframeMockup/SCR-002.json, CalendarApp_Web/Document/14_ExecutionPlan/SCR-002.md, CalendarApp_Web/Document/14_ExecutionPlan/SCR-002/TASK-001.md와 동일 이름 메타데이터.
- 참조 전용: COMMON-001~003, 문서 결합 도구, src/App.tsx·src/styles.css·SDK·11·12번 계약.
- 검증: 실측 계층·버튼 선택·기간 이동·모달 취소 복귀·일정 데이터 보존.
- 중단: 참조 해석 실패·source 변경·경계 밖 수정 필요. 재개: 책임·근거 재확정.
- 스크롤과 sticky 시각 재현·종일·더 보기 상태는 미검증을 유지한다.

## 6. 단계 전환과 모듈·스크립트 수정 계획

| 현재 단계 | 조건 | 다음 단계 |
| --- | --- | --- |
| 기준선 확인 | Runtime과 source 일치 | JSON 작성 |
| JSON 작성 | 공통 결합·ID·상태 유효 | 검증 |
| 검증 | 실행 결과와 미검증 명시 | Review 판정 |

현재 앱 코드·SDK·저장 정책 변경 없음. 공통 상태 계약 변경은 소유 SCR-001/TASK-001에 귀속한다.

## 7. 완료 기준과 검증 방법

본문·상태 JSON 작성과 결합 구조 검증은 확인하되 전체 renderer 충실도·고객 인수 완료로 확장하지 않는다. [검증 보고서](../../../../Document/17_ValidationReport.md)에 현재 결과와 미검증 범위를 기록한다.

## 8. 실행 모드와 병렬 경계

| 항목 | 내용 |
| --- | --- |
| 실행 모드 | SEQUENTIAL |
| 병렬 그룹 | NONE |
| 선행 조건 | SCR-001/TASK-001 공통 결합 계약 |
| Write Set | SCR-002.json·소유 실행계획·현재 Task·메타데이터 |
| Read-only Shared Set | 공통 JSON·결합 도구·앱 source·SDK·데이터/API 계약 |
| 통합·검토 게이트 | source hash 유지·미검증 항목 구분 |
