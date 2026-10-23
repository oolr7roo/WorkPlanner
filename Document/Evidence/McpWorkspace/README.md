# 공통 저장소·MCP 검증 기록

2026-10-23 Windows, Node24.12.0, PostgreSQL17.11, 공식 MCP SDK1.32.1, React19, Vite6.4.5. 운영과 분리된 .runtime/verify-db(55440)·웹5179에서 검증했다. 비밀·DB 파일·임시 검증 실행 파일은 Git에 포함하지 않는다.

## 책임·변경 경계

repository는 workplanner 스키마와 transaction, service는 업무 검증, HTTP는 인증·전송, MCP는 stdio 도구, Web client는 snapshot·revision·polling, UI는 초안을 소유한다. App·supervisor는 공개 모듈 조립만 담당한다. 기존 브라우저 원본·운영 사용자 데이터·외부 SDK source는 읽기 전용이다. 운영 DB는 적용 전 .runtime/backups/calendarapp-before-mcp.dump로 백업했다.

## 실제 결과

- 공식 SDK Client/stdio transport로 도구8개·context resource를 발견하고 실제 호출했다.
- 신규 plan/auto, 명시적 task, offset·소수 초 ISO→Asia/Seoul 초 단위 정규화, 부모 먼저 원자적 일괄 생성·참조 ID 결과를 확인했다.
- 동일 요청 재시도는 원래 revision/결과를 반환하고 다른 본문 ID 재사용·과거 revision은409로 거부했다. 실제 동시 요청2개 중1개만 성공했다.
- 잘못된 하위 참조의 일괄 생성은 전체 rollback하며 revision도 유지했다. 순환 이동·존재하지 않는 날짜·잘못된 입력을 거부했다.
- 검색·페이지 크기·수정·계층/순서 이동·부모 삭제 뒤 자식 승격·수동 색상 유지·설정 변경을 확인했다.
- 인증 없는401, 외부 Origin/Host403, DB/런타임/server/database/MCP source404를 확인했다. 앱 전용 DB 계정의 DDL은42501로 거부했다.
- MCP 일정→웹 제목·체크리스트 수정→MCP get 재조회가 일치했다. 열린 초안 뒤 다른 저장을 넣고 웹 저장하면 충돌 안내와 입력 초안 유지가 관찰됐다.
- 기존 브라우저5개와 색상 설정을 미리보기 뒤 가져왔고 동일5개 skip·기존 계층·plan/task를 확인했다. 다른 내용의 동일 ID는 전체 거부했다. 브라우저 원본은 삭제/자동 쓰지 않았다.
- 웹 색상 프리셋 이름 저장 뒤 MCP context와 일치했다. 1440×1000·390×844에서 가져오기·설정·편집 표시를 확인했고 모바일 버튼 줄바꿈을 보완했다.
- DB 중단 시 기존 표시 snapshot을 유지하며 변경을 차단하고 재연결 안내를 표시했다. idle pool 오류를 코드만 기록하도록 처리한 최신 서버는 종료되지 않았으며 DB 재시작 뒤 revision12·일정7개와 웹 수정 내용을 재조회했다.
- 실제 서버의 추가 거부 요청 검증: 2MiB 초과413, 손상 JSON400, 숫자 requestId400, 잘못된 Content-Type415. 해당 요청 뒤 운영 revision0·일정0을 유지했다.
- npm run build 성공, npm audit 취약점0개. 기존 Vite6.4.3을 같은 메이저 보안 수정6.4.5로 갱신했다.
- 전체11개 Wireframe의 schema/source alignment/render contract와 Python 사전 검증을 통과했다. 실제 화면 실측은 별도 JSON·PNG로 보존했다.

## 대조·리스크

FR-017~019, Web DATA-006/007·API-004/005, DB DATA-103/104·API-102, 신규4개 모듈 Task 및 supervisor Task003과 구현을 대조했다. 날짜·계층·색상·체크리스트 순수 정책을 재사용한다. 실패·충돌을 localStorage 자동 저장으로 우회하지 않는다. 작업 전부터 있던 dist/index.html·postgresql/supervisor.log와 생성 의존성 변경은 선택 커밋에서 제외한다.

첫 버전은 로컬 개인 workspace와 stdio다. 외부 URL·원격 MCP·사용자별 인증·macOS·전체 접근성/성능 인증은 미검증/범위 밖이다. 공용 WireFrame renderer의 전체 시각 reconciliation과 UI 참조 문서 실제 열기는 미검증이므로 verification.complete:false와 Review를 유지한다. 이 제한을 앱 기능·실제 MCP 통합 검증 결과와 구분한다. 요청 기록 자동 만료·압축은 없으므로 데이터 크기를 점검한다.

연결 방법: [MCP 안내](../../../mcp/README.md). 새 서버는 기본 파일 연결로 읽기 준비를 확인했다. 운영 브라우저의 레거시 이전은 사용자가 “기존 일정 가져오기”에서 미리보기 후 적용한다.
