# MOD-WorkspaceClient 실행계획

## 책임과 Task

API 상태·비동기 오류·revision·5초 polling·legacy preview/import UI를 소유한다. DB/SQL 직접 접근과 localStorage 자동 쓰기를 금지한다.

| 순서 | Task | 모드 | Write Set | 상태 |
| --- | --- | --- | --- | --- |
| 1 | [TASK-001](MOD-WorkspaceClient/TASK-001.md) | SEQUENTIAL/NONE | src/features/schedules/useScheduleWorkspace.ts, workspaceApi.ts, useSchedules.ts, useScheduleColorSettings.ts, components/ScheduleImportDialog.tsx | Review |

계약 확정 → 모듈 구현·검증·문서 대조 → 최종 조립의 의존 순서를 따른다. App/서버 조립은 별도 소유 Task다.

## AI 등록 미리보기 확장

기존 TASK-001의 기준선에 API-006을 반영한다. 의존 순서는 DB 초안 저장 → 서비스·인증 → MCP·웹 → App 조립 → 격리 통합 검증이다. 초안 수명/입력/확정의 소유권은 해당 Task에 기록하며 새로 중복 Task를 만들지 않는다.
