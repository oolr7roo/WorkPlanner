# TASK-001 시작·제어 준비 순서 확인

## 1. 작업 목적과 전체 처리 흐름

소유 작업 흐름: [MOD-Supervisor](../MOD-Supervisor.md). Windows 실행 복구 기준선이다. 사용자 승인 범위에서 기존 데이터 보존과 시작·종료 검증을 수행한다. FR 범위: FR-009, FR-011, FR-012.

```text
소유 흐름·SRS 확인 → 현재 source·계약 대조 → 비파괴 검증 → 증거 기록 → Review 유지 또는 검증 완료 판정
```

- 실행 모드: SEQUENTIAL
- 병렬 그룹: NONE
- Write Set: WorkPlannerStart.bat, WorkPlannerStart.ps1, .gitignore, postgresql/README.txt. 이 Task 문서와 대응 메타데이터를 함께 갱신한다.
- Read-only Shared Set: server.mjs, start.command, 관련 SRS·9~13번 원문

## 2. 단계별 실제 작업

### 단계 1 — 입력 기준선 확인

- 목적: 시작·제어 준비 순서 확인의 현재 범위를 확정한다.
- 입력 기준: 소유 2단계 문서, SRS의 FR-009, FR-011, FR-012.
- 처리 과정: DB→Vite listen→control listen 순서, strictPort, wait polling과 --open 계약을 확인한다. 직접 중복 시작과 스크립트 재사용 시작을 구분한다. Windows 배치는 PowerShell 진입만 담당하며 PowerShell은 의존성 사전 확인·숨김 자식 프로세스 실행·조기 종료 감지·로그 안내를 소유한다. 준비 판정과 브라우저 열기는 기존 server.mjs status/wait --open CLI를 사용한다.
- 출력: source·계약·JSON 대조 결과와 미검증 목록.
- 완료 조건: 구현에 없는 동작을 완료로 쓰지 않고 현재 책임이 설명됨.

### 단계 2 — 검증과 판정

- 목적: 정적 확인과 실제 동작 검증을 분리한다.
- 입력 기준: 앞 단계 대조 결과, 현재 실행 환경.
- 처리 과정: 컴파일·빌드·기존 브라우저 검증 또는 승인된 운영 환경에서 검증한다. 이번 승인된 로컬 환경에서는 클러스터 백업 후 시작·종료를 실행하며 업무 데이터 SQL 쓰기는 수행하지 않는다.
- 출력: 실행 증거 또는 미실행 사유.
- 완료 조건: 실패·미실행을 통과로 기록하지 않음.

## 3. 데이터·API 상세 연결 방법

| 대상 ID | 연결 대상 | 실제 작업 | 참조 계약 | 검증 기준 |
| --- | --- | --- | --- | --- |
| DATA-202 | 실행 감독 | 정본과 호출 근거 대조; 계약 변경 없음 | [데이터](../../11_DataRequirements.md) / [API](../../12_APISpecification.md) | 범위와 오류 전파가 현재 구현과 같음 |
| API-202 | 실행 감독 | 정본과 호출 근거 대조; 계약 변경 없음 | [데이터](../../11_DataRequirements.md) / [API](../../12_APISpecification.md) | 범위와 오류 전파가 현재 구현과 같음 |
| API-203 | 실행 감독 | 정본과 호출 근거 대조; 계약 변경 없음 | [데이터](../../11_DataRequirements.md) / [API](../../12_APISpecification.md) | 범위와 오류 전파가 현재 구현과 같음 |

## 4. 도메인 분기와 Workflow

| 구현 도메인 | 분기 문서 | 선택 Workflow | 상태 | 적용 범위 |
| --- | --- | --- | --- | --- |
| infrastructure | AISkill의 infrastructure DomainRules·14 Override를 적용 | 전용 구현 템플릿 없음; 기존 CLI·Node·PowerShell 구조 유지 | Existing | 승인된 Windows 복구·실제 검증 |

## 5. 리스크·차단 대응과 작업 범위

- 확인 대상 파일: server.mjs, start.command, WorkPlannerStart.bat.
- 생성·수정 대상: WorkPlannerStart.bat, WorkPlannerStart.ps1, .gitignore, postgresql/README.txt.
- 제외 대상: 클러스터 파일·비밀 파일 내용·사용자 브라우저 데이터·범위 밖 구현.
- 중단 기준: 백업 검증 실패, 비정상 DB 종료 상태, 데이터 파일 복구 필요, 승인 범위 밖 변경 필요.
- 재개 조건: 영향 범위와 검증 환경을 확정하고 해당 owner Task 기준선을 갱신함.
- 현재 결합 위험: Web의 App 내부 UI·업무·저장이 한 파일에 결합됨. 분리된 Interface·Service가 존재한다고 기록하지 않는다.

## 6. 단계 전환과 모듈·스크립트 수정 계획

| 현재 단계 | 조건 | 다음 단계 |
| --- | --- | --- |
| 기준선 확인 | 책임·계약 일치 | 검증 |
| 검증 | 증거 확보 또는 미검증 명시 | 현재 상태 판정 |

| 대상 | 현재 책임 | 변경 책임 | 공개 Interface·Service | 입력·출력·변환 책임 | 의존 방향·금지 참조 |
| --- | --- | --- | --- | --- | --- |
| MOD-Supervisor | 10번 책임과 현재 source | Windows 진입·오류 안내 보완 | 현재 실제 함수·SDK·CLI 경계만 인정 | 11·12번 정본 대조 | browser→DB 직접 접근 없음; 별도 계층을 창작하지 않음 |

최상위 14번은 확인만이다. 소유 2단계의 Write Set과 경로를 갱신한다. UI·Semantic Schema·UIUX·UI 문서 조회는 비UI 실행 복구이므로 해당 없음이다. 참조 source server.mjs, postgresql/manage.mjs, runtime-config.mjs와 SRS·API 계약은 보존한다.

## 7. 완료 기준과 검증 방법

- 완료 기준: 현재 동작·오류·대상 파일·책임이 source와 계약 문서에 일치함. 동작 검증 증거가 없으면 Review 유지.
- 2026-10-22 Windows 범위 검증 결과: npm ci 후 TypeScript·Vite build 통과. 배치 시작 HTTP 200·DB 연결·중복 시작·재시작 통과. 웹 포트 충돌 시 약 3.1초 내 exit 1과 로그 표시, DB 자동 회수 통과. macOS 및 전체 UI QA는 미검증이다.

### 단계별 문서·구현 대조

| 단계 / 비교 항목 | 문서 기준 | 실제 근거 | 판정 | 차이 해소 |
| --- | --- | --- | --- | --- |
| 책임·CLI | 소유 흐름 및 API-202·API-204 | 기존 server.mjs·manage.mjs 보존, Windows 진입점만 보완 | 일치 | 책임 중복 없음 |
| 복구·실행 | 이 Task의 승인 범위 | npm ci 후 TypeScript·Vite build 통과. 배치 시작 HTTP 200·DB 연결·중복 시작·재시작 통과. 웹 포트 충돌 시 약 3.1초 내 exit 1과 로그 표시, DB 자동 회수 통과. | 일치 | 필수 Windows 검증 통과 |
| UI·macOS | 변경 대상 아님 | UI·macOS source 미변경 | 해당 없음 | 기존 전체 QA Review 유지 |
- 검증 방법: 빌드·정적 계약 대조·격리 브라우저 확인·별도 운영 검증 중 해당 수단을 사용한다. 신규 테스트 코드 작성은 이 Task 범위에 없다.
- 현재 구현 관찰은 존재 확인이며 QA 전체 통과와 다르다. 이 Windows 복구의 실행 증거는 위 대조 표에 기록하며 기존 전체 QA [검증 보고서](../../../../Document/17_ValidationReport.md)와 구분한다.

## 8. 실행 모드와 병렬 경계

| 항목 | 내용 |
| --- | --- |
| 실행 모드 | SEQUENTIAL |
| 병렬 그룹 | NONE |
| 선행 조건 | 소유 흐름·계약이 현재 기준선과 일치 |
| Write Set | WorkPlannerStart.bat, WorkPlannerStart.ps1, .gitignore, postgresql/README.txt |
| Read-only Shared Set | server.mjs, start.command |
| 공유 상태·생성물·계약 | 승인된 로컬 프로세스 시작·정지 허용; 브라우저 저장 데이터·비밀값·DB 사용자 테이블 변경 금지 |
| 통합·검토 게이트 | 증거와 미검증 목록 분리, source hash 보존 |
