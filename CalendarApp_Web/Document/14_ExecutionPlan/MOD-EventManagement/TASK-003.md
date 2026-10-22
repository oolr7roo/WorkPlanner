# TASK-003 단계별 색상 정책과 설정 상태

## 1. 작업 목적과 전체 처리 흐름

소유: [MOD-EventManagement](../MOD-EventManagement.md). 2026-10-22 사용자 승인. FR-013·014, DATA-004·API-001.

계약 확정 → 순수 계산·저장 경계 → UI 구현 → App 조립 → 격리 검증 → 문서 대조·차이 해소.

## 2. 단계별 실제 작업

- 목적: 단계별 색상 정책과 설정 상태.
- 입력: 10·11·12번의 책임·데이터·저장 계약.
- 처리: 순수 프리셋 검사·표시색 계산과 설정 Hook. 저장 어댑터 공개 readColorSettings/writeColorSettings만 사용한다.
- 출력: src/features/schedules/scheduleColors.ts, src/features/schedules/useScheduleColorSettings.ts.
- 완료 조건: 범위 검증·문서 대조 완료; App 조립 뒤 통합 검증은 SCR-001/TASK-001과 함께 확인.

## 3. 데이터·API 연결

DATA-004는 [데이터](../../11_DataRequirements.md), API-001은 [인터페이스](../../12_api_spec/API-001_LocalStorage.md)를 참조한다. 일정 정본과 프리셋 설정은 별도 저장 키다.

## 4. 도메인과 Workflow

Web React/TypeScript 기존 파일 경계를 유지한다. 전용 구현 템플릿 없음; 기존 Hook·순수 함수·어댑터 구조를 사용한다.

## 5. 리스크·작업 범위

- Write Set: src/features/schedules/scheduleColors.ts, src/features/schedules/useScheduleColorSettings.ts 및 이 Task·대응 메타데이터.
- 참조: types.ts, 기존 저장소·일정 Hook·App 및 10·11·12번.
- 금지: 운영 origin 데이터·DB·서버·외부 패키지·기존 날짜 보정.
- 손상 설정·쓰기 실패는 원본과 활성 설정을 보존하며 명시적 저장에서만 대체한다. 색상만으로 계층을 전달하지 않는다.
- 범위 밖 수정·손상 원본 덮어쓰기 필요 시 중단하고 영향 판정을 갱신한다.

## 6. 전환과 모듈 책임

순수 프리셋 검사·표시색 계산과 설정 Hook. 저장 어댑터 공개 readColorSettings/writeColorSettings만 사용한다. 순환 의존을 만들지 않으며 App은 생성·연결만 담당한다.

## 7. 완료 기준과 검증 방법

타입·빌드·JSON 검사, 정책 경계값 직접 실행, 격리 브라우저에서 프리셋 저장·취소·복원·기존 색상·다섯 보기·신규/하위 일정·직접 색상 우선·모바일·Escape를 검증한다. 실패·미검증을 통과로 기록하지 않는다. 신규 테스트 파일은 작성하지 않는다.

## 8. 실행 경계

SEQUENTIAL / NONE. 선행: 문서 계약 확정; 저장 어댑터 연결 전 순수 색상 정책부터 검증. 공유 계약·App 파일 때문에 병렬 실행하지 않는다. 최종 조립과 전체 검증은 하위 모듈 계약을 확인한 뒤 수행한다.


2026-10-22 범위 검증: 정책·저장 경계 26건, 격리 브라우저의 프리셋 저장/취소/복원·다섯 보기·신규/하위·직접 색상 보존·자식 승격·모바일·날짜 보정 회귀 확인. [검증 근거](../../Evidence/ColorPresets/README.md). 저장 실패 UI 전체 경로와 공용 renderer 충실도는 미검증이며 Review를 유지한다.
