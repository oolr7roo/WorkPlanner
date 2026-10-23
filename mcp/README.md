# WorkPlanner MCP 연결

Node.js 22.18 이상과 설치된 프로젝트 의존성이 필요하다. WorkPlannerStart.bat로 앱을 먼저 실행한다. 웹과 AI는 같은 PostgreSQL 일정·색상 설정을 사용한다.

## 연결 설정

MCP 클라이언트의 stdio 서버 설정에 아래 항목을 추가한다. 예제 파일은 config.example.json이다. Node 실행 경로를 고정해야 하는 클라이언트에서는 command를 해당 node.exe 절대 경로로 바꾼다.

```json
{
  "mcpServers": {
    "workplanner": {
      "command": "node",
      "args": ["C:/WorkPlanner/mcp/server.mjs"]
    }
  }
}
```

전역 클라이언트 설정은 자동 변경하지 않는다. 서버를 등록한 뒤 클라이언트에서 다시 연결하면 9개 도구와 workplanner://context 리소스가 제공된다. npm run mcp도 실행 가능하지만 프로토콜 프로세스는 위 Node 명령으로 직접 시작한다.

## 사용 순서

1. workspace_context로 현재 시각·Asia/Seoul 시간대·revision·색상 설정을 확인한다.
2. list_schedules 또는 get_schedule로 수정할 일정을 식별한다.
3. 신규 등록 제안은 propose_schedule_tree, 초안 상태 조회는 get_schedule_proposal, 수정은 update_schedule, 계층·순서는 move_schedule, 삭제는 delete_schedule, 색상 설정은 set_color_settings를 사용한다.
4. 모든 쓰기에 조회한 expectedRevision과 새로운 requestId(UUID 권장)를 전달한다. 응답을 받지 못한 재시도에서는 같은 ID와 같은 내용을 재사용한다. 충돌은 최신 조회 후 내용을 다시 결정하고 새 ID로 제출한다.

예: “출시 계획 아래 디자인·개발·검증 작업을 만들어 줘.” 신규 구분은 plan이다. 달력·간트에 표시할 일정에는 task를 명시한다. 하위 제안은 부모를 앞에 나열하고 parentRef를 사용하며, 초안 제출 시에는 일정이 생성되지 않는다. 사용자가 웹에서 확인·확정한 선택 항목 전체가 원자적으로 저장된다. 기간은 현지 YYYY-MM-DDTHH:mm:ss 또는 offset을 명시한 ISO 문자열이다. 상위 기간은 하위에서 계산한다. 삭제는 해당 일정 하나만 제거하며 자식은 한 단계 승격한다. 체크리스트 교체에는 각 항목의 id/text/done을 전달한다.

## 데이터 이전과 운영

기존 브라우저 일정은 자동 업로드하지 않는다. 웹의 “기존 일정 가져오기”에서 미리보기 후 적용한다. 색상 설정 교체는 별도 체크하며 브라우저 원본은 지우지 않는다. 동일 ID·동일 내용은 건너뛰고 다른 내용의 ID 충돌은 전체 취소한다. 원본을 다시 가져오기 전에 이미 수정한 공통 일정을 확인한다.

첫 버전 API는 로컬 주소만 허용한다. 원격 URL에서의 공통 저장소 접근과 사용자별 인증은 별도 범위다. MCP 프로세스는 서버 시작·종료나 DB 파일 접근을 하지 않는다. 앱 재시작 뒤에는 최신 연결 파일을 매 요청 다시 읽는다.

.runtime/mcp-connection.json에는 로컬 연결 토큰, .runtime/app-db-password에는 앱 DB 계정 자격 정보가 있으므로 Git·공유 대상에서 제외한다. 이 디렉터리의 자격 파일을 지우면 기존 DB 역할과 연결할 수 없으므로 DB 백업과 함께 안전하게 보관한다. 임의 자격 자동 재설정은 하지 않는다. PostgreSQL 백업은 workspace·requests·proposals 세 테이블을 함께 포함한다. 요청 재시도 기록은 초기 버전에서 자동 만료하지 않으므로 데이터 크기를 운영 중 점검한다.

WORKPLANNER_TIME_ZONE(기본 Asia/Seoul)은 초기 구축 시 설정하고 기존 데이터가 있는 서버에서 임의 변경하지 않는다. WORKPLANNER_DATABASE_URL, WORKPLANNER_RUNTIME_DIR, WORKPLANNER_ADMIN_PASSWORD_FILE, WORKPLANNER_CONNECTION_FILE은 격리 검증·운영 구성을 위한 선택 값이며 비밀 값을 출력하지 않는다.

공통 계약: [웹 API](../CalendarApp_Web/Document/12_APISpecification.md). 실제 검증: [보고서](../Document/Evidence/McpWorkspace/README.md).

## AI 신규 등록 미리보기 (1.1)

create_schedule_tree는 제거되었다. 클라이언트에서 MCP를 다시 연결해 9개 도구 목록을 갱신한다. workspace_context와 기존 일정을 조회한 뒤 propose_schedule_tree(nodes, expectedRevision, requestId)로 초안을 제출한다. 응답의 proposal.id/status를 안내하고 사용자가 WorkPlanner의 ‘AI 등록 대기’에서 확인·수정·선택·등록하도록 한다. get_schedule_proposal(id)의 pending은 등록 대기, applied는 등록 완료, discarded는 폐기다. 적용된 결과의 result.created로 생성 ID를 조회한다. 제안 제출을 일정 등록 완료로 보고하지 않는다.

신규 초안 최대100개, 초안당1~500개 항목이다. 원본 제안과 편집본·확정 미리보기를 별도 보관한다. 초안 편집은 일정 revision과 분리된 version을 갱신한다. 웹 등록은 최종 확인한 버전으로 트리 전체를 원자적으로 생성한다. bearer의 createTree/import/reviewProposal/applyProposal/discardProposal은 거부한다. 기존 update/move/delete/settings의 동작과 재시도 계약은 유지한다.

일정·설정이 바뀌면 초안을 보존하고 최신 미리보기를 다시 확인한다. 제목·날짜·색상·체크리스트·선택을 수정한 뒤에는 미리보기 갱신이 필요하다. 하위 선택은 상위를 포함하며 상위 제외 시 하위도 제외한다. 서버 재시작 후에도 대기 초안을 조회할 수 있다. 백업에는 workspace/requests와 함께 proposals 테이블도 포함한다.
