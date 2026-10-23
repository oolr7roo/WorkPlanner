# TASK-001 화면 조합·트리·간트 구현

상태: Review. 사용자 승인: 2026-10-21 대화의 계획대로 구현 요청. 관련 요구사항 FR-001~008.

## 소유 범위

src/App.tsx, src/components/CalendarToolbar.tsx, src/features/schedules/views/*, src/features/schedules/components/ScheduleTreeLabel.tsx, src/features/schedules/components/ScheduleDragHandle.tsx, src/features/schedules/useScheduleTree.ts, src/features/schedules/schedules.css, src/features/schedules/gantt.css, src/styles.css

COMMON-002, SCR-004, SCR-005. 앱이 view와 기준 날짜를 소유한다. 우선순위는 전체 트리 행을 사용한다. 간트는 전체 계층에서 계산한 작업 행을 사용하며 계획의 접힘은 무시하고 작업의 접힘은 공유한다. 제목 클릭은 펼침·접힘, 편집은 별도 버튼이다. 들여쓰기는 8px씩 최대 24px. 달력 SDK 어댑터는 월·주·일만 담당한다.

## 실행과 책임 경계

문서 기준 확정 → 구현 → 빌드·격리 브라우저 검증 → 계약 대조 → 차이 해소. 순차 실행한다. UI는 저장소에 직접 접근하지 않으며 업무 함수는 DOM에 의존하지 않는다. App은 조합만 소유한다. 다른 Task 소유 파일을 중복 소유하지 않는다.

## 검증과 리스크

기존 일정 보존, 형제 재정렬·접기·편집, 부모 기간, 보기 전환과 날짜 유지, 간트 잘림·고정 열, 키보드 조작을 확인한다. 운영 origin·DB·서버·외부 모듈은 수정하지 않는다. 적용 가능한 구현 템플릿 없음(Web 등록 원본 누락); 기존 React/TypeScript 구조를 따른다. Git은 첫 커밋이 없는 상태로 시작했고 작업 브랜치만 생성했다.

## 참조

[상위 계획](../SCR-001.md), [모듈 책임](../../10_ModuleMapping.md), [데이터](../../11_DataRequirements.md), [인터페이스](../../12_APISpecification.md).

## 2026-10-21 검증 결과

- TypeScript 검사와 Vite production build 통과.
- 격리 origin http://127.0.0.1:5174에서 하위·다단계 일정 추가, 부모 기간 자동 계산, 제목 접기·펼치기, 목록·간트 접힘 공유, 드래그·키보드 순서 변경, 부모 삭제 후 자식 승격, 새로고침 후 복원, 월·주·일 탐색과 간트 날짜 전달을 확인했다. 운영 origin 데이터는 변경하지 않았다.
- 순수 모듈 실행으로 형제 이동·다른 부모 드롭 거부·자식 보존·기간 잘림·v1 원본 보존 변환·손상/순환/중복 데이터 거부를 확인했다.
- 화면 결합 도구로 SCR-004·005의 공통 정의와 부모 참조 검증 통과.
- 확인 범위 밖: 실제 모바일 터치 드래그, 전체 접근성 감사, 운영 배포, 다중 탭 동시 편집. 상태 Review는 이 한계를 표시한다.
- Git: 시작부터 HEAD와 커밋된 기준 브랜치가 없다. start-check/finish-check는 HEAD 부재로 실패했지만 codex/schedule-tree-gantt 브랜치 생성은 성공했다. 기존 미추적 프로젝트 전체를 임의로 초기 커밋하지 않고 Git 미반영 상태로 보존한다.
- AISkill MCP branches는 등록 Web 원본 부재로 재시도 실패했다. CLI도 Web 원본이 없어 coding-work만 전달받고 안전 편집 원문을 MCP로 직접 읽었다. safe-editing은 로컬 카탈로그에 미등록이다. 개선 Reporter 도구가 없어 오류를 영구 등록하지 못했다.

증거: [트리 목록](../../Evidence/TreeSchedules/priority.png), [간트](../../Evidence/TreeSchedules/gantt.png).

## 설정 조립 기준

App.tsx·styles.css·COMMON-001.json 헤더 버튼과 MOD-001.json의 색상 모드 연결을 소유한다. 신규 팝업 UI는 TASK-003에 위임한다. 프리셋 Hook·일정 Hook·팝업 콜백만 조합하며 색상 정책이나 저장을 App 안에 구현하지 않는다.


2026-10-22 범위 검증: 정책·저장 경계 26건, 격리 브라우저의 프리셋 저장/취소/복원·다섯 보기·신규/하위·직접 색상 보존·자식 승격·모바일·날짜 보정 회귀 확인. [검증 근거](../../Evidence/ColorPresets/README.md). 저장 실패 UI 전체 경로와 공용 renderer 충실도는 미검증이며 Review를 유지한다.


## 2026-10-22 월 날짜 숫자 표시

사용자 승인 범위는 월 보기의 날짜 라벨 전체를 숫자로 표시하는 것이다. 오늘 강조·다른 달 구분·한국어 제목/요일·날짜 선택·일정 표시·키보드 탐색을 유지하며 접근성 이름은 전체 날짜를 제공한다.

- 소유: 이 Task가 build/calendarMonthLabels.ts, vite.config.ts, src/features/schedules/components/MonthDayNumber.tsx, SCR-001.json의 month-label-* 및 관련 검증 근거를 담당한다. CalendarView는 SDK 연결을 유지하고 표시 정책·SDK 호환 어댑터를 직접 소유하지 않는다.
- SDK dayCell은 셀 전체를 교체하므로 사용하지 않는다. 빌드 어댑터는 MonthView의 날짜 라벨 호출 한 곳만 전용 표시 컴포넌트로 연결한다. node_modules 원본은 수정하지 않으며, 기대한 구조가 아니면 빌드를 실패시킨다.
- 흐름: 기준 확정 → 표시 컴포넌트/어댑터 구현 → 빌드 및 어댑터 정상·변경된 SDK 거부 검사 → 격리 origin PC/모바일 통합 확인 → 문서 대조·차이 해소. SEQUENTIAL / NONE. 기존 Task의 좁은 표시 기준선 변경으로 별도 Task는 추가하지 않는다.
- Write Set: 위 네 파일, 이 Task와 메타데이터, Evidence/MonthDateNumbers. 저장 형식·API·업무 로직 변경은 없다. 적용 가능한 전용 구현 템플릿 없음; 기존 React/TypeScript·Vite 구조 사용.
- 리스크: SDK 업데이트 시 어댑터 호환 재검토가 필요하다. CSS로 글자를 숨기거나 로케일 전체를 바꾸지 않는다. 검증은 빌드, 월 이동·1/10/31일·다른 달·오늘·날짜 선택·일정 편집·키보드·주/일 유지·390×844를 포함한다. 전체 renderer 충실도는 별도로 미검증을 유지한다.


월 날짜 표시 검증 결과: 앱 빌드·어댑터 타입·보존/실패 경계 7건·PC/모바일 42개 숫자·월 이동·선택·일정 저장/편집·키보드·주/일 보존을 확인했다. SCR-001의 month-label-* 42개는 숫자·접근성 이름·실측 좌표·소스 연결을 동기화했다. SDK 사전 번들 제외 시 React 런타임 의존성을 명시해 개발/빌드 경로를 맞췄다. 추가 Vite 설정 타입 검사의 기존 TS2339는 기준선과 동일하며 공용 renderer 충실도는 미검증이다. [검증 근거](../../Evidence/MonthDateNumbers/README.md). 전체 상태는 Review를 유지한다.


## 편집 초안·체크리스트 조립

App.tsx에서 신규 빈 checklist, 기존 checklist 전달을 조립하며(편집 초기 복제는 ScheduleEditor가 담당) 검증/저장 정책을 넣지 않는다. styles.css의 헤더 색상 버튼·체크리스트·모달 내부 스크롤을 소유한다. 기능 UI와 MOD-001 의미는 MOD-EventManagement/TASK-001이 담당한다. 모바일·긴 목록·저장/취소 및 다섯 보기 통합을 확인한다.


2026-10-23 범위 검증: 정책·저장 경계 20건 및 실제 격리 UI의 저장/취소/재접속·개별/자동 색상·일괄 적용·날짜 보정·다섯 보기·모바일/긴 목록을 확인했다. 색상 선택창 Escape의 일정 초안 손실 경로를 UI 경계에서 해소했다. MOD-001·002의 source/계층/좌표와 대조했다. [검증 보고서](../../Evidence/EditorChecklist/README.md). 전체 renderer 충실도·실제 quota 오류 UI·전체 접근성은 미검증이며 Review를 유지한다.


## 전용 색상 선택창 스타일

색상 선택창의 헤더 색상 버튼·선택면·색상축·RGB·기본값 푸터와 모바일 배치를 styles.css에서 소유한다. 선택창·색상 변환·MOD-001 의미는 MOD-EventManagement/TASK-001의 소유다. 다른 작업의 파일을 중복 수정하지 않는다.


### 색상 선택창 기본값 구현 결과 (2026-10-23)

- 앱 전용 색상창 하단 기본값으로 자동 모드를 복원한다. 선택창 내부 변경과 일정 초안 저장 책임을 분리했다.
- RGB 개별 지정, 기본값 후 저장·취소, 새로고침 유지, 단계별 프리셋 변경 추종, Escape·닫기·배경 클릭 초안 보존 및 모바일 배치를 검증했다.
- TypeScript/Vite 빌드, 순수 변환 16개 검사(4096 RGB 왕복 포함), MOD-001 스키마·소스 연결 검사가 통과했다. 공용 뷰어 시각 검증은 미완료다.
- 검증 근거: [색상창 기본값 검증](../../Evidence/ColorPickerDefault/README.md).


## 계획·작업 현재 기준선 (2026-10-23)

사용자 승인: 편집창 구분 선택과 간트·월·주·일 작업만 표시. FR-016 / DATA-001·002 / API-001·002·003. 구분은 계층과 독립적인 plan/task이며 부재는 task, 신규 기본값은 plan이다. 저장·취소 경계를 유지한다. 전체 집합에서 부모 기간과 단계 색상을 계산한 뒤 작업만 표시하고, 우선순위는 전체를 관리한다. 숨겨진 계획의 접힘은 작업을 가리지 않는다. 계획도 표시 옵션은 범위 밖이다.

현재 Write Set: src/App.tsx, src/features/schedules/views/GanttView.tsx, src/styles.css, SCR-001~005.json 및 Task·메타데이터. App은 순수 투영을 호출하고 View는 표시만 한다. Gantt의 작업 목록·빈 상태 안내를 맞춘다. MOD-001 좌표 측정 협력은 EventManagement Task가 소유한다. 월·주·일·간트 작업 표시와 전체 우선순위, 접힘 공유 예외를 통합 검증한다. 최상위 14_ExecutionPlan.md 및 대응 2단계 문서는 확인만: 진입점·Task 순서·소유권·상태 변경이 없다. SCR-002/003 TASK-001은 해당 JSON 의미 기준만 동기화한다.


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
