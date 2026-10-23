# TASK-001 일정 트리 업무·편집 구현

상태: Review. 사용자 승인: 2026-10-21 대화의 계획대로 구현 요청. 관련 요구사항 FR-001~008.

## 계획·작업 구현 범위

현재 Write Set: src/features/schedules/types.ts, scheduleKinds.ts, useSchedules.ts, components/ScheduleEditor.tsx, MOD-001.json의 kind-field·kind-field-input. 순수 함수는 kind 검증·부재 기본값·표시 투영, 편집기는 초안, Hook은 공통 API 요청을 담당하고 최종 저장 검증은 ScheduleService가 소유한다. 기존 색상·날짜·체크리스트 책임은 유지한다.

## 소유 범위

src/features/schedules/types.ts, src/features/schedules/scheduleTree.ts, src/features/schedules/scheduleDates.ts, src/features/schedules/components/ScheduleEditor.tsx

MOD-001, DATA-001~003. 숫자 우선순위는 제거하고 parentId/order로 형제 간 순서를 저장한다. 부모 이동 시 자식을 유지하며 순환을 거부한다. 부모 삭제 시 직계 자식을 한 단계 올려 보존한다. 부모 대표 기간은 자식 범위로 계산한다. 리프만 날짜를 직접 수정한다. 기존 일정 수정에서 시작이 현재 종료와 같거나 뒤로 이동하면 변경 직전 초안의 유효한 기간을 유지해 종료도 이동한다. 새 일정 생성·종료 직접 변경은 이 보정 대상이 아니며, 빈 입력·유효하지 않은 기간은 추정하지 않는다. 보정은 메모리 초안에만 적용하고 저장·취소 경계를 유지한다.

## 실행과 책임 경계

문서 기준 확정 → 구현 → 빌드·격리 브라우저 검증 → 계약 대조 → 차이 해소. 순차 실행한다. UI는 저장소에 직접 접근하지 않으며 업무 함수는 DOM에 의존하지 않는다. scheduleDates.ts의 순수 함수가 시작 변경에 따른 종료를 계산하고 ScheduleEditor.tsx는 기존 일정 수정 입력에만 함수를 적용한다. 저장 단계 검증은 ScheduleService, 부모 기간 순수 계산은 scheduleDates.ts가 소유한다. App은 조합만 소유한다. 다른 Task 소유 파일을 중복 소유하지 않는다.

## 시작·종료 자동 보정의 변경 경계

- 구현 수정: src/features/schedules/scheduleDates.ts, src/features/schedules/components/ScheduleEditor.tsx.
- 문서 수정: 이 Task와 대응 .meta.json, CalendarApp_Web/Document/13_UIUXRequirements.md와 대응 .meta.json, CalendarApp_Web/Document/09_WireframeMockup/MOD-001.json의 start-field-input·end-field-input 동작 의도와 네 날짜 입력 요소의 source_ref.
- 참조 원본: src/App.tsx, src/features/schedules/useSchedules.ts, src/features/schedules/scheduleStorage.ts, src/styles.css, 10·11·12번 계약.
- 확인만: 최상위 14_ExecutionPlan.md와 MOD-EventManagement.md(기존 Task 내부 책임·파일 범위 내 변경), 배치·스타일·binding ID·조회 매핑.
- 변경 금지: 운영 origin 저장 데이터, DB·서버·외부 패키지, 다른 화면의 구조·좌표·스타일.
- 리스크: 날짜는 offset 없는 현지 문자열로 유지하며 UTC ISO 직렬화를 사용하지 않는다. 기간은 변경 직전 초안의 양수 경과 시간이다. 시간대 식별자를 저장하지 않는 기존 현지 날짜 모델을 유지한다. 빈 값·파싱 불가·기존 기간 0 이하이면 종료를 바꾸지 않고 저장 검증을 유지한다.
- 검증 예정: 종료 이전·동일·이후, 자정·월말·연말·여러 날·연속 변경, 빈 값·잘못된 기간, 종료 직접 변경, 부모 입력 제한, 신규 일정 회귀, 저장·취소·재열기. 빌드·JSON 검사와 격리 origin 브라우저에서 확인한다. 신규 테스트 파일은 작성하지 않는다.

## 검증과 리스크

기존 일정 보존, 형제 재정렬·접기·편집, 부모 기간, 보기 전환과 날짜 유지, 간트 잘림·고정 열, 키보드 조작을 확인한다. 이 Task는 운영 origin 원본과 DB·서버·외부 모듈을 수정하지 않는다. 서버 변경은 신규 소유 Task만 담당한다. 적용 가능한 구현 템플릿 없음(Web 등록 원본 누락); 기존 React/TypeScript 구조를 따른다. Git은 첫 커밋이 없는 상태로 시작했고 작업 브랜치만 생성했다.

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


## 2026-10-23 색상 헤더와 체크리스트 기준

FR-014·015 / DATA-002·005 / API-001. Write Set: types.ts, scheduleChecklist.ts, useSchedules.ts, components/ScheduleEditor.tsx, components/ScheduleColorControl.tsx, components/ScheduleChecklist.tsx, MOD-001.json 및 이 Task·메타데이터. 입력 컴포넌트는 초안만 전달하고 순수 함수가 검증·정규화한다. 일정 편집 초기값은 checklist를 깊게 복사한다. 공개 계약 확정 → 순수 정책/저장 검사 → UI → App 연결 → 격리 통합 검증 → 문서 대조/차이 해소의 SEQUENTIAL/NONE 흐름이다. 다른 Task의 소유를 중복하지 않는다. 색상은 실제 변경에서만 manual, 자동 복원은 auto이며 전체 설정 변경은 수동 일정 보존이다. 날짜 보정·부모 기간·우선순위는 유지한다. 기존 체크리스트 부재·손상/중복/공백 항목·저장 실패·취소/재접속·긴 목록/모바일/키보드·다섯 보기를 검증한다. 전용 구현 템플릿 없음; 기존 React/TypeScript 구조를 따른다.


2026-10-23 범위 검증: 정책·저장 경계 20건 및 실제 격리 UI의 저장/취소/재접속·개별/자동 색상·일괄 적용·날짜 보정·다섯 보기·모바일/긴 목록을 확인했다. 색상 선택창 Escape의 일정 초안 손실 경로를 UI 경계에서 해소했다. MOD-001·002의 source/계층/좌표와 대조했다. [검증 보고서](../../Evidence/EditorChecklist/README.md). 전체 renderer 충실도·실제 quota 오류 UI·전체 접근성은 미검증이며 Review를 유지한다.


## 색상 선택창 기본값 버튼

2026-10-23 사용자 요청: 색상 선택창 맨 아래 기본값 버튼으로 해당 일정의 단계별 자동 색상을 다시 따른다. FR-014·DATA-002/004의 기존 의미를 유지한다. 브라우저 native picker에는 앱 버튼을 추가할 수 없어 전용 선택창으로 대체한다. Write Set: ScheduleColorControl.tsx, ScheduleColorPicker.tsx, colorValues.ts, ScheduleEditor.tsx, MOD-001.json 및 소유 Task·메타데이터·검증 증거. UI는 선택 중 로컬 색상을 보관하고 선택 버튼에서만 개별 색상을 초안에 반영한다. 기본값은 onRestore를 호출해 auto 초안을 반영하고 선택창을 닫는다. 일정의 최종 저장/취소 경계는 유지한다. 공통 설정·저장 형식·체크리스트는 변경하지 않는다. 색상 변환은 DOM/React와 분리된 순수 함수, 선택창은 표시·포인터/RGB/키보드 입력, 부모 편집기는 초안만 조립한다. 별도 라이브러리·외부 패키지 없이 기존 React/TypeScript 사용. SEQUENTIAL/NONE: 기준 확정 → 변환 검증 → UI → 중첩 dialog 통합 → 실제 화면/정본 대조. 자동값의 고정 복사 여부, 선택창 Escape·배경 취소 시 일정 초안 손실, RGB 값 범위·검정/회색 변환, 작은 화면 잘림·포커스를 검증한다. 직전 커밋은 local-only 검증 완료이며 start-check의 master_not_pushed는 필수 원격 누락이 아닌 미요청 원격 상태로 판정한다.


### 색상 선택창 기본값 구현 결과 (2026-10-23)

- 앱 전용 색상창 하단 기본값으로 자동 모드를 복원한다. 선택창 내부 변경과 일정 초안 저장 책임을 분리했다.
- RGB 개별 지정, 기본값 후 저장·취소, 새로고침 유지, 단계별 프리셋 변경 추종, Escape·닫기·배경 클릭 초안 보존 및 모바일 배치를 검증했다.
- TypeScript/Vite 빌드, 순수 변환 16개 검사(4096 RGB 왕복 포함), MOD-001 스키마·소스 연결 검사가 통과했다. 공용 뷰어 시각 검증은 미완료다.
- 검증 근거: [색상창 기본값 검증](../../Evidence/ColorPickerDefault/README.md).


## 계획·작업 현재 기준선 (2026-10-23)

사용자 승인: 편집창 구분 선택과 간트·월·주·일 작업만 표시. FR-016 / DATA-001·002 / API-001·002·003. 구분은 계층과 독립적인 plan/task이며 부재는 task, 신규 기본값은 plan이다. 저장·취소 경계를 유지한다. 전체 집합에서 부모 기간과 단계 색상을 계산한 뒤 작업만 표시하고, 우선순위는 전체를 관리한다. 숨겨진 계획의 접힘은 작업을 가리지 않는다. 계획도 표시 옵션은 범위 밖이다.

실행: 기준 확정 → 모델/저장 계약 → 순수 표시 투영 → UI → 조립 → 빌드/격리 UI → 문서 대조/차이 해소. SEQUENTIAL/NONE. 구분 누락·오류, 계획 접힘 아래 작업, 중간 계획 아래 손자 작업, 저장/취소/재접속, 색상·부모 기간·자식 보존을 검증한다. 신규 테스트 파일은 만들지 않는다. 현재 HEAD a86a7a0, 기존 dirty dist/index.html·postgresql/supervisor.log. start-check master_not_pushed는 이전 local-only 완료의 선택적 미요청 원격 상태이며 필수 반영 누락이 아니다. 구현 단위는 package.json의 현재 웹 앱, 외부 SDK/DB/서버/운영 origin은 변경 금지다.


### 계획·작업 구현 대조 결과

| 비교 항목 | 현재 기준 | 실제 근거 | 판정 |
| --- | --- | --- | --- |
| 구분·호환 | FR-016, DATA-001/002 | kind 정책·저장 경계 12건 통과 | 일치 |
| 편집·저장·취소 | MOD-001 kind-field 및 save/cancel | 실제 신규 기본값, 구분 변경 취소, 저장·재접속 복원 확인 | 일치 |
| 표시·계층 | SCR-001~005 표시 기준 | 월·주·일 작업2/계획0, 간트 계획 접힘 무시·작업 접힘 공유 확인 | 일치 |
| 배치·스타일 | MOD-001 및 기존 styles.css | 1440×1000 실측과 390×844 콤보박스·저장 버튼 확인; CSS 변경 없음 | 일치 |
| 공용 뷰어 | 기존 전체 시각 reconciliation | 구조·source·bindings 자동 검증 통과, 공용 뷰어 시각/참조 문서 실제 열기는 미실행 | 미검증 |

[이번 범위 검증](../../Evidence/ScheduleKinds/README.md). 앱 동작 범위의 필수 차이는 해소했다. 전체 제품·공용 뷰어 Review는 유지한다.


### 신규 구분 기본값 조정 (2026-10-23)

사용자 요청에 따라 새 일정·하위 일정·달력 시간 선택 생성의 기본 구분을 plan(계획)으로 조립한다. 기존 구분 부재의 task 해석 및 저장된 plan/task는 유지한다. Source 수정은 src/App.tsx의 openNew 초기값 한 곳, Semantic 수정은 MOD-001 kind-field-input의 기본값 의미와 schedule-kind 동작이다. 배치·스타일·기존 저장 정책은 확인만, 2단계·최상위 실행계획은 기존 Task 내부 기준 조정으로 확인만이다. 기존 dist/index.html·postgresql/supervisor.log는 커밋 제외. start-check master_not_pushed는 이전 local-only 완료의 미요청 원격 상태이며 필수 반영 누락이 아니다. 검증: 빌드, 신규·하위 기본 선택, 명시적 작업 저장·재열기, 취소 후 재추가를 확인한다.


기본값 조정 검증: TypeScript/Vite 빌드 통과. 격리 origin 127.0.0.1:5180에서 신규·취소 후 재추가·하위 일정의 계획 기본값과 명시적 작업 저장/새로고침/재편집의 작업 유지를 확인했다. [기본 선택 화면](../../Evidence/DefaultPlan/new-default.png). 저장소·기존 구분 해석 source는 수정하지 않았다. 배치·스타일은 불변이며 공용 renderer 전체 시각 검증은 기존 미검증 상태를 유지한다.


## kind-help 삭제 현재 기준 (2026-10-23)

사용자 요청: MOD-001 kind-help 안내 문구 제거. 수정 대상은 src/features/schedules/components/ScheduleEditor.tsx의 해당 안내 단락, MOD-001.json의 kind-help 및 삭제에 따라 이동하는 편집창 실측 좌표, 이 Task·메타데이터다. Evidence/KindHelpRemoved는 생성 대상이다. 구분 선택·계획 기본값·저장/취소·작업만 표시 정책, CSS/저장/업무 source는 확인만이며 변경하지 않는다. 전체 14_ExecutionPlan 및 2단계·SCR-001 Task는 소유권·순서·스타일 불변으로 확인만이다. 기존 Evidence는 참조 원본으로 보존한다. 실행은 단락 삭제 → 빌드 → 같은 viewport에서 요소/배치 대조 → JSON 갱신/검증이다. 안내 문구와 빈 공간 제거, 구분 입력 및 기간·체크리스트·저장/취소 유지가 완료 기준이다. 기존 dist/index.html·postgresql/supervisor.log는 커밋 제외. start-check master_not_pushed는 직전 local-only 완료 후 미요청 원격 상태이며 필수 반영 누락이 아니다.


삭제 검증 결과: source 안내 단락과 JSON kind-help를 제거했다. TypeScript/Vite 빌드 통과, 실제 1440×1000 편집창에서 구분 다음에 기간 입력이 바로 이어지고 체크리스트·저장/취소가 유지됨을 확인했다. 구분 변경 취소 후 재열기에서 계획 유지도 확인했다. 실측 좌표로 모달/입력 배치를 동기화했고 JSON 스키마·source·render contract 검사는 오류0·경고0이다. 공용 뷰어 전체 시각 reconciliation은 기존 미검증 상태로 유지한다. [화면 근거](../../Evidence/KindHelpRemoved/editor.png), [배치 근거](../../Evidence/KindHelpRemoved/editor-geometry.json). 관련 Task·배치·문구의 요청 범위 차이는 해소했다.


## 공통 서버 전환 현재 기준

useSchedules/색상 Hook의 저장 요청은 WorkspaceClient 공개 계약으로 전달한다. 부모 기간·색상·체크리스트 순수 규칙은 서비스에서도 재사용하며 중복 판정을 새로 만들지 않는다. 구현→실제 검증→현재 문서 대조→차이 해소를 따른다. 신규 API 계약은 12번 API-004/005와 신규 모듈 Task를 따른다.

## AI 초안의 체크리스트 재사용

ScheduleChecklist.tsx에 선택적 titleId를 받아 여러 초안 항목의 접근성 제목 ID가 중복되지 않도록 한다. 기존 편집기의 기본 ID와 항목 ID·배열·입력 콜백은 유지한다. 신규 초안 UI·상태·서버 요청은 WorkspaceClient/TASK-001이 소유한다.
