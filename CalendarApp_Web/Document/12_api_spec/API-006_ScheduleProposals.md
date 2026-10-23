# API-006 AI 일정 등록 초안

## 목적과 범위

사용자 승인: AI 신규 일정의 등록 전 미리보기. FR-017·018 / UF-010 확장이다. 초안은 일정 집합과 별도 PostgreSQL 테이블에 보관한다. 기본 구분 plan, 표시 대상 task, 날짜·계층·색상·체크리스트는 기존 정책을 재사용한다.

## 책임과 경계

MCP는 propose_schedule_tree로 초안을 제출하고 get_schedule_proposal로 상태를 조회한다. create_schedule_tree는 MCP에서 제거한다. HTTP bearer의 createTree/import/applyProposal/reviewProposal/discardProposal은 거부한다. 웹의 동일 origin 요청만 편집·등록·폐기할 수 있다. API의 client 구분은 서버가 인증 결과로 판정하며 요청 본문의 값으로 바꾸지 않는다.

초안 UI는 입력·선택·미리보기를 소유한다. ProposalService는 수명·선택 계층·정규화를 소유한다. ScheduleService와 같은 생성 정책을 사용한다. repository만 SQL·잠금·요청 중복 방지·원자적 저장을 담당한다. runtime은 연결·새 테이블 권한만 조립한다.

## 상태와 데이터

pending → applied 또는 discarded. id, version, original, draft(nodes/selectedRefs), baseRevision, preview, result를 보관한다. original은 불변이다. 초안 편집은 초안 version만 증가하고 일정 revision은 유지한다. 검증된 미리보기는 확정 생성 ID·정규화된 입력·계산된 표시값을 포함한다. 초안은 서버 재시작·새로고침 뒤 조회할 수 있다.

하위 선택은 모든 신규 부모 선택을 요구한다. 부모 선택 해제는 UI에서 하위를 함께 해제한다. 최종 선택이 비면 등록할 수 없다. 날짜·이름 오류는 초안을 유지하고 등록을 차단한다. 사용자 수정 뒤 서버 검증 응답이 도착해야 등록 버튼이 활성화된다.

## 연산 계약

- listProposals/getProposal: 대기 목록 또는 특정 초안·상태 조회. 상세 조회에는 workspace revision과 시간대가 포함된다.
- proposeTree: nodes(1~500), expectedRevision, requestId. 원본을 보관하고 전체 선택 초안을 만든다. 일정은 생성하지 않는다.
- reviewProposal: id/version/nodes/selectedRefs, expectedRevision/requestId. 최신 상태에서 검증한 표시 미리보기를 저장하고 version을 증가시킨다.
- applyProposal: id/version, expectedRevision/requestId. DB에서 고정된 미리보기를 읽고 version·baseRevision을 검사한다. 선택 일정 생성과 applied 기록, 요청 결과는 한 트랜잭션이다. 실패는 전체 rollback이다.
- discardProposal: id/version, expectedRevision/requestId. 일정은 바꾸지 않고 discarded로 전환한다.

requestId는 본문이 같은 응답 누락 재시도에 재사용한다. 다른 본문 재사용·오래된 일정 revision·오래된 초안 version·완료된 초안 변경은 409다. 충돌 시 UI 편집본을 보존하고 최신 버전으로 다시 미리보기를 만든 후 사용자가 등록한다. 새 초안과 새로고침은 대기 표시만 갱신하고 열린 입력을 초기화하거나 자동 팝업하지 않는다.

## 화면

신규 MOD-004. COMMON-001의 AI 등록 대기 버튼에서 목록과 상세를 연다. 계획/작업·선택 수, 트리 제목·구분·날짜·색상·체크리스트와 작업 표시 여부를 보여 준다. 나중에/초안 폐기/미리보기 갱신/선택 항목 등록을 구분한다. 긴 목록은 본문 스크롤, 제목과 동작은 접근 가능하게 유지한다.

## 완료 기준

격리 DB·실제 MCP SDK·브라우저에서 제출 후 일정 미생성, 선택·편집 일치, 트리·색상·체크리스트, 폐기·나중에·재접속 복원, 오래된 버전 거절, 동일 요청 중복 방지, 부분 생성 rollback, bearer 확정·우회 생성 거부를 확인한다. TypeScript/Vite 빌드·변경 스크립트 문법·JSON validator와 PC/모바일 DOM을 확인한다. 운영 일정은 검증용으로 변경하지 않는다. 신규 단위 테스트 파일은 추가하지 않고 격리 검증 기록을 남긴다.
