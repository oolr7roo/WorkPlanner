# TASK-001 화면 조합·트리·간트 구현

상태: Review. 사용자 승인: 2026-10-21 대화의 계획대로 구현 요청. 관련 요구사항 FR-001~008.

## 소유 범위

src/App.tsx, src/components/CalendarToolbar.tsx, src/features/schedules/views/*, src/features/schedules/components/ScheduleTreeLabel.tsx, src/features/schedules/components/ScheduleDragHandle.tsx, src/features/schedules/useScheduleTree.ts, src/features/schedules/schedules.css, src/features/schedules/gantt.css, src/styles.css

COMMON-002, SCR-004, SCR-005. 앱이 view와 기준 날짜를 소유한다. 두 화면은 동일한 트리 행과 접힘 상태를 사용한다. 제목 클릭은 펼침·접힘, 편집은 별도 버튼이다. 들여쓰기는 8px씩 최대 24px. 달력 SDK 어댑터는 월·주·일만 담당한다.

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
