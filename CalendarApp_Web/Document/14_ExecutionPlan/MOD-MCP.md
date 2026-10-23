# MOD-MCP 실행계획

## 책임과 Task

공식 MCP SDK stdio로 context/list/get/create-tree/update/move/delete/settings를 제공한다. 쓰기 requestId와 expectedRevision을 요구하고 API 공개 계약만 호출한다. stdout은 프로토콜만, 진단은 stderr다. 서버/DB 시작·종료를 하지 않는다.

| 순서 | Task | 모드 | Write Set | 상태 |
| --- | --- | --- | --- | --- |
| 1 | [TASK-001](MOD-MCP/TASK-001.md) | SEQUENTIAL/NONE | mcp/*, package.json, package-lock.json | Review |

계약 확정 → 모듈 구현·검증·문서 대조 → 최종 조립의 의존 순서를 따른다. App/서버 조립은 별도 소유 Task다.
