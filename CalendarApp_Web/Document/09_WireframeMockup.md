# CalendarApp 화면 인덱스

## 1. 문서 목적

현재 React 달력의 월·주·일 보기를 각각 상세 JSON으로 표현한다. SCR은 문서상 보기 식별자이며 실제 앱은 같은 Calendar의 상태를 전환한다. 별도 URL·페이지·독립 데이터 저장소를 추가하지 않는다. 작성 방식은 implementation-derived다. JSON은 의미·계층·상태·이벤트 추적을, TSX·CSS는 실제 표시와 동작을 소유한다. Runtime 캡처와 결합 JSON은 파생 증거다.

SCR-001의 의미는 기존 전체 달력에서 월 보기로 구체화한다. 전체 달력 동작은 SCR-001~003과 COMMON-001~003을 함께 참조한다.

## 2. 입력 근거

| 근거 ID | 근거 내용 | 반영 범위 |
| --- | --- | --- |
| UF-001, FR-001 | 탐색과 보기 전환 | SCR-001~003, COMMON-002 |
| UF-002~006, FR-002~006, FR-008 | 일정 관리·오류 안내 | SCR-001~003, COMMON-001, COMMON-003, MOD-001 |
| UF-007, FR-007 | 같은 일정 집합의 보존 | SCR-001~003, COMMON-003 |

입력 정본: [사용자 흐름](../../Document/5_UserFlow.md), [기능 요구사항](../../Document/6_FunctionalRequirements.md), [SRS](../../Document/8_SoftwareRequirementsSpecification.md).

## 3. 공통 화면 영역

| 공통 영역 ID | 공통 영역 이름 | 적용 화면 | Source Entry | Semantic Schema |
| --- | --- | --- | --- | --- |
| COMMON-001 | 헤더·홈 이동·일정 추가 | SCR-001~003 | [App](../../src/App.tsx), [스타일](../../src/styles.css) | [COMMON-001](09_WireframeMockup/COMMON-001.json) |
| COMMON-002 | 기간·보기 탐색 툴바 | SCR-001~003 | [CalendarToolbar](../../src/App.tsx) | [COMMON-002](09_WireframeMockup/COMMON-002.json) |
| COMMON-003 | 저장 범위 안내·저장 오류 | SCR-001~003 | [App](../../src/App.tsx) | [COMMON-003](09_WireframeMockup/COMMON-003.json) |

공통 정의는 공유 구조·의미·의도를 소유한다. 각 SCR은 app-shell, calendar-panel, 보기 본문과 공통 루트의 배치·현재 상태를 소유한다. 날짜·선택 상태를 공통 정의에 고정하지 않는다.

## 4. 화면 목록

| 화면 ID | 화면 이름 | 주요 목적 | Source Entry | Semantic Schema |
| --- | --- | --- | --- | --- |
| SCR-001 | 내 일정 달력 · 월 보기 | 요일 헤더·6주 42개 날짜 셀·일정 표시; 행 수는 이번 캡처 표본 | [App](../../src/App.tsx), [SDK](../../node_modules/trud-calendar/dist/index.js) | [SCR-001](09_WireframeMockup/SCR-001.json) |
| SCR-002 | 내 일정 달력 · 주 보기 | 데스크톱 7일 열·0~24시 시간표·겹치는 일정 | [App](../../src/App.tsx), [SDK](../../node_modules/trud-calendar/dist/index.js) | [SCR-002](09_WireframeMockup/SCR-002.json) |
| SCR-003 | 내 일정 달력 · 일 보기 | 하루 열·0~24시 시간표·겹치는 일정 | [App](../../src/App.tsx), [SDK](../../node_modules/trud-calendar/dist/index.js) | [SCR-003](09_WireframeMockup/SCR-003.json) |

공용 WireFrame 렌더러는 외부 COMMON 자동 결합을 지원하지 않는다. 세 SCR의 composition은 CalendarApp 문서 전용 작성 계약이며 공용 스키마 기능으로 간주하지 않는다. [문서 결합 도구](tools/compose-wireframes.mjs)는 COMMON 참조와 상태를 검증·결합하여 표준 v3 입력을 만든다. 사용 방법과 오류 경계는 [소유 Task](14_ExecutionPlan/SCR-001/TASK-001.md)에 있다. 공용 뷰어에서 전체 화면을 확인하려면 결합된 JSON을 사용한다. 작성용 SCR을 바로 열면 공통 영역이 표시되지 않는다.

## 5. 팝업 / 모달 목록

| 모달 ID | 모달 이름 | 주요 목적 | Source Entry | Semantic Schema |
| --- | --- | --- | --- | --- |
| MOD-001 | 일정 편집 | 다섯 보기에서 생성·수정·삭제·취소·자동/직접 색상 선택 | [ScheduleEditor](../../src/features/schedules/components/ScheduleEditor.tsx), [스타일](../../src/styles.css) | [MOD-001](09_WireframeMockup/MOD-001.json) |
| MOD-002 | 단계별 색상 설정 | COMMON-001 설정에서 프리셋 선택·추가·이름·단계 색상·미리보기·저장/취소 | [ScheduleColorSettings](../../src/features/schedules/components/ScheduleColorSettings.tsx) | [MOD-002](09_WireframeMockup/MOD-002.json) |

등록·수정은 같은 모달의 상태다. 기본 앱 진입은 월 보기다. 기준 viewport는 1440×1000, 반응형 확인 viewport는 390×844다. SDK 반복 구조는 현재 표본의 실측값이며 임의의 균등 격자가 아니다. 모바일 SDK 열 수는 반응형으로 달라질 수 있다. 전체 렌더 충실도·종일·더 보기 상태는 미검증으로 남긴다. [분리 검증 증거](../../Document/Evidence/ViewSplit/runtime.json), [검증 보고서](../../Document/17_ValidationReport.md).


## 2026-10-08 와이어프레임 추가 설계

사용자 승인 범위는 와이어프레임이다. 실제 앱 source, API, 데이터 저장은 수정하지 않는다.

- SCR-004: 일정 간트차트. 일정별 시작·종료 막대, 날짜축, 오늘 표시, 팝업 진입.
- SCR-005: 일정 우선순위 트리. 같은 부모 안에서 위쪽이 우선이며 드래그·키보드로 배치 순서를 변경한다.
- COMMON-002: 우선순위 → 간트차트 → 월 → 주 → 일. 다섯 보기의 이동 의도를 정의한다.
- MOD-001: 숫자 우선순위 입력은 제거한다. 부모 기간은 하위 일정에서 계산한다. 저장·취소 후 호출한 보기로 복귀한다.
- 설계 정본: [간트차트](09_WireframeMockup/SCR-004.json), [우선순위](09_WireframeMockup/SCR-005.json).
- 미리보기: [와이어프레임](../../public/wireframes/index.html). 표본 데이터로만 동작하며 실제 앱 데이터에 저장하지 않는다.

공통 화면·새 보기의 문서 기준선은 SCR-001/TASK-001, 팝업 기준선은 MOD-EventManagement/TASK-001이 소유한다. 새 기능의 실제 구현 연결은 Review다.
