# MOD-ScheduleService 실행계획

## 책임과 Task

기존 순수 정책을 Node에서도 재사용한다. DTO 정규화/검증과 서비스 command 처리·effective 결과·원자적 create-tree·import preview를 소유한다. DB 구현은 repository 공개 계약으로만 호출한다.

| 순서 | Task | 모드 | Write Set | 상태 |
| --- | --- | --- | --- | --- |
| 1 | [TASK-001](MOD-ScheduleService/TASK-001.md) | SEQUENTIAL/NONE | server/schedules/*, server/http/api.mjs, src/features/schedules/scheduleKinds.ts, tsconfig.json | Review |

계약 확정 → 모듈 구현·검증·문서 대조 → 최종 조립의 의존 순서를 따른다. App/서버 조립은 별도 소유 Task다.
