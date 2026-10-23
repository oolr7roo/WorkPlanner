# MOD-ScheduleService 실행계획

## 책임과 Task

기존 순수 정책을 Node에서도 재사용한다. DTO 정규화/검증과 서비스 command 처리·effective 결과·원자적 create-tree·import preview를 소유한다. DB 구현은 repository 공개 계약으로만 호출한다.

| 순서 | Task | 모드 | Write Set | 상태 |
| --- | --- | --- | --- | --- |
| 1 | [TASK-001](MOD-ScheduleService/TASK-001.md) | SEQUENTIAL/NONE | server/schedules/*, server/http/api.mjs, src/features/schedules/scheduleKinds.ts, tsconfig.json | Review |

계약 확정 → 모듈 구현·검증·문서 대조 → 최종 조립의 의존 순서를 따른다. App/서버 조립은 별도 소유 Task다.

## AI 등록 미리보기 확장

기존 TASK-001의 기준선에 API-006을 반영한다. 의존 순서는 DB 초안 저장 → 서비스·인증 → MCP·웹 → App 조립 → 격리 통합 검증이다. 초안 수명/입력/확정의 소유권은 해당 Task에 기록하며 새로 중복 Task를 만들지 않는다.
