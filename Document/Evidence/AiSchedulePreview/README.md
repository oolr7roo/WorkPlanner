# AI 일정 등록 미리보기 검증

2026-10-23 Windows / Node24.12 / PostgreSQL17 / 공식 MCP SDK / React19 / Edge. 운영과 분리된 PostgreSQL55439·웹5179에서 수행했다. 검증용 DB·연결 토큰·임시 실행 파일은 Git에 포함하지 않는다.

## 구현과 책임

MCP의 propose_schedule_tree는 pending 초안만 제출하고 get_schedule_proposal로 상태를 조회한다. 기존 create_schedule_tree는 제거되어 총9개 도구다. ProposalService가 초안 수명·선택·검증을, 공통 buildScheduleTree가 생성 모델을, repository가 transaction·중복 방지·일정/초안 원자성을 소유한다. UI는 입력·확인·웹 확정만 수행하고 App은 조합만 담당한다. 원본과 편집본·확정 미리보기를 별도로 보존한다.

## 실제 검증

- [MCP·DB 결과](backend.json): 9개 도구 확인, 제출 후 일정 미생성, 동일 제출 재시도, 다른 본문 ID 재사용 거부, 잘못된 계층/선택 rollback, 원본 보존·부모 기간 재계산, 초안·일정 버전 충돌, 실제 SQL 오류 전체 rollback, 동시 등록1회, 폐기 시 일정 불변.
- [브라우저 결과](browser.json): 대기 표시와 수동 열기, 부모/하위 선택, 제목·기간 편집, 서버 재검증, 나중에·새로고침 복원, 실제 동시 변경 충돌과 입력 보존, 390×844 버튼 접근, 선택 항목 등록과 동일 요청 재시도.
- [추가 실제 결과](extra.json): API 서버 재시작 뒤 복원, 항목별 오류·입력 보존, 중첩 색상창 Escape, 수동 색상·기본값 복귀·체크리스트 수정/완료, 25개 긴 목록의 독립 스크롤·모바일 버튼 노출·고유 ID·키보드 포커스, 등록 성공 응답 유실 후 상태 조회 복구.
- bearer 인증으로 createTree/import/reviewProposal/applyProposal/discardProposal을 호출하면403이며 웹 확정으로 우회하지 않았다.
- TypeScript/Vite 빌드, 변경 mjs 문법·UTF-8·줄끝 검증을 수행한다. 12개 WireFrame의 schema/source alignment/render contract는 오류·경고0건이다. 실제 앱 DOM·PC/모바일 캡처를 별도 확인했다.

## 문서 대조

FR-018/UF-010, Web API-006/DATA-008/MOD-004, MCP·ScheduleService·WorkspaceClient·Repository·App·Supervisor 소유 Task를 대조했다. 선택·기간·색상·체크리스트와 최종 생성 ID가 서버 검증 미리보기와 일치했다. 폴링은 열린 입력을 덮지 않으며, 초안 version은 일정 revision과 별개다. 코드와 계약의 필수 기능 차이를 해소했다.

[운영 적용 결과](deployment.json): 사용자 승인 후 웹5173·PostgreSQL55432를 재시작하고 proposals 테이블과 앱 권한을 적용했다. 백업을 보존했으며 적용 전후 일정·설정·revision의 fingerprint가 일치했다. 운영 MCP9개 도구와 초안 조회가 정상 응답했다. 공용 WireFrame renderer의 전체 시각 reconciliation·참조 문서 열기, macOS·원격 접속·전체 접근성 인증은 미검증이다. 이 한계는 검증한 앱 기능·DOM·MCP·DB 결과와 구분한다. 초안/요청 기록의 자동 만료·압축은 이번 범위에 없다.

## 캡처

[PC 기본](desktop.png) · [PC 편집](desktop-edit.png) · [모바일](mobile.png) · [모바일 긴 목록](mobile-long.png) · [정본 실측](geometry.json)
