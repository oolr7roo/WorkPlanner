# CalendarApp Database 모듈 책임

## UI

없음. DB 관리 UI와 브라우저 직접 DB 연결은 없다.

## Module

| 모듈 | 연결 요구사항 ID | 책임 | UI 사용 위치 | 관련 문서 | 상태 |
| --- | --- | --- | --- | --- | --- |
| DatabaseBootstrap | FR-010 | pg_database 조회와 calendarapp 생성 | 없음 | [manage.mjs](../../postgresql/manage.mjs) | Review |

## Core

데이터베이스 준비의 별도 Core·repository·migration 구현은 없다. DB 실행 도구 호출과 파일 관리는 Infrastructure 소유 책임이며 같은 파일에서 협력한다.

## 외부 모듈

| 모듈 | 연결 요구사항 ID | 사용 목적 | 참조 문서 | 상태 |
| --- | --- | --- | --- | --- |
| PostgreSQL psql / createdb | FR-010 | 존재 조회와 생성 | [호출 근거](../../postgresql/manage.mjs) | Review |

일정 repository, 업무 테이블, query API, migration은 소스에 없다. 기존 클러스터에 수동 생성된 사용자 테이블까지 없다고 단정하지 않는다. [SRS](../../Document/8_SoftwareRequirementsSpecification.md).
