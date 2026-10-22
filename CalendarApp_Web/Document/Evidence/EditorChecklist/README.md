# 일정 헤더 색상·체크리스트 검증

2026-10-23 사용자 승인 범위. 격리 origin http://127.0.0.1:5177/의 테스트 일정 세 개로 실행했다. 운영 origin 일정·DB와 기존 실행 파일은 변경하지 않았다.

| 검증 | 결과 | 근거 / 한계 |
| --- | --- | --- |
| TypeScript·Vite production build | 통과 | 64 modules |
| 순수 체크리스트·저장 경계 | 20건 통과 | [정책/저장 검사](policy-storage.json): 부재·정상·중복/손상·공백·복사·trim·v1 호환·왕복·쓰기 실패·자식 보존 |
| 헤더 색상 선택·개별 전환·자동 복원 | 통과 | 실제 색상 변경만 manual로 전환; 복원 저장 후 auto 표시색 |
| 색상 선택창 취소 | 통과 | Chromium Escape가 상위 dialog도 취소하던 경로를 보완; 선택창 Escape 후 일정 모달과 작성 중 체크항목·자동 모드 유지 |
| 체크항목 추가·Enter·내용·완료·삭제 | 통과 | 빈 항목 저장 차단, trim 뒤 1/2 완료, 삭제 저장 뒤 재접속 0/0 확인 |
| 취소·Escape | 통과 | 색상·체크·텍스트·삭제 초안 취소 뒤 원본 복원; 긴 목록 Escape 취소 뒤 기존 2개 유지 |
| 새로고침 보존 | 통과 | 개별 #884422와 체크리스트 text/done 유지 |
| 공통 프리셋 일괄 적용 | 통과 | 부모 개별 #884422 유지, 자동 자식 #225588 적용, 체크리스트 유지 |
| 날짜 보정·부모 기간 | 통과 | 리프 시작 10월24일14:00→종료15:00, 취소; 부모 시작/종료 비활성 |
| 다섯 보기 | 통과 | [보기 확인](views.json): 세 일정 모두 표시 |
| PC·모바일·긴 목록 | 통과 | 1440×1000 / 390×844; 14항목 dialog clientHeight808/scrollHeight1225; 가로 넘침 없음 |
| MOD-001·002 schema/source/render contract | 통과 | 오류·경고 0, [검증 결과](validation.json) |
| 저장 용량 초과 UI 전체 경로 | 미검증 | 어댑터 쓰기 실패를 격리 실행, 기존 Hook의 메모리 유지/오류 안내 정책 유지 |
| 전체 접근성·터치·공용 renderer 시각 충실도 | 미검증 | 이번 키보드/실제 앱 캡처 확인과 구분 |

모듈 완료: 순수 검증/복사/정규화와 저장 호환 경계를 먼저 확인하고 UI를 연결했다. App은 초기 초안 전달만 수행한다. UI는 localStorage를 직접 참조하지 않는다. 실제 브라우저 검증 뒤 wireframe 문구·계층·실측 좌표와 데이터/요구사항/소유 Task를 대조했다. 기존 mode 누락은 manual, checklist 누락은 빈 목록이며 전체 원본 덮어쓰기나 일괄 수동 복원은 추가하지 않았다.

[PC 편집](editor-desktop.png), [모바일 편집](editor-mobile.png), [긴 목록](long-list-mobile.png), [PC 설정](settings-desktop.png), [모바일 설정](settings-mobile.png), [편집 실측](editor-geometry.json), [설정 실측](settings-geometry.json). [편집 소유 Task](../../14_ExecutionPlan/MOD-EventManagement/TASK-001.md), [DATA-005](../../11_data_spec/DATA-005_Checklist.md), [API-001](../../12_api_spec/API-001_LocalStorage.md). 전체 인수 상태는 Review다.
