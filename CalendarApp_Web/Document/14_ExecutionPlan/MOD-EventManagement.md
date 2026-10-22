# MOD-EventManagement 작업 흐름별 실행 계획

## 1. 문서 목적

- 작업 흐름 유형: Module
- 대상 작업 흐름: MOD-EventManagement 일정 관리
- 관련 SRS 근거: FR-002, FR-003, FR-004, FR-006, FR-008
- 사용자 승인에 따라 트리 일정 기능과 책임 분리를 구현하는 기준선이다.

## 2. 작업 순서 / 의존성

| 순서 | Task ID | 작업명 | 대상 | 선행 조건 | 실행 모드 | 병렬 그룹 | Write Set | Read-only Shared Set | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [TASK-001](MOD-EventManagement/TASK-001.md) | 등록·수정과 입력 검증 기준선 확인 | MOD-EventManagement | 없음 | SEQUENTIAL | NONE | 일정 업무·편집 구현 | source: src/App.tsx; 8·10·11·12번, 관련 JSON | Review |
| 2 | [TASK-002](MOD-EventManagement/TASK-002.md) | 삭제·취소의 반영 경계 확인 | MOD-EventManagement | TASK-001 | SEQUENTIAL | NONE | 일정 업무·편집 구현 | source: src/App.tsx; 8·10·11·12번, 관련 JSON | Review |
| 3 | [TASK-003](MOD-EventManagement/TASK-003.md) | 단계별 색상 정책과 설정 상태 | MOD-EventManagement | 공개 계약 확정 | SEQUENTIAL | NONE | src/features/schedules/scheduleColors.ts, src/features/schedules/useScheduleColorSettings.ts | 10·11·12번, 기존 source | Review |

## 3. 책임 및 연결 판단

| 대상 | JSON 연결 근거 | Module Mapping 근거 | 판단 | 관련 Task |
| --- | --- | --- | --- | --- |
| 일정 관리 | save, delete, cancel | [10번](../10_ModuleMapping.md) | Existing | TASK-001, TASK-002 |

### 3.1 모듈 경계 계약

| 모듈 | 공개 Interface | 경계 Service | 입력·출력 계약 | 금지 직접 참조 | 관련 Task |
| --- | --- | --- | --- | --- | --- |
| MOD-EventManagement | 현 source 함수·SDK·CLI | 별도 Service 추상화 없음; 책임은 features/schedules 하위 파일로 분리 | 11·12번 계약 | 브라우저에서 DB 파일·비밀 접근 | TASK-001, TASK-002 |

## 4. 데이터·API 연결

| 작업 흐름 / 기능 | DATA 근거 | API 근거 | 사용 목적 | 관련 Task |
| --- | --- | --- | --- | --- |
| MOD-EventManagement | DATA-001, DATA-002, DATA-003 | API-002 | 일정 관리 | TASK-001, TASK-002 |

상세는 [데이터](../11_DataRequirements.md), [API](../12_APISpecification.md). UI 실행 연결은 실제 JSON과 source에서 대조한다.

## 5. 리스크 / 차단 사항

현재 구현은 존재하나 전체 인수 검증 전이므로 Task 상태는 Review다. UI·업무·저장은 features/schedules와 공통 툴바로 분리한다. UI → Hook → 순수 업무 함수·저장 어댑터 방향을 유지한다. DB 운영·Windows 전체 프로세스 검증은 미실행이며 미실행을 구현 부재와 혼동하지 않는다.

JSON 연결 정본: [월](../09_WireframeMockup/SCR-001.json), [주](../09_WireframeMockup/SCR-002.json), [일](../09_WireframeMockup/SCR-003.json), [MOD-001](../09_WireframeMockup/MOD-001.json). Source: [App](../../../src/App.tsx).


단계별 색상 확장: FR-013·014 → COMMON-001/MOD-001/MOD-002 → MOD-EventManagement → DATA-002·004/API-001. 순수 정책·설정 상태와 팝업의 상세 소유는 TASK-003이며 저장 어댑터·App 조립은 기존 TASK-001이 담당한다. [범위 검증](../Evidence/ColorPresets/README.md)을 확인했다. 전체 문서·인수 상태는 Review를 유지한다.
