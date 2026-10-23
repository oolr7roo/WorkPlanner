# TASK-001 일 보기 본문·상태·전환 기준선

## 1. 작업 목적과 전체 처리 흐름

소유 흐름: [SCR-003](../SCR-003.md). 소유 대상은 SCR-003의 본문·공통 배치·override이며 COMMON 정의나 결합 도구를 수정하지 않는다. 실행 모드 SEQUENTIAL, 병렬 그룹 NONE.

source·Runtime 확인 → 일 보기 DOM 대응 → JSON 상태·배치 작성 → 공통 결합 → 참조·좌표·전환 검증 → Review 판정.

## 2. 단계별 실제 작업

1. [App](../../../../src/App.tsx), [SDK](../../../../node_modules/trud-calendar/dist/index.js), [SRS](../../../../Document/8_SoftwareRequirementsSpecification.md), [모듈](../../10_ModuleMapping.md), [Runtime](../../../../Document/Evidence/ViewSplit/runtime.json)을 확인한다.
2. [SCR-003](../../09_WireframeMockup/SCR-003.json)의 calendar, day-scroll-001, day-time-grid-001과 반복 셀·일정 control을 실측 DOM index로 대응한다. 캡처 날짜·이벤트는 표본이며 일정 정본이 아니다.
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

- 수정 허용: CalendarApp_Web/Document/09_WireframeMockup/SCR-003.json, CalendarApp_Web/Document/14_ExecutionPlan/SCR-003.md, CalendarApp_Web/Document/14_ExecutionPlan/SCR-003/TASK-001.md와 동일 이름 메타데이터.
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
| Write Set | SCR-003.json·소유 실행계획·현재 Task·메타데이터 |
| Read-only Shared Set | 공통 JSON·결합 도구·앱 source·SDK·데이터/API 계약 |
| 통합·검토 게이트 | source hash 유지·미검증 항목 구분 |


현재 표시 기준: FR-016에 따라 작업만 표시하며 전체 저장 집합·계층·색상은 유지한다. App의 공유 투영 구현은 SCR-001/TASK-001 단독 소유다. 이 Task는 SCR-003.json의 calendar 표시 의미와 검증을 소유한다.


### 계획·작업 구현 대조 결과

| 비교 항목 | 현재 기준 | 실제 근거 | 판정 |
| --- | --- | --- | --- |
| 구분·호환 | FR-016, DATA-001/002 | kind 정책·저장 경계 12건 통과 | 일치 |
| 편집·저장·취소 | MOD-001 kind-field 및 save/cancel | 실제 신규 기본값, 구분 변경 취소, 저장·재접속 복원 확인 | 일치 |
| 표시·계층 | SCR-001~005 표시 기준 | 월·주·일 작업2/계획0, 간트 계획 접힘 무시·작업 접힘 공유 확인 | 일치 |
| 배치·스타일 | MOD-001 및 기존 styles.css | 1440×1000 실측과 390×844 콤보박스·저장 버튼 확인; CSS 변경 없음 | 일치 |
| 공용 뷰어 | 기존 전체 시각 reconciliation | 구조·source·bindings 자동 검증 통과, 공용 뷰어 시각/참조 문서 실제 열기는 미실행 | 미검증 |

[이번 범위 검증](../../Evidence/ScheduleKinds/README.md). 앱 동작 범위의 필수 차이는 해소했다. 전체 제품·공용 뷰어 Review는 유지한다.
