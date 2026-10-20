# web 실행계획

## 1. 문서 목적

web 구현 도메인의 현재 책임·작업 흐름 진입점·검증 마일스톤을 관리한다. 세부 절차는 2단계 및 Task 문서가 소유한다.

## 2. 실행계획 작성 상태

### 2.1 화면별

| 화면번호 | 설명 | 화면문서 | 2단계 하위문서 | 상태 |
| --- | --- | --- | --- | --- |
| SCR-001 | 월 보기·공통 문서 결합 기준선 | [SCR-001](09_WireframeMockup/SCR-001.json) | [SCR-001](14_ExecutionPlan/SCR-001.md) | Review |
| SCR-002 | 주 보기 | [SCR-002](09_WireframeMockup/SCR-002.json) | [SCR-002](14_ExecutionPlan/SCR-002.md) | Review |
| SCR-003 | 일 보기 | [SCR-003](09_WireframeMockup/SCR-003.json) | [SCR-003](14_ExecutionPlan/SCR-003.md) | Review |
| SCR-004 | 간트 트리 | [SCR-004](09_WireframeMockup/SCR-004.json) | [공통 화면 소유](14_ExecutionPlan/SCR-001.md) | Review |
| SCR-005 | 우선순위 트리 | [SCR-005](09_WireframeMockup/SCR-005.json) | [공통 화면 소유](14_ExecutionPlan/SCR-001.md) | Review |

### 2.2 내부 모듈·공통 작업 흐름별

| 유형 | 대상 | 구현 책임 | 연결 대상 | 2단계 하위문서 | 상태 |
| --- | --- | --- | --- | --- | --- |
| Module | MOD-EventManagement | 일정 관리 | SCR-001~003 / MOD-001 | [MOD-EventManagement](14_ExecutionPlan/MOD-EventManagement.md) | Review |
| Module | MOD-BrowserEventStore | 브라우저 저장소 | SCR-001~003 / MOD-001 | [MOD-BrowserEventStore](14_ExecutionPlan/MOD-BrowserEventStore.md) | Review |

## 3. 실행 기준과 문서 간 연결

- [6_FunctionalRequirements](../../Document/6_FunctionalRequirements.md)
- [7_SystemConditions](../../Document/7_SystemConditions.md)
- [8_SoftwareRequirementsSpecification](../../Document/8_SoftwareRequirementsSpecification.md)

- 모듈: [10_ModuleMapping](10_ModuleMapping.md)
- 데이터: [11_DataRequirements](11_DataRequirements.md)
- 인터페이스: [12_APISpecification](12_APISpecification.md)
- UI: [09_WireframeMockup](09_WireframeMockup.md), [13_UIUXRequirements](13_UIUXRequirements.md)

## 4. 마일스톤

| 마일스톤 | 대상 작업 흐름 | 연결 하위 문서 | 실행 모드 | 병렬 그룹 | 선행 마일스톤 | 리스크 게이트 | 완료 기준 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M1 | SCR-001 / SCR-002 / SCR-003 | [월](14_ExecutionPlan/SCR-001.md), [주](14_ExecutionPlan/SCR-002.md), [일](14_ExecutionPlan/SCR-003.md) | SEQUENTIAL | NONE | 없음 | Review: 실제 검증 증거 | 현재 구현·정본·Task 연결 일치; 트리·간트 검증 |
| M2 | MOD-EventManagement | [MOD-EventManagement](14_ExecutionPlan/MOD-EventManagement.md) | SEQUENTIAL | NONE | M1 | Review: 실제 검증 증거 | 현재 구현·정본·Task 연결 일치; 트리·간트 검증 |
| M3 | MOD-BrowserEventStore | [MOD-BrowserEventStore](14_ExecutionPlan/MOD-BrowserEventStore.md) | SEQUENTIAL | NONE | M2 | Review: 실제 검증 증거 | 현재 구현·정본·Task 연결 일치; 트리·간트 검증 |

공용 source 파일·프로세스·클러스터 자원이 겹치므로 병렬 Wave를 확정하지 않는다. 작성 상태는 Review이며 구현이 이미 존재하는 것과 검증·고객 승인 완료를 분리한다. 도메인 간 순서는 Infrastructure 환경 확인→Database 준비 확인→Web 사용 경로 확인이다. 운영 시스템 상태를 바꾸는 실행은 문서 작성 작업에 포함하지 않는다.

공통 정의·결합 도구의 기준선은 SCR-001/TASK-001이 단독 소유한다. SCR-002·003은 이를 참조하고 자신의 본문·override만 소유한다. COMMON 실행계획을 중복 생성하지 않는다. 문서 책임 분리는 현재 App 내부 런타임 책임을 리팩터링한 결과가 아니다.


## 2026-10-21 트리 일정 구현 기준선

숫자 우선순위 대신 parentId/order로 형제 간 배치 순서를 사용한다. SCR-005는 접고 펴는 트리 목록이며 SCR-004도 같은 트리 순서와 접힘 상태를 공유한다. 들여쓰기는 단계당 8px, 최대 24px이다. 제목 클릭은 펼침·접힘, 별도 편집 버튼은 MOD-001을 연다. 부모 대표 기간은 하위 일정 범위이며 삭제 시 자식은 한 단계 위로 보존한다. 기존 v1 데이터는 변경하지 않고 v2로 변환한다.
