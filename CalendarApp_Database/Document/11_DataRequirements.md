# CalendarApp Database 데이터 요구사항

## 1. 데이터 목록

| Data ID | 이름 | 설명 | 생산 Module | 소비 Module | UI 사용 위치 | 관련 API | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DATA-101 | DB 존재 결과 | calendarapp 존재 여부 | PostgreSQL catalog | DatabaseBootstrap | 없음 | API-101 | Review |
| DATA-102 | 로컬 클러스터 | 플랫폼별 PostgreSQL 저장 데이터 | PostgreSQL | DatabaseBootstrap / Infrastructure | 없음 | API-101 | Review |

DATA-101은 `SELECT 1 FROM pg_database WHERE datname = 'calendarapp'`의 문자열 결과이며 `1`이면 존재로 판정한다. DATA-102는 시스템·사용자 DB 파일을 포함하는 관리 대상이고 일정 데이터 정본이 아니다.

## 2. 데이터 흐름

Infrastructure → DatabaseBootstrap → catalog 조회 → 없으면 createdb → 준비 성공 또는 오류 반환. 웹 일정 집합이 이 흐름에 들어가지 않는다.

## 3. 보존 및 품질 규칙

| Data ID | 보존 범위 | 정합성·검증 | 민감도 | 확인 필요 사항 |
| --- | --- | --- | --- | --- |
| DATA-101 | 준비 호출 중 메모리 | 결과 문자열 비교와 명령 종료 코드 | 일반 상태 | DB 권한·오류 |
| DATA-102 | data 또는 data-macos 디렉터리 | PostgreSQL cluster 버전·플랫폼에 종속 | 실제 내용에 따라 민감 정보 가능 | 사용자 테이블·백업 복구·보존 기간 미검증 |

소유권은 Database이며 관리·소비는 Infrastructure다. 물리 업무 스키마·인덱스·migration을 새로 정의하지 않는다. [모듈](10_ModuleMapping.md), [계약](12_APISpecification.md).


DATA-103: workplanner.workspace 단일 개인 workspace; revision bigint·payload jsonb(items/settings). 집합 단위 잠금으로 계층 변경의 원자성을 보장한다. DATA-104: workplanner.requests의 requestId·본문 hash·결과 JSON. 재시도는 동일 결과, requestId 재사용 본문 불일치는 충돌이다. 날짜·도메인 정규화는 Web 서비스가 소유한다. 소규모 개인 일정 aggregate 저장으로 시작하며 다중 사용자·대규모 검색 인덱스는 범위 밖이다.

## AI 초안 보존 확장

Web DATA-008/API-006의 원본·편집본·확정 미리보기를 workplanner.proposals에 보관한다. 초안의 version과 pending/applied/discarded를 workspace revision과 분리한다. request fingerprint와 응답은 기존 requests를 공유한다. workspace → proposal 순서로 잠그고 확정 시 일정·초안 상태·응답을 한 transaction으로 저장한다. 완료 기록 자동 삭제는 하지 않는다.
