# CalendarApp QA 테스트 계획

## 1. 테스트 범위

현재 개인 달력·브라우저 저장·로컬 프로세스·DB 준비·웹 차단을 검증한다. 구현되지 않은 로그인·일정 REST·DB 일정 테이블·동기화·알림은 제외한다. QA 수행 결과는 별도 검증 보고서에 기록한다.

## 2. 테스트 환경

Mac 실행 호스트, Node 26.10.0, npm 11.19.1, Vite 6.4.3의 현재 검증 환경과 Windows 운영 대상은 구분한다. Chromium 검증 viewport는 1440×1000·390×844, 시간대 Asia/Seoul이며 격리 브라우저 프로필을 사용한다. Safari·Edge·Firefox는 검증 후보이고 지원 승인·통과 상태가 아니다. 기본 운영 포트와 충돌하지 않도록 문서용 웹 검증은 5178을 사용한다.

## 3. 테스트 케이스 목록

| TC ID | 대상 ID | 유형 | 목적 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- | --- |
| [TC-001](15_QATestPlan/Domain/web.md#tc-001) | FR-001 | 기능·회귀 | 월·주·일·기간 탐색 | Must | Review |
| [TC-002](15_QATestPlan/Domain/web.md#tc-002) | FR-002 | 기능·회귀 | 일정 등록 | Must | Review |
| [TC-003](15_QATestPlan/Domain/web.md#tc-003) | FR-003 | 기능·회귀 | 일정 수정 | Must | Review |
| [TC-004](15_QATestPlan/Domain/web.md#tc-004) | FR-004 | 기능·회귀 | 일정 삭제 | Must | Review |
| [TC-005](15_QATestPlan/Domain/web.md#tc-005) | FR-005 | 기능·회귀 | 이동·리사이즈 | Must | Review |
| [TC-006](15_QATestPlan/Domain/web.md#tc-006) | FR-006 | 기능·회귀 | 취소 경계 | Must | Review |
| [TC-007](15_QATestPlan/Domain/web.md#tc-007) | FR-007 | 기능·회귀 | 보존·복원 | Must | Review |
| [TC-008](15_QATestPlan/Domain/web.md#tc-008) | FR-008 | 기능·회귀 | 입력·저장 오류 | Must | Review |
| [TC-009](15_QATestPlan/Domain/web.md#tc-009) | DATA-001 | 기능·회귀 | 손상 데이터·origin 경계 | Must | Review |
| [TC-010](15_QATestPlan/Domain/database.md#tc-010) | FR-010 | 기능·회귀 | DB 준비와 재실행 | Must | Review |
| [TC-011](15_QATestPlan/Domain/database.md#tc-011) | DATA-102 | 기능·회귀 | 권한·동시 준비·복구 | Must | Review |
| [TC-012](15_QATestPlan/Domain/infrastructure.md#tc-012) | API-201 | 기능·회귀 | 설정 검사 | Must | Review |
| [TC-013](15_QATestPlan/Domain/infrastructure.md#tc-013) | API-202 | 기능·회귀 | 감독자 제어 | Must | Review |
| [TC-014](15_QATestPlan/Domain/infrastructure.md#tc-014) | API-204 | 기능·회귀 | 플랫폼 DB 관리 | Must | Review |
| [TC-015](15_QATestPlan/Domain/infrastructure.md#tc-015) | FR-012 | 기능·회귀 | DB 경로 차단 | Must | Review |
| [TC-016](15_QATestPlan/Domain/web.md#tc-016) | SCR-001, MOD-001 | 기능·회귀 | 반응형·접근성 | Must | Review |
| [TC-017](15_QATestPlan/EndToEnd.md#tc-017) | UF-008, UF-007 | 통합 | 운영 통합 경로 | Must | Review |

## 4. 테스트 케이스 상세

[Web](15_QATestPlan/Domain/web.md), [Database](15_QATestPlan/Domain/database.md), [Infrastructure](15_QATestPlan/Domain/infrastructure.md), [EndToEnd](15_QATestPlan/EndToEnd.md)가 정본이다. 번호는 프로젝트 내 고유하다.

## 5. 회귀 테스트 기준

일정 CRUD·취소·동일 origin 복원·보기 전환·입력 오류·DB 경로 차단을 변경 후 다시 확인한다. 실행 스크립트 변경 시 구성→DB→웹→control 준비 및 종료·실패 회수를 추가한다. 통합 순서는 Infrastructure→Database→Web→EndToEnd다.

## 6. 확인 필요 사항

드래그·리사이즈 전 경로, 저장 실패·손상 복구, 다중 탭 경합, Windows 감독·DB 실행, DB 백업 복구, 키보드·스크린 리더·대비율은 별도 증거가 필요하다. 새 테스트 소스 작성·실서비스 정지는 이번 문서 작업 범위에 포함하지 않는다.
