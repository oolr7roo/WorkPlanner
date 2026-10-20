# CalendarApp 문서 작성 검증 보고서

## 1. 작성 기준과 작업 경계

기준일: 2026-10-05 Asia/Seoul. 작업 유형: 현재 구현 기준 문서 신규 작성. 산출물: ProjectPlan 1~16 및 상세·메타데이터·검증 증거. 생성 대상은 Document/와 CalendarApp_{Web,Database,Infrastructure}/Document/다. source·스크립트·.config·잠금 파일·클러스터·비밀 파일은 읽기 전용 원본이며 기존 구현을 수정하지 않는다.

모든 문서는 고객 승인 전 Review다. 고객 확인·실측·테스트 전체 통과를 문서 작성 완료와 구분한다. 사용자 지시에 따라 질문 중심 섹션별 절차 대신 현재 코드 근거로 끝까지 작성했다.

## 2. 규칙 사용과 대체 경로

AISkill MCP는 노출된 도구·resource에 없었고 플러그인 재탐색 결과도 없었다. 로컬 /Users/jhjo/AISkill의 RuleIndex(revision 2026-10-02.4)와 DocSearch CLI를 사용했다. CLI v1은 snapshot 계약 대신 domain_ids를 요구하여 호환 인자로 재호출했다. web-frontend 분기는 등록 파일 Domain/Web/WebFrontendRules.md 부재로 실패해 제외했으며 ProjectPlan Web DomainRules와 Overrides로 문서 책임을 적용했다. 규칙 파일은 수정하지 않았다. 개선 Reporter 미노출로 영구 개선 등록은 하지 않았다.

## 3. 빌드·브라우저 검증 결과

`npm run build`: TypeScript 검사와 Vite 6.4.3 정적 빌드 통과. 격리 Chromium·별도 Vite 5178·Asia/Seoul에서 확인한 동작은 아래와 같다. 실제 사용자 localStorage나 관리 DB를 쓰지 않았다.

| 검증 | 결과 |
| --- | --- |
| 종료<=시작 오류 | 통과 |
| 생성 localStorage | 통과 |
| 새로고침 복원 | 통과 |
| 수정 localStorage | 통과 |
| 삭제 localStorage | 통과 |
| 취소 닫힘 | 통과 |
| DB 디렉터리 HTTP 차단 | 통과 |
| 저장 실패 안내 | 통과 |

브라우저 검증에서 제목 선택자의 정확 문자열은 SDK의 시간 접두어 때문에 실패했다. 부분 제목 선택자로 수정 후 재실행했으며 제품 코드 오류로 판정하지 않았다.

## 4. 화면 증거와 검증 한계

캡처: [월](Evidence/month.png), [주](Evidence/week.png), [일](Evidence/day.png), [신규](Evidence/new.png), [수정](Evidence/edit.png), [입력 오류](Evidence/form-error.png), [모바일](Evidence/mobile.png), [모바일 신규](Evidence/mobile-new.png), [저장 실패](Evidence/storage-error.png). [DOM 계측](Evidence/runtime.json)은 기준 viewport에서 실제 getBoundingClientRect 결과를 포함한다.

JSON schema와 source 연결은 자동 validator로 확인한다. WireFrame renderer의 캡처 대조는 수행하지 않았으며 render_fidelity는 미검증이다. 최초 작성에서는 SDK의 내부 날짜 셀·반복 일정·시간축을 composite 영역으로 연결했다. 현재 보기별 상세화 결과는 7절이 최신 기준선이며 기존 Evidence/runtime.json과 기존 검증 JSON은 최초 작성 증거다. 독립 요소를 임의 좌표로 완성하지 않는다. 모바일 날짜 숫자의 줄바꿈·일부 행 잘림이 캡처에서 관찰되어 현재 한계로 기록한다.

드래그·리사이즈 전체 경로·손상 복구·Windows 운영·DB 기동 정지·백업 복구·접근성 적합성은 실행 통과로 주장하지 않는다. 고객 목표·우선순위·RTO/RPO·성능 상한은 미승인 또는 미측정이다.

## 5. Git 반영 상태

작업 시작 당시 모든 구현 파일이 untracked이며 HEAD 커밋이 없었다. start-check는 git rev-parse HEAD 실패로 Git 작업을 진행할 수 없었다. 사용자 구현을 최초 커밋에 혼입시키지 않기 위해 문서만 작성하고 Git 미반영으로 보존한다. 기존 master의 unborn 상태를 유지한다.

## 6. 산출물 검증

Markdown 형식·같은 이름의 metadata·fingerprint·내부 상대 링크·표 열 수·ID 추적·Task 소유·source hash 보존은 문서 검증 결과 JSON으로 기록한다. [최종 검증](Evidence/document-validation.json), [Wireframe 검증](Evidence/wireframe-validation.json), [소스 기준 해시](Evidence/source-hashes.json).

## 7. 월·주·일 보기와 공통 영역 분리 검증

이번 요청은 현재 구현 기준 문서 분리와 책임·리스크 검토다. 앱 source·SDK·공용 WireFrame 도구는 참조 전용이다. 수정 허용 대상은 Web의 9~14번 관련 문서·JSON·메타데이터, Web QA 상세와 현재 보고서다. 문서 전용 결합 도구와 ViewSplit 증거는 생성 대상이다. runtime JSON·캡처는 실제 실행에서 생성하며 수정 정본으로 사용하지 않는다. source hash는 이번 작업 전후로 별도 확인한다.

| 소유 대상 | 책임 | 소유 Task |
| --- | --- | --- |
| COMMON-001 | 헤더·홈 이동·일정 추가의 공유 구조·동작 | SCR-001/TASK-001 |
| COMMON-002 | 기간 탐색·보기 버튼·날짜 표시의 공유 구조·동작 | SCR-001/TASK-001 |
| COMMON-003 | 저장 범위 안내·기본 숨김 저장 오류 | SCR-001/TASK-001 |
| SCR-001 | 월 격자 본문·공통 배치·상태 | SCR-001/TASK-001 |
| SCR-002 | 주 시간표 본문·공통 배치·상태 | SCR-002/TASK-001 |
| SCR-003 | 일 시간표 본문·공통 배치·상태 | SCR-003/TASK-001 |
| MOD-001 | 생성·수정·삭제·취소와 호출한 보기 복귀 | MOD-EventManagement의 기존 Task |
| 문서 결합 도구 | COMMON 로딩·배치·override·안전 검사·파생 v3 출력 | SCR-001/TASK-001 |

세 SCR은 같은 Calendar의 상태를 문서상 분리한 것이며 신규 페이지 URL이나 독립 일정 저장소를 뜻하지 않는다. COMMON은 독립 JSON 정의이며 각 SCR의 composition이 배치·현재 상태를 공급한다. source의 app-shell·calendar-panel은 유지한다. 저장 피드백의 두 루트를 같은 app-shell에 배치하고 실제 구현에 없는 wrapper를 생성하지 않는다.

공용 renderer에 외부 참조 결합 기능이 없으므로 CalendarApp 전용 [문서 결합 도구](../CalendarApp_Web/Document/tools/compose-wireframes.mjs)를 사용한다. composition은 공용 v3 지원 속성이 아니라 로컬 작성 계약이다. 공용 renderer에는 결합 후 composition을 제거한 표준 v3를 전달한다. 작성용 SCR을 직접 열면 공통 영역이 표시되지 않는다. native 참조 지원과 공용 renderer 개선은 별도 작업 범위다.

| 확인 항목 | 결과 | 근거 / 한계 |
| --- | --- | --- |
| 작성 정본 7개 엄격한 JSON 파싱·v3 구조·source·binding | 통과 | COMMON 3, SCR 3, MOD 1; [정본 검증](Evidence/ViewSplit/authoring-validation.json) |
| 결합된 화면 3개 v3 구조·source·binding | 통과 | [결합 검증](Evidence/ViewSplit/composed-validation.json); 경고·오류 0 |
| 공통 중복 없음·단일 선택 상태·날짜 문구·부모 배치 | 통과 | [결합 검사](Evidence/ViewSplit/composition-checks.json) |
| 좌표 역변환·DOM 대조 | 통과 | 화면별 166·265·97개 노드, 최대 오차 0.000013px 미만; storage-error는 별도 오류 캡처 |
| 위험 입력 거부·정본 덮어쓰기 거부 | 통과 | 누락 파일·경로 이탈·없는 parent·없는 override·events override·중복 ID·중복 COMMON·누락 mount·계약 버전·부모 순환·CLI 정본 덮어쓰기 11건 |
| 보기별 선택·기간 이동·오늘·모달 취소 복귀·일정 데이터 보존 | 통과 | 각 보기 5항목, 총 15개 [실행 검사](Evidence/ViewSplit/runtime.json) |
| 데스크톱·모바일 보기 캡처 | 확인 | 1440×1000 / 390×844; 모바일 주 보기는 표본에서 1일 열로 반응형 표시 |
| renderer 시각 충실도·스크롤·sticky·겹침 | 미검증 | schema 통과와 구분; 전체 렌더 완료 판정하지 않음 |
| 종일·더 보기·빈 목록·드래그·리사이즈의 전체 상태 조합 | 미검증 | source 근거만으로 실행 통과를 주장하지 않음 |
| source 보존·링크·표·메타데이터 | 별도 결과 | [문서 검사](Evidence/ViewSplit/document-checks.json) |

캡처: [월](Evidence/ViewSplit/month.png), [주](Evidence/ViewSplit/week.png), [일](Evidence/ViewSplit/day.png), [모바일 월](Evidence/ViewSplit/mobile-month.png), [모바일 주](Evidence/ViewSplit/mobile-week.png), [모바일 일](Evidence/ViewSplit/mobile-day.png), [저장 오류](Evidence/ViewSplit/storage-error.png). [DOM 대응 인벤토리](Evidence/ViewSplit/inventory.json)는 SDK 반복·컨테이너를 실측하고 일정 control의 제목·시간·장식 자식을 부모 표현으로 합성한 내역을 기록한다.

기준 시간은 격리 프로필의 2026-10-05 09:30 Asia/Seoul이며 샘플 일정 두 개는 테스트 데이터다. 실제 사용자 일정과 혼동하지 않는다. 월의 6주·42셀은 이번 캡처 표본이며 모든 달의 고정 요구사항으로 쓰지 않는다. 기간 버튼의 관찰값은 월 10월→11월, 주 10월5일→12일, 일 10월5일→6일이다. day→week→month 전환은 기준 날짜를 표시 기간에 맞춰 표현했다.

모바일에서 day scrollTop 600을 설정한 뒤 week→day는 각각 403으로 관찰되었다. 스크롤 보존을 보장하는 정책으로 문서화하지 않는다. 날짜·시간의 줄바꿈과 일부 표시 잘림은 현 구현 한계이며 문서 분리로 해결되었다고 주장하지 않는다. 새 일정 취소 후 보기 유지만 재검증했으며 저장·삭제 후 복귀의 모든 조합은 미검증이다.

전용 도구 입력·출력과 문서 책임은 [소유 Task](../CalendarApp_Web/Document/14_ExecutionPlan/SCR-001/TASK-001.md)에 정의한다. 전체 문서는 Review이며 고객 승인과 renderer 전체 충실도는 완료되지 않았다. 기존 unborn master 상태로 인해 Git 반영은 수행하지 않았다.
