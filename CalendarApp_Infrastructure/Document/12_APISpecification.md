# CalendarApp Infrastructure 운영 계약

## 1. 인터페이스 범위

파일 구성·CLI·로컬 IPC·HTTP 자산 제공·PostgreSQL 프로세스 계약이다. 원격 운영 API나 장비 연결은 없다.

## 2. 공통 규칙

webPort=5173, postgresPort=55432가 현재 .config 값이다. 포트 변경은 파일을 수정하고 정상 재시작해야 한다. 앱 루트 변경은 IPC 식별값도 변경한다. IPC는 줄바꿈 구분 UTF-8 문자열이며 DB 준비 결과는 아래 Database 계약을 따른다.

## 3. 인증 / 권한

웹은 로그인 없이 127.0.0.1로 제공한다. macOS control socket은 0600으로 설정한다. Windows pipe에 추가 ACL 설정 코드는 없으며 실행 사용자·OS 기본 권한을 따른다. DB 비밀값은 파일과 자식 프로세스 환경에서 처리한다.

## 4. 인터페이스 목록

| API ID | 이름 | 유형 | 용도 | 호출 Module | Data | UI 사용 위치 | 상세 문서 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-201 | .config | File | 포트 구성 읽기 | RuntimeConfig | DATA-201 | 없음 | 아래 규칙 | Review |
| API-202 | Supervisor IPC / CLI | IPC / CLI | status·start·stop·wait | 시작·종료 스크립트 | DATA-202 | 없음 | [계약](12_api_spec/API-202_Supervisor.md) | Review |
| API-203 | loopback HTTP | HTTP | Vite 앱 자산 제공 | 브라우저 | 없음 | 없음 | GET /, DB 디렉터리 404 | Review |
| API-204 | PostgreSQL process CLI | CLI | 도구 검사·initdb·pg_ctl | PostgresProcessManager | DATA-203, DATA-204 | 없음 | [계약](12_api_spec/API-204_PostgresProcess.md) | Review |

.config는 빈 줄·# 주석을 허용하고 WEB_PORT·POSTGRES_PORT의 숫자 행만 허용한다. 중복·누락·동일 포트·범위 이탈·알 수 없는 키는 예외다. HTTP 차단은 decode→backslash 정규화→소문자→경로 segment 검사다. decode 실패는 400, postgresql segment는 404다. 일반 일정 HTTP CRUD는 존재하지 않는다.

[Database 계약](../../CalendarApp_Database/Document/12_APISpecification.md), [모듈](10_ModuleMapping.md), [데이터](11_DataRequirements.md).
