# TASK-001 MCP 구현

## 1. 목적과 선행 조건

공식 SDK stdio 도구·리소스와 API 어댑터를 소유한다. FR-017~019. 선행 조건: MOD-ScheduleService/TASK-001 공개 API 검증 완료.

## 2. 대상과 소유권

Write Set: mcp/client.mjs·server.mjs·config.example.json·README.md, package.json·lock. Read-only: 기존 운영 데이터·브라우저 원본·외부 SDK source. 부모 14번 모듈 문서와 10·11·12번 현재 계약을 따른다. DB 직접 참조는 repository, 업무 판단은 service, 프로토콜은 MCP, 표시·초안은 UI로 분리한다.

## 3. 실행 흐름

계약 확정 → 모듈 구현 → 격리 검증 → 문서·실제 결과 대조 → 필수 차이 해소 → 조립 인계. SEQUENTIAL/NONE. 신규 단위 테스트 파일은 생성하지 않고 실제 모듈·SDK·격리 DB·브라우저를 검증 수단으로 사용한다.

## 4. 데이터·API 연결

Web DATA-001~007·API-004/005, Database DATA-103/104·API-102. 입력 JSON 검증 → 정규 모델 → 저장 snapshot → 표시 투영의 책임을 분리한다. expectedRevision/requestId로 충돌·재시도를 제어하고 오류는 code/message로 전달한다. MOD-003은 WorkspaceClient가 단독 소유하며 API-004 previewImport/import를 사용한다.

## 5. 리스크와 실패 정책

동시 수정·중복 재시도·잘못된 계층·부분 생성·시간대·DB 실패를 검증한다. 기존 원본을 덮거나 연결 실패를 빈 저장으로 대체하지 않는다. 로컬 stdio·loopback만 지원한다. token·DB 자격은 .runtime에만 보관한다.

## 6. 조립 경계

최종 API·프로세스 조립은 Infrastructure MOD-Supervisor/TASK-003, React 조립과 편집 저장 상태는 Web SCR-001/TASK-001·MOD-EventManagement Task가 소유한다. 조립은 repository/service/client/MCP의 공개 계약·모듈 검증을 선행 조건으로 한다. 통합 검증은 조립 이후 실행한다.

## 7. 완료 기준·실제 대조

실제 격리 PostgreSQL과 공식 MCP SDK client의 8개 도구·resource, atomic tree·revision 충돌·동일 재시도·실패 rollback·삭제 자식 승격·권한 거부가 통과했다. 웹에서 MCP 생성 일정을 수정하고 MCP로 제목·체크리스트 재조회, 기존5개 preview/import·동일5개 skip, 충돌 초안 유지까지 확인했다. TypeScript·Vite6.4.5 빌드와 의존성 audit0건을 확인했다. 코드 경계와 위 계약을 대조해 필수 기능 차이를 해소했다. 공용 WireFrame 시각/참조 문서 열기·macOS·원격·전체 제품 QA는 별도 Review 범위다. [실행 근거](../../../../Document/Evidence/McpWorkspace/README.md).
