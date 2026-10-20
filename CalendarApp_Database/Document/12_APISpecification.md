# CalendarApp Database 접근 계약

## 1. 인터페이스 범위

DB 준비를 수행하는 psql·createdb CLI 계약만 존재한다. 브라우저용 repository·REST·SQL 함수·migration 계약은 없다.

## 2. 공통 규칙

host=127.0.0.1, port=.config의 POSTGRES_PORT, user=postgres. 상태 확인 DB는 postgres다. 시스템 호출에서 exit 0과 stdout 값을 사용하고 실패는 예외로 전달한다.

## 3. 인증 / 권한

password 파일을 읽어 자식 프로세스 PGPASSWORD로 전달한다. DB 준비는 postgres 관리자 권한을 사용하며 최소 권한 앱 계정은 구현되어 있지 않다. 비밀값의 내용은 문서화하지 않는다.

## 4. 인터페이스 목록

| API ID | 이름 | 유형 | 용도 | 호출 Module | Data | UI 사용 위치 | 상세 문서 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-101 | DB catalog / createdb CLI | CLI | calendarapp 존재 확인과 생성 | DatabaseBootstrap | DATA-101, DATA-102 | 없음 | 아래 상세 | Review |

조회 요청은 `psql -h 127.0.0.1 -p <port> -U postgres -d postgres -tAc <조회문>`이다. 반환값이 `1`이 아니면 `createdb -h 127.0.0.1 -p <port> -U postgres calendarapp`을 실행한다. 호출 timeout은 30초다. 생성 오류는 준비 실패로 전달하고 상위에서 시작한 DB를 정지한다. 요청·SQL은 [원본](../../postgresql/manage.mjs)을 따른다. [데이터](11_DataRequirements.md), [운영](../../Document/16_DeploymentOperationsRequirements/Domain/database.md).
