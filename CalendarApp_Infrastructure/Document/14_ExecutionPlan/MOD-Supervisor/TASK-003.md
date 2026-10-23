# TASK-003 공통 API 준비·서버 조립

## 책임

기존 startPostgres 뒤 공통 DB schema/전용 연결·API를 준비하고 Vite에 mount한다. shutdown은 HTTP/Vite→앱 pool→DB 순서다. 신규 설정/토큰 연결 파일과 서버 private path 차단을 포함한다. 기존 TASK-001/002 배치 책임은 유지한다.

## 경계와 순서

Write Set: server.mjs, runtime-config.mjs(필요 시), server/runtime.mjs, vite.config.ts, .gitignore. 공통 서비스·repository 공개 계약을 주입하며 업무 정책은 구현하지 않는다. 계약·필수 모듈 검증→조립→격리 start/stop/restart 및 readiness 실패 검증→통합, SEQUENTIAL/NONE. Node 22.18 이상. 원격 API/MCP는 범위 밖이며 loopback에서만 동작한다.

## 완료 기준

DB 준비 실패 시 ready를 내보내지 않고 자원을 회수한다. 서버/DB/런타임 파일 HTTP 노출을 차단한다. MCP 프로세스 종료가 서버/DB를 중지하지 않는다. 기존 운영 테이블/브라우저 원본은 보존한다.


## 실제 대조 결과

PostgreSQL 준비→migration·제한 앱 계정 pool→Vite/API→연결 파일 publish→제어 준비 순서로 조립했다. 종료는 Vite→pool·연결 파일→DB 순서다. API 준비 실패는 준비 완료로 표시하지 않는다. 운영 DB 백업 뒤 정상 stop/start와 기본 MCP context 준비를 확인했다. 격리 DB 중단·재시작에서 원본 보존과 재연결을 확인했다. .runtime 및 서버/DB/MCP/Document 변경은 Vite 화면 감시에서 제외한다. private 경로 차단·Host/Origin·앱 계정 DDL 거부를 실제 검증했다. Vite6.4.5 보안 수정과 Node>=22.18 전제는 package 계약에 반영했다. macOS·원격 연결은 검증하지 않았다.

## AI 초안 저장소 조립

server/runtime.mjs에서 002 migration으로 추가된 proposals 테이블의 SELECT/INSERT/UPDATE만 앱 역할에 부여한다. API·서비스 조립은 기존 공개 경계를 재사용하며 업무 정책을 추가하지 않는다. 운영 데이터 검증과 격리 기능 검증을 구분한다.
