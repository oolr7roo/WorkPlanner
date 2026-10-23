# TASK-001 레거시 브라우저 일정 읽기

## 1. 목적

공통 저장소 전환 뒤 기존 일정·색상 원본 읽기와 로컬 접힘 보존을 담당한다. 운영 브라우저 원본은 변경하지 않는다. FR-007/019, DATA-001/003/004, API-001.

## 2. 소유 범위

scheduleStorage.ts·scheduleColorStorage.ts의 레거시 형식 검사와 readCollapsed/writeCollapsed. readSchedules는 v2가 없을 때 v1을 읽으며 kind 부재를 task로 해석한다. 손상·중복·순환·잘못된 체크리스트는 오류로 반환한다. 서버 snapshot·HTTP·import 미리보기/적용은 MOD-WorkspaceClient 소유다.

## 3. 실행 순서

현재 원본 계약 확인 → 명시적 가져오기 입력 제공 → 기존 형식 검사 확인 → 통합 검증. SEQUENTIAL/NONE. 기존 writeSchedules/writeColorSettings 함수는 호환 코드로 남지만 앱 Hook에서 호출하지 않는다. 자동 로컬 쓰기를 하지 않는다.

## 4. 데이터와 경계

레거시 원본은 읽기 전용이다. DB·MCP 직접 참조 금지. 접힘은 브라우저별 UI 상태다. 전체 일정의 기간·색상 계산 뒤 표시 구분 필터를 적용한다.

## 5. 연결

MOD-003은 정상 읽기 결과만 previewImport/import로 전달한다. 설정 교체는 별도 선택한다. 동일 ID 다른 내용은 서버에서 전체 거부한다.

## 6. 리스크

서버 장애 시 localStorage에 자동 저장하거나 빈 배열로 원본을 덮지 않는다. 기존 기록과 서버 기록은 자동 합치지 않는다.

## 7. 대조·검증

실제 격리 브라우저에서 기존 5개 일정과 색상을 미리보기·가져오기 후 동일5개 건너뛰기를 확인했다. 기존 계획/작업·계층을 보존했다. 원본 키 쓰기 경로를 제거했고 API·DB 검증은 신규 소유 Task 결과를 참조한다. 공용 뷰어 시각 충실도·전체 제품 QA는 Review다. [근거](../../../../Document/Evidence/McpWorkspace/README.md).
