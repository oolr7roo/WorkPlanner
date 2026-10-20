# infrastructure 실행계획

## 1. 문서 목적

infrastructure 구현 도메인의 현재 책임·작업 흐름 진입점·검증 마일스톤을 관리한다. 세부 절차는 2단계 및 Task 문서가 소유한다.

## 2. 실행계획 작성 상태

### 2.1 화면별

UI가 없는 도메인이므로 해당 없음.

### 2.2 내부 모듈·공통 작업 흐름별

| 유형 | 대상 | 구현 책임 | 연결 대상 | 2단계 하위문서 | 상태 |
| --- | --- | --- | --- | --- | --- |
| Module | MOD-RuntimeConfig | 포트 설정 | 비UI 운영 경계 | [MOD-RuntimeConfig](14_ExecutionPlan/MOD-RuntimeConfig.md) | Review |
| Module | MOD-Supervisor | 실행 감독 | 비UI 운영 경계 | [MOD-Supervisor](14_ExecutionPlan/MOD-Supervisor.md) | Review |
| Module | MOD-PostgresProcessManager | DB 프로세스 관리 | 비UI 운영 경계 | [MOD-PostgresProcessManager](14_ExecutionPlan/MOD-PostgresProcessManager.md) | Review |
| Module | MOD-PostgreSQLPathGuard | 웹 경로 차단 | 비UI 운영 경계 | [MOD-PostgreSQLPathGuard](14_ExecutionPlan/MOD-PostgreSQLPathGuard.md) | Review |

## 3. 실행 기준과 문서 간 연결

- [6_FunctionalRequirements](../../Document/6_FunctionalRequirements.md)
- [7_SystemConditions](../../Document/7_SystemConditions.md)
- [8_SoftwareRequirementsSpecification](../../Document/8_SoftwareRequirementsSpecification.md)

- 모듈: [10_ModuleMapping](10_ModuleMapping.md)
- 데이터: [11_DataRequirements](11_DataRequirements.md)
- 인터페이스: [12_APISpecification](12_APISpecification.md)

## 4. 마일스톤

| 마일스톤 | 대상 작업 흐름 | 연결 하위 문서 | 실행 모드 | 병렬 그룹 | 선행 마일스톤 | 리스크 게이트 | 완료 기준 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M1 | MOD-RuntimeConfig | [MOD-RuntimeConfig](14_ExecutionPlan/MOD-RuntimeConfig.md) | SEQUENTIAL | NONE | 없음 | Review: 실제 검증 증거 | 현재 구현·정본·Task 연결 일치 |
| M2 | MOD-Supervisor | [MOD-Supervisor](14_ExecutionPlan/MOD-Supervisor.md) | SEQUENTIAL | NONE | M1 | Review: 실제 검증 증거 | 현재 구현·정본·Task 연결 일치 |
| M3 | MOD-PostgresProcessManager | [MOD-PostgresProcessManager](14_ExecutionPlan/MOD-PostgresProcessManager.md) | SEQUENTIAL | NONE | M2 | Review: 실제 검증 증거 | 현재 구현·정본·Task 연결 일치 |
| M4 | MOD-PostgreSQLPathGuard | [MOD-PostgreSQLPathGuard](14_ExecutionPlan/MOD-PostgreSQLPathGuard.md) | SEQUENTIAL | NONE | M3 | Review: 실제 검증 증거 | 현재 구현·정본·Task 연결 일치 |

공용 source 파일·프로세스·클러스터 자원이 겹치므로 병렬 Wave를 확정하지 않는다. 작성 상태는 Review이며 구현이 이미 존재하는 것과 검증·고객 승인 완료를 분리한다. 도메인 간 순서는 Infrastructure 환경 확인→Database 준비 확인→Web 사용 경로 확인이다. 운영 시스템 상태를 바꾸는 실행은 문서 작성 작업에 포함하지 않는다.
