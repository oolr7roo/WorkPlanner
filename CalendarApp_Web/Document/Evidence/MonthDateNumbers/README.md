# 월 날짜 숫자 표시 검증

2026-10-22 사용자 승인. 격리 origin http://127.0.0.1:5176/에서 테스트 일정 하나로 검증했다. 운영 origin의 일정과 DB는 변경하지 않았다.

| 항목 | 결과 | 근거 / 범위 |
| --- | --- | --- |
| 앱 TypeScript·Vite production build | 통과 | npm.cmd run build, 61 modules |
| SDK 어댑터 전용 타입 검사 | 통과 | build/calendarMonthLabels.ts |
| 정상 변환·원본 보존·SDK 구조 변경 거부 | 7건 통과 | [어댑터 검사](adapter-checks.json); 단일 월 라벨 외 원문 동일 |
| PC 1440×1000·모바일 390×844 | 통과 | 날짜 42개 모두 숫자; 1·10·31 포함, 모바일 가로 넘침 없음 |
| 오늘·다른 달·접근성 이름 | 통과 | 오늘 22 강조·aria-current, 이전 달 opacity 0.4, 전체 한국어 날짜 이름 |
| 기간 이동 | 통과 | 10월→11월→오늘 복귀 뒤 숫자 표시 유지 |
| 날짜 선택·일정 표시·편집 | 통과 | 10월7일 선택→09:00/10:00 초안→저장→일정 클릭→수정 모달 |
| 키보드 날짜 이동·선택 | 통과 | 10월7일 ArrowRight→8일 포커스, Enter→8일 신규 초안 |
| 주·일 표시 보존 | 통과 | 기존 18일~24일/22일 라벨과 한국어 제목 유지 |
| SCR-001 JSON·소스·렌더 계약 | 통과 | [검증 결과](wireframe-validation.json), 오류·경고 없음 |
| Vite 설정 전체 추가 타입 검사 | 기존 오류 유지 | 기존/변경 모두 IncomingMessage.url TS2339 동일. [기준선 대조](config-typecheck.json). 프로젝트 필수 빌드·새 어댑터 타입 검사는 통과 |
| 공용 renderer 시각 충실도·전체 접근성 인증 | 미검증 | 실제 앱 검증과 구분 |

SDK dayCell은 셀 전체를 교체해 이벤트·키보드·드래그 경로를 잃으므로 채택하지 않았다. 전용 빌드 어댑터는 MonthView 날짜 라벨 한 곳만 MonthDayNumber로 연결한다. 셀·상태·상호작용과 기존 스타일은 SDK에 남긴다. node_modules 원본은 수정하지 않는다. 기대한 구조/라벨 개수가 달라지면 빌드에서 실패해 SDK 업데이트 시 호환 검토를 요구한다. 개발 환경에서도 같은 변환을 쓰도록 SDK만 사전 번들에서 제외하고 React 런타임 의존성은 명시적으로 최적화한다.

[PC 캡처](desktop.png), [모바일](mobile.png), [PC 라벨](desktop-labels.json), [모바일 라벨](mobile-labels.json), [정본 반영 좌표·스타일](label-geometry.json). [소유 Task](../../14_ExecutionPlan/SCR-001/TASK-001.md), [월 정본](../../09_WireframeMockup/SCR-001.json).
