# CalendarApp Web 인터페이스

## 1. 범위와 공통 규칙

웹과 MCP는 동일한 공통 일정 서비스 API를 호출한다. PostgreSQL 접근은 repository만 소유한다. 신규 일정 기본 구분은 plan, 레거시 kind 부재는 task다. 현지 날짜는 Asia/Seoul 기준 YYYY-MM-DDTHH:mm:ss이며 명시적 offset 입력은 서버 시간대로 변환한다. offset ISO의 소수 초는 초 단위로 정규화한다. UI 변환·기간 보정은 초안 책임이고 최종 검증은 서비스 책임이다.

## 2. 인터페이스 목록

| API ID | 이름 | 호출 Module | Data | UI 사용 위치 | 상태 |
| --- | --- | --- | --- | --- | --- |
| API-001 | localStorage 레거시 읽기·접힘 보존 | BrowserEventStore | DATA-001/003/004 | MOD-003·COMMON-003 | Review |
| API-002 | crypto.randomUUID | WorkspaceClient·Editor | DATA-005/006 | MOD-001·MOD-002 | Review |
| API-003 | Calendar SDK props·콜백 | App UI | DATA-001/002 | SCR-001~003·COMMON-002 | Review |
| API-004 | /api/workplanner GET·POST | WorkspaceClient·MCP | DATA-006/007 | COMMON-001/003·MOD-001~003 | Review |
| API-005 | local stdio MCP | MCP client | DATA-006 | AI 도구·리소스 | Review |

API-001은 기존 브라우저 원본의 명시적 가져오기 입력이며 일정·색상 자동 쓰기를 하지 않는다. 접힘은 같은 브라우저에만 보존한다. API-002는 요청·체크리스트·프리셋 ID 생성용이며 일정 ID는 서버가 생성한다. API-003의 외부 SDK 계약은 [상세](12_api_spec/API-003_CalendarSDK.md)를 유지한다.

## 3. API-004 계약

GET은 {revision,items,settings,timeZone} snapshot을 반환한다. POST body는 {operation,args,expectedRevision?,requestId?}. context/list/get/previewImport는 조회이며 {revision,timeZone,result}를 반환한다. createTree/update/move/delete/settings/import는 쓰기이며 expectedRevision과 8~128자 영숫자·하이픈·밑줄 requestId가 필수다. 성공은 {revision,items,settings,timeZone,result}다. JSON 요청 상한은 2MiB다.

| operation | args | result |
| --- | --- | --- |
| context | {} | 현재 시각·시간대·기본 구분·색상·개수·재시도 규칙 |
| list | query?,kind?:all/plan/task,parentId?,start?,end?,offset?:0,limit?:100 | 표시 기간·색상이 계산된 items,total,offset,limit; limit 최대500 |
| get | id | schedule,stored,ancestry,children |
| previewImport | items,includeSettings?:false,settings? | added,skipped,total,settingsChanged; 변경 없음 |
| createTree | nodes:[{ref,parentRef? 또는 parentId?,title,start?,end?,kind?,colorMode?,color?,checklist?,allDay?}] | created:{ref:generatedId}; 부모 먼저, 루트 기간 필수, 최대500 |
| update | id,patch,childCompletions? | id; 직계 하위 일정 완료 변경을 같은 저장에서 반영, 계층·순서는 수정 불가, 상위 기간 직접 변경 거부 |
| move | id,parentId:null 또는 ID,beforeId? | id,parentId; 순환 거부 |
| delete | id | deletedId,childrenPreserved:true; 자식 승격 |
| settings | settings | settingsSaved:true; 자동 색상만 재계산 |
| import | previewImport와 같은 args | 미리보기와 같은 결과; 전체 성공 또는 취소 |

수동 체크리스트는 [{id,text,done}] 전체 교체이며 빈 배열은 비움이다. 일정 자체의 완료 상태는 patch.completed(boolean)로 변경하며 저장값이 없으면 미완료로 해석한다. childCompletions의 각 항목은 {id,completed}이고 id는 수정 대상의 직계 자식이어야 하며 중복할 수 없다. 부모와 지정한 자식의 변경은 동일한 revision 검사와 트랜잭션으로 적용된다. 부모 화면에 보이는 하위 일정 체크 항목은 자식 일정의 완료 상태를 읽어 구성한다. 일정 최대10000개·계층100단계·일정당 항목500개, 프리셋/단계 각각100개를 검증한다. 데이터베이스 workspace 행 잠금과 revision 검사를 같은 transaction에서 수행하고 응답·요청 fingerprint를 requests에 함께 보존한다. 동일 요청 ID·동일 본문은 원래 응답을 반환하고 다른 본문 재사용은 거부한다.

오류 응답은 {error:{code,message}}다. 입력400, 인증401, Origin/Host403, 대상404, 메서드405, 충돌409, 상한413, JSON Content-Type415, 저장소503을 구분한다. REVISION_CONFLICT는 초안을 유지하고 최신 내용을 확인한 뒤 재편집한다. 네트워크 응답 유실 재시도는 같은 ID·본문을 사용한다. 화면은 5초 polling·focus·저장 응답으로 갱신하고 열린 초안의 revision은 고정한다.

## 4. 인증·API-005

loopback Host만 허용한다. 웹은 같은 origin, X-Workplanner-Client:web header와 POST Origin 검사를 사용한다. MCP는 .runtime/mcp-connection.json의 실행별 bearer token을 사용한다. CORS·외부 Origin·DB/서버/런타임 파일 노출을 거부한다. 첫 버전 원격 접속·다중 사용자 인증은 범위 밖이다.

API-005는 공식 SDK의 stdio 서버다. workspace_context, list_schedules, get_schedule, propose_schedule_tree, get_schedule_proposal, update_schedule, move_schedule, delete_schedule, set_color_settings 9개 도구와 workplanner://context 리소스를 제공한다. 쓰기는 API-004 계약을 따르고 오류는 isError와 구조화 코드·메시지로 반환한다. MCP는 DB·React·localStorage·서버 제어에 직접 접근하지 않는다. [연결 안내](../../mcp/README.md), [데이터](11_DataRequirements.md), [모듈](10_ModuleMapping.md).

## API-006 AI 신규 등록 미리보기

[AI 초안 계약](12_api_spec/API-006_ScheduleProposals.md). MCP 신규 생성은 propose_schedule_tree로 pending 초안을 제출하고 get_schedule_proposal로 결과를 조회한다. create_schedule_tree는 제거되어 MCP 재연결이 필요하다. 총9개 도구이며 다른 기존 도구는 유지한다. 웹은 listProposals/getProposal/reviewProposal/applyProposal/discardProposal을 사용한다. 미리보기·확정 버전과 재시도 계약은 API-006을 따른다.
