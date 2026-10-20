# CalendarApp Infrastructure 데이터 요구사항

## 1. 데이터 목록

| Data ID | 이름 | 설명 | 생산 Module | 소비 Module | UI 사용 위치 | 관련 API | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DATA-201 | 실행 설정 | WEB_PORT와 POSTGRES_PORT | .config | RuntimeConfig / Supervisor | 없음 | API-201 | Review |
| DATA-202 | 감독 상태 | running·stopped와 IPC endpoint | Supervisor | 시작·종료 명령 | 없음 | API-202 | Review |
| DATA-203 | 관리자 비밀 파일 | DB 관리자 비밀번호 | macOS 초기화 또는 기존 Windows 파일 | PostgresProcessManager | 없음 | API-204 | Review |
| DATA-204 | 운영 로그 | 감독·DB 오류 및 준비 기록 | Node / PostgreSQL | 운영자 | 없음 | API-204 | Review |

## 2. 데이터 흐름

.config → RuntimeConfig → Supervisor → PostgreSQL·Vite. IPC 요청 → Supervisor 상태 또는 정지. 비밀 파일 → 자식 DB 명령 환경이며 브라우저에는 전달되지 않는다. 로그는 postgresql 하위 파일에 기록한다.

## 3. 보존 및 품질 규칙

| Data ID | 보존 범위 | 정합성·검증 | 민감도 | 확인 필요 사항 |
| --- | --- | --- | --- | --- |
| DATA-201 | 파일 | 허용 키·중복 금지·정수 범위·포트 상이 | 일반 | 환경별 override 없음 |
| DATA-202 | 프로세스·socket | ping 응답·제어 timeout | 로컬 제어 | 웹·DB 건강상태와 별개 |
| DATA-203 | 플랫폼별 비밀 파일 | macOS 신규 파일 0600, wx 생성 | 비밀 | 기존 파일·Windows ACL 미검증 |
| DATA-204 | 파일 | 시작 스크립트의 append 로그 | 경로·운영 정보 포함 가능 | 회전·보관 기간·알림·조회 권한 미구현 |

[모듈](10_ModuleMapping.md), [인터페이스](12_APISpecification.md). 로그·metric·자산·구성·상태를 같은 정본으로 합치지 않는다. metric 수집은 없다.
