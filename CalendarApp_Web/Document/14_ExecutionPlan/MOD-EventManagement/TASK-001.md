# TASK-001 일정 트리 업무·편집 구현

상태: Review. 사용자 승인: 2026-10-21 대화의 계획대로 구현 요청. 관련 요구사항 FR-001~008.

## 소유 범위

src/features/schedules/types.ts, src/features/schedules/useSchedules.ts, src/features/schedules/scheduleTree.ts, src/features/schedules/scheduleDates.ts, src/features/schedules/components/ScheduleEditor.tsx

MOD-001, DATA-001~003. 숫자 우선순위는 제거하고 parentId/order로 형제 간 순서를 저장한다. 부모 이동 시 자식을 유지하며 순환을 거부한다. 부모 삭제 시 직계 자식을 한 단계 올려 보존한다. 부모 대표 기간은 자식 범위로 계산한다. 리프만 날짜를 직접 수정한다. 기존 일정 수정에서 시작이 현재 종료와 같거나 뒤로 이동하면 변경 직전 초안의 유효한 기간을 유지해 종료도 이동한다. 새 일정 생성·종료 직접 변경은 이 보정 대상이 아니며, 빈 입력·유효하지 않은 기간은 추정하지 않는다. 보정은 메모리 초안에만 적용하고 저장·취소 경계를 유지한다.

## 실행과 책임 경계

문서 기준 확정 → 구현 → 빌드·격리 브라우저 검증 → 계약 대조 → 차이 해소. 순차 실행한다. UI는 저장소에 직접 접근하지 않으며 업무 함수는 DOM에 의존하지 않는다. scheduleDates.ts의 순수 함수가 시작 변경에 따른 종료를 계산하고 ScheduleEditor.tsx는 기존 일정 수정 입력에만 함수를 적용한다. useSchedules.ts의 저장 단계 검증과 부모 기간 계산은 그대로 유지한다. App은 조합만 소유한다. 다른 Task 소유 파일을 중복 소유하지 않는다.

## 시작·종료 자동 보정의 변경 경계

- 구현 수정: src/features/schedules/scheduleDates.ts, src/features/schedules/components/ScheduleEditor.tsx.
- 문서 수정: 이 Task와 대응 .meta.json, CalendarApp_Web/Document/13_UIUXRequirements.md와 대응 .meta.json, CalendarApp_Web/Document/09_WireframeMockup/MOD-001.json의 start-field-input·end-field-input 동작 의도와 네 날짜 입력 요소의 source_ref.
- 참조 원본: src/App.tsx, src/features/schedules/useSchedules.ts, src/features/schedules/scheduleStorage.ts, src/styles.css, 10·11·12번 계약.
- 확인만: 최상위 14_ExecutionPlan.md와 MOD-EventManagement.md(기존 Task 내부 책임·파일 범위 내 변경), 배치·스타일·binding ID·조회 매핑.
- 변경 금지: 운영 origin 저장 데이터, DB·서버·외부 패키지, 다른 화면의 구조·좌표·스타일.
- 리스크: 날짜는 offset 없는 현지 문자열로 유지하며 UTC ISO 직렬화를 사용하지 않는다. 기간은 변경 직전 초안의 양수 경과 시간이다. 시간대 식별자를 저장하지 않는 기존 현지 날짜 모델을 유지한다. 빈 값·파싱 불가·기존 기간 0 이하이면 종료를 바꾸지 않고 저장 검증을 유지한다.
- 검증 예정: 종료 이전·동일·이후, 자정·월말·연말·여러 날·연속 변경, 빈 값·잘못된 기간, 종료 직접 변경, 부모 입력 제한, 신규 일정 회귀, 저장·취소·재열기. 빌드·JSON 검사와 격리 origin 브라우저에서 확인한다. 신규 테스트 파일은 작성하지 않는다.

## 검증과 리스크

기존 일정 보존, 형제 재정렬·접기·편집, 부모 기간, 보기 전환과 날짜 유지, 간트 잘림·고정 열, 키보드 조작을 확인한다. 운영 origin·DB·서버·외부 모듈은 수정하지 않는다. 적용 가능한 구현 템플릿 없음(Web 등록 원본 누락); 기존 React/TypeScript 구조를 따른다. Git은 첫 커밋이 없는 상태로 시작했고 작업 브랜치만 생성했다.

## 참조

[상위 계획](../MOD-EventManagement.md), [모듈 책임](../../10_ModuleMapping.md), [데이터](../../11_DataRequirements.md), [인터페이스](../../12_APISpecification.md).

## 시작·종료 자동 보정 검증 결과 (2026-10-22)

- 구현: adjustEndForStartChange는 입력 문자열만 받아 종료 문자열을 반환한다. React·DOM·저장소에 의존하지 않는다. ScheduleEditor는 기존 수정 리프 일정의 시작 입력에만 적용하며 함수형 상태 갱신으로 직전 초안을 사용한다.
- 실제 검증: 날짜 계산 13개 경계 사례, TypeScript·Vite 빌드, 격리 origin 127.0.0.1:5174에서 날짜 이동·기간 보존·종료 유지·직접 종료 변경·연속 변경·저장 후 재열기·취소 후 원본 보존·빈 입력·기간 오류·신규 생성·부모 입력 제한 통과.
- 문서 대조: MOD-001의 네 시작·종료 요소 source_ref를 실제 편집 컴포넌트에 연결하고 두 입력의 intent를 동기화했다. component ID·계층·좌표·style·binding ID는 보존했다. 소유 Task와 UIUX 기준을 현재 동작에 맞췄으며 2단계·최상위 계획은 유지했다.
- JSON 구조·source alignment·render contract 검증 통과. 기존 전체 WireFrame 시각 reconciliation과 전체 제품 QA·모바일 단말 검증은 이번 범위 밖이며 미검증 상태를 유지한다.
- 운영 origin·DB는 사용하지 않았다. 기존 저장 검증·저장소·App 조합·스타일 source 해시 보존을 확인한다. 현지 날짜 모델에는 시간대 식별자가 없으며 UTC 직렬화나 새 시간대 정책을 추가하지 않았다.

| 단계 | 문서 기준 | 실제 결과 | 판정 |
| --- | --- | --- | --- |
| 계산 | 위 시작·종료 보정 조건 | 순수 함수 경계값 13개 직접 실행 | 일치 |
| 편집 | 기존 일정·리프·초안 한정 | 실제 입력·취소·저장·부모·신규 확인 | 일치 |
| 문서 | UIUX·MOD-001·소유 Task | 동작 의도·실제 소스 경로 동기화, 배치·binding 유지 | 일치 |
| 전체 화면 렌더 | 이번 동작 변경 범위 밖 | 기존 전체 시각 reconciliation 미실행 | 해당 없음 |

증거: [보정 화면](../../Evidence/StartEndAdjustment/editor.png), [검증 결과](../../Evidence/StartEndAdjustment/verification.json).

## 2026-10-21 검증 결과

- TypeScript 검사와 Vite production build 통과.
- 격리 origin http://127.0.0.1:5174에서 하위·다단계 일정 추가, 부모 기간 자동 계산, 제목 접기·펼치기, 목록·간트 접힘 공유, 드래그·키보드 순서 변경, 부모 삭제 후 자식 승격, 새로고침 후 복원, 월·주·일 탐색과 간트 날짜 전달을 확인했다. 운영 origin 데이터는 변경하지 않았다.
- 순수 모듈 실행으로 형제 이동·다른 부모 드롭 거부·자식 보존·기간 잘림·v1 원본 보존 변환·손상/순환/중복 데이터 거부를 확인했다.
- 화면 결합 도구로 SCR-004·005의 공통 정의와 부모 참조 검증 통과.
- 확인 범위 밖: 실제 모바일 터치 드래그, 전체 접근성 감사, 운영 배포, 다중 탭 동시 편집. 상태 Review는 이 한계를 표시한다.
- Git: 시작부터 HEAD와 커밋된 기준 브랜치가 없다. start-check/finish-check는 HEAD 부재로 실패했지만 codex/schedule-tree-gantt 브랜치 생성은 성공했다. 기존 미추적 프로젝트 전체를 임의로 초기 커밋하지 않고 Git 미반영 상태로 보존한다.
- AISkill MCP branches는 등록 Web 원본 부재로 재시도 실패했다. CLI도 Web 원본이 없어 coding-work만 전달받고 안전 편집 원문을 MCP로 직접 읽었다. safe-editing은 로컬 카탈로그에 미등록이다. 개선 Reporter 도구가 없어 오류를 영구 등록하지 못했다.

증거: [트리 목록](../../Evidence/TreeSchedules/priority.png), [간트](../../Evidence/TreeSchedules/gantt.png).

## 단계별 색상 연결 기준

추가 수정 파일: types.ts, useSchedules.ts, components/ScheduleEditor.tsx. 신규 일정 auto·기존 mode 부재 manual, 자동/직접 초안 선택, 전체 보기 전달 표시색을 소유한다. 색상 계산은 TASK-003 공개 함수를 호출한다. 시작·종료 보정과 날짜 계산 source는 보존한다.


2026-10-22 범위 검증: 정책·저장 경계 26건, 격리 브라우저의 프리셋 저장/취소/복원·다섯 보기·신규/하위·직접 색상 보존·자식 승격·모바일·날짜 보정 회귀 확인. [검증 근거](../../Evidence/ColorPresets/README.md). 저장 실패 UI 전체 경로와 공용 renderer 충실도는 미검증이며 Review를 유지한다.
