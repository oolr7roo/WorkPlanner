# CalendarApp Infrastructure 모듈 책임

## UI

별도 운영 UI는 없다. 사용자 브라우저 열기는 시작 스크립트의 편의 동작이다.

## Module

| 모듈 | 연결 요구사항 ID | 책임 | UI 사용 위치 | 관련 문서 | 상태 |
| --- | --- | --- | --- | --- | --- |
| RuntimeConfig | FR-009 | 포트 파일 읽기·검증 | 없음 | [원본](../../runtime-config.mjs) | Review |
| Supervisor | FR-009, FR-011, FR-012 | DB→Vite→control 준비·종료 | 없음 | [원본](../../server.mjs) | Review |
| PostgresProcessManager | FR-011 | 플랫폼 도구 탐색·초기화·시작·정지 | 없음 | [원본](../../postgresql/manage.mjs) | Review |
| PostgreSQLPathGuard | FR-012 | 웹 DB 디렉터리 차단 | 없음 | [원본](../../vite.config.ts) | Review |

## Core

제어 endpoint는 appRoot 소문자 SHA-256의 앞 16자리로 구분한다. 시스템 tmp socket 또는 Windows named pipe를 사용한다.

## 외부 모듈

| 모듈 | 연결 요구사항 ID | 사용 목적 | 참조 문서 | 상태 |
| --- | --- | --- | --- | --- |
| Node.js / Vite | FR-009, FR-012 | 감독 프로세스와 로컬 웹 제공 | [패키지](../../package.json) | Review |
| pg_ctl / initdb / psql / createdb | FR-010, FR-011 | DB 준비·관리 | [호출](../../postgresql/manage.mjs) | Review |
| zsh / cmd / PowerShell / open | FR-009 | OS별 시작·종료·브라우저 열기 | [시작 Mac](../../start.command), [시작 Windows](../../WorkPlannerStart.bat) | Review |

Supervisor가 상태를 소유하고 앱 업무 일정을 직접 변경하지 않는다. [SRS](../../Document/8_SoftwareRequirementsSpecification.md).
