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
