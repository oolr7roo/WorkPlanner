# API-204 PostgreSQL 프로세스 계약

## 1. 기본 정보

FR-011은 PostgresProcessManager가 OS PostgreSQL 도구를 소비하는 계약이다. DatabaseBootstrap의 DB 생성 계약과 구분한다. [상위 API](../12_APISpecification.md).

## 2. 엔드포인트 / 채널 / 메서드

Windows는 postgresql/runtime/bin/*.exe, macOS는 PG_BIN→Homebrew 후보→Postgres.app→PATH에서 명령을 해석한다. macOS에서 pg_ctl·initdb·psql·createdb 각각 --version을 검사한다. 명령별 후보 탐색이므로 모든 도구가 같은 설치 버전이라는 자동 보장은 없다.

## 3. 요청

macOS 최초 초기화는 data-macos의 PG_VERSION 존재 여부를 기준으로 한다. 비어 있지 않은 미완료 디렉터리는 오류로 보존한다. 필요 시 randomBytes(32)의 base64url 비밀 파일을 0600·wx로 만들고 initdb에 --auth-host/local=scram-sha-256, UTF8, locale C를 전달한다.

pg_ctl start는 -D 데이터 경로, -l 플랫폼 로그, -o '-h 127.0.0.1 -p <port>', -w를 사용한다. stop은 -m fast -w다. isRunning 상태 검사 timeout은 5초, 일반 실행은 30초다.

## 4. 응답

명령 성공은 exit 0이며 준비 완료 뒤 DatabaseBootstrap의 존재 확인·생성으로 이어진다. Windows 최초 클러스터 생성은 이 관리 코드에 구현되어 있지 않다.

## 5. 에러

외부 실행 중인 대상 클러스터를 발견하면 start를 거부한다. 준비 후 DB 생성 오류가 발생하면 실행된 DB를 정지한다. 비밀 파일 읽기·initdb·프로세스 오류는 예외로 반환한다.

## 6. 관련 데이터

DATA-203, DATA-204 및 Database의 DATA-102. 비밀 내용을 출력하지 않는다. [데이터](../11_DataRequirements.md), [원본](../../../postgresql/manage.mjs).

## 7. 확인 필요 사항

플랫폼별 도구 버전·권한·백업 복구·Windows 실행 확인은 필요하다. 파일 백업 존재가 자동 백업이나 복구 성공을 뜻하지 않는다.
