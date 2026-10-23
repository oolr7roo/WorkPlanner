# Web 모듈 책임

관련 요구사항 FR-001~008. 상태 Review.

| 소유 모듈 | 파일 | 책임 |
| --- | --- | --- |
| App UI | src/App.tsx | 보기·기준 날짜·팝업 조합 |
| CalendarToolbar | src/components/CalendarToolbar.tsx | 다섯 보기·기간 탐색 |
| 트리 화면 | src/features/schedules/views/ 및 components/ScheduleTreeLabel.tsx, ScheduleDragHandle.tsx | 목록·간트·SDK 표시, 최소 들여쓰기·키보드 순서 이동 |
| EventManagement | src/features/schedules/useSchedules.ts, scheduleTree.ts, scheduleDates.ts, types.ts | 일정 CRUD, 형제 순서, 부모 기간, 계약 |
| 편집 UI | src/features/schedules/components/ScheduleEditor.tsx | 초안·검증 피드백·삭제 확인 |
| BrowserEventStore | src/features/schedules/scheduleStorage.ts | v1 호환·v2 저장·손상 원본 보존 |
| 트리 UI 상태 | src/features/schedules/useScheduleTree.ts | 표시 행·선택·접힘 상태 |

숫자 우선순위 대신 parentId/order로 형제 간 배치 순서를 사용한다. SCR-005는 접고 펴는 트리 목록이며 SCR-004도 같은 트리 순서와 접힘 상태를 공유한다. 들여쓰기는 단계당 8px, 최대 24px이다. 제목 클릭은 펼침·접힘, 별도 편집 버튼은 MOD-001을 연다. 부모 대표 기간은 하위 일정 범위이며 삭제 시 자식은 한 단계 위로 보존한다. 기존 v1 데이터는 변경하지 않고 v2로 변환한다.

UI는 localStorage에 직접 접근하지 않는다. 순수 트리·날짜 함수는 React·DOM에 의존하지 않는다. 저장 어댑터는 렌더링·일정 CRUD를 소유하지 않는다. 기존 trud-calendar는 월·주·일만 소유하며 외부 모듈을 수정하지 않는다.

화면 소유: [SCR-001 Task](14_ExecutionPlan/SCR-001/TASK-001.md). 업무 소유: [EventManagement Task](14_ExecutionPlan/MOD-EventManagement/TASK-001.md). 저장 소유: [BrowserEventStore Task](14_ExecutionPlan/MOD-BrowserEventStore/TASK-001.md).

## 단계별 색상 책임

| 소유 모듈 | 컴포넌트 | 책임 |
| --- | --- | --- |
| EventManagement | scheduleColors.ts | 프리셋 형식 검사·깊이별 표시색·부모와 색상 구분, DOM·React·저장소 의존 없음 |
| EventManagement | useScheduleColorSettings.ts | 설정 상태·저장 결과; BrowserEventStore 공개 함수 사용 |
| BrowserEventStore | scheduleColorStorage.ts | 별도 설정 키의 읽기·쓰기·손상 원본 보존 |
| 설정 UI | components/ScheduleColorSettings.tsx | 설정 초안·입력·미리보기·콜백; localStorage 직접 접근 금지 |

App은 설정·일정 Hook을 조합하고 헤더·팝업을 연결한다. 기존 useSchedules는 일정 모드 저장과 모든 보기에 전달할 표시 일정을 계산한다. 새 순수 색상 계산 모듈이 날짜 계산 모듈을 수정하지 않는다. 설정 UI는 SCR-001/TASK-003, 색상 정책·Hook은 MOD-EventManagement/TASK-003, 저장은 MOD-BrowserEventStore/TASK-001이 소유한다.


## 체크리스트·헤더 색상 책임

FR-014·015: MOD-EventManagement가 일정 초안·검증·저장 요청을 소유한다. ScheduleChecklist와 ScheduleColorControl은 입력/표시만 담당하고 localStorage를 참조하지 않는다. 순수 scheduleChecklist가 항목 형식·중복 id·공백 검사를 담당하며 BrowserEventStore는 레거시 호환 읽기와 접힘 쓰기만 소유한다. 공통 일정·설정 쓰기는 WorkspaceClient→ScheduleService가 담당한다. App은 checklist 초안 전달만 조립한다. 소유 Task는 MOD-EventManagement/TASK-001, 저장은 MOD-BrowserEventStore/TASK-001, App·스타일은 SCR-001/TASK-001, MOD-002 안내는 SCR-001/TASK-003이다.


## 색상 선택 UI 경계

FR-014의 colorValues는 HEX/RGB/HSV 변환만 소유한다. ScheduleColorPicker는 중첩 선택창 초안·입력을, ScheduleColorControl은 열기와 선택/기본값 콜백 연결을 담당한다. ScheduleEditor는 기존 onRestore에서 colorMode=auto를 반영한다. 설정 저장·단계별 계산·체크리스트·localStorage에는 새 책임을 추가하지 않는다. 소유는 MOD-EventManagement/TASK-001, 스타일 조립은 SCR-001/TASK-001이다.


- 색상창 기본값 구현·검증 완료(2026-10-23): [검증 기록](Evidence/ColorPickerDefault/README.md). RGB/HSV 변환과 UI 초안·일정 초안 책임을 분리했으며 기존 자동색상 설정과 저장 계약을 유지한다.


## 계획·작업 구분 책임

FR-016의 MOD-001 kind-field 입력·save는 EventManagement가 소유한다. scheduleKinds.ts는 구분 검증·기본값 및 작업 표시 목록/행을 만드는 순수 정책이다. BrowserEventStore는 해당 공개 검증 함수로 kind를 복원하며 UI에 의존하지 않는다. App은 전체 계산 결과와 작업 투영을 각 View에 전달하고 GanttView·CalendarView는 구분을 다시 판정하지 않는다. 전체 계층의 기간·색상 계산은 표시 투영보다 선행한다.


## 공통 저장·MCP 소유

공통 ScheduleService는 server/schedules/service.mjs이며 기존 DOM 없는 날짜·트리·색상·체크리스트 정책을 재사용한다. server/schedules/policy.mjs는 DTO 검증/정규화, database/repository.mjs는 DB 트랜잭션, server/http/api.mjs는 HTTP 경계, mcp/server.mjs는 공식 SDK 도구 어댑터다. useScheduleWorkspace는 API 상태/폴링·오류/버전만, 기존 useSchedules와 색상 Hook은 UI 표시·입력 조정만 맡는다. BrowserEventStore는 레거시 읽기·가져오기 및 접힘 상태를 유지한다. App은 조립만 소유한다.


| Module ID | 책임 | 공개 인터페이스 | 소유 Task |
| --- | --- | --- | --- |
| MOD-ScheduleService | 일정 업무 검증·명령 | read/query/command | MOD-ScheduleService/TASK-001 |
| MOD-WorkspaceClient | API snapshot·revision·polling·MOD-003 | refresh/command | MOD-WorkspaceClient/TASK-001 |
| MOD-MCP | 로컬 stdio 도구·리소스 | API-005 | MOD-MCP/TASK-001 |

## AI 일정 미리보기 책임

ScheduleProposalService(server/schedules/proposals.mjs)는 초안 수명·선택·검증 결과를, ScheduleService의 공유 buildScheduleTree 정책은 생성·계층·날짜 정규화를 소유한다. ScheduleRepository는 proposals와 workspace의 원자적 확정을 소유한다. WorkspaceClient의 useScheduleProposals와 ScheduleProposalDialog는 대기 조회·입력 보존·표시·사용자 확정을 담당한다. App은 대기 버튼과 팝업 조합만 담당한다. API-006/DATA-008/MOD-004의 연결을 따른다.
