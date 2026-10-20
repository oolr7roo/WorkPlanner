# CalendarApp ProjectPlan 문서 안내

현재 구현 기준으로 ProjectPlan 1~16번과 선택된 Web·Database·Infrastructure 상세를 작성했다. 일정 정본은 브라우저 localStorage이고 PostgreSQL은 실행 환경 준비용이다. 문서 내용은 완성했으며 고객 승인·전체 QA·시각 renderer 적합성은 Review로 분리한다.

## 읽는 순서

| 번호 | 문서 |
| --- | --- |
| 1 | [CalendarApp 시장 조사](1_MarketResearch.md) |
| 2 | [CalendarApp 도메인 지식](2_DomainKnowledge.md) |
| 3 | [CalendarApp 문제 상태](3_PainPoint.md) |
| 4 | [CalendarApp 고객 요구사항](4_CustomerRequirements.md) |
| 5 | [CalendarApp 사용자 흐름](5_UserFlow.md) |
| 6 | [기능 요구사항](6_FunctionalRequirements.md) |
| 7 | [시스템 조건](7_SystemConditions.md) |
| 8 | [소프트웨어 요구사항 명세](8_SoftwareRequirementsSpecification.md) |
| 15 | [CalendarApp QA 테스트 계획](15_QATestPlan.md) |
| 16 | [CalendarApp 배포 운영 요구사항](16_DeploymentOperationsRequirements.md) |
| 17 | [CalendarApp 문서 작성 검증 보고서](17_ValidationReport.md) |

## 구현 도메인 상세

| 도메인 | 문서 루트 | 실행계획 |
| --- | --- | --- |
| web | [모듈·데이터·인터페이스](../CalendarApp_Web/Document/10_ModuleMapping.md) | [14_ExecutionPlan](../CalendarApp_Web/Document/14_ExecutionPlan.md) |
| database | [모듈·데이터·인터페이스](../CalendarApp_Database/Document/10_ModuleMapping.md) | [14_ExecutionPlan](../CalendarApp_Database/Document/14_ExecutionPlan.md) |
| infrastructure | [모듈·데이터·인터페이스](../CalendarApp_Infrastructure/Document/10_ModuleMapping.md) | [14_ExecutionPlan](../CalendarApp_Infrastructure/Document/14_ExecutionPlan.md) |

Web은 9~14번, Database·Infrastructure는 10·11·12·14번을 작성했다. UI가 없는 도메인에 9·13번 빈 문서를 생성하지 않았다. 15·16번은 공통 허브와 도메인 상세를 함께 제공한다. 실행계획은 상위→작업 흐름→Task의 세 단계다.

## 상태와 범위

문서 상태는 Review, metadata_state는 needs-review다. 구현 확인과 고객 승인·운영 검증은 별개다. QA 계획과 실제 검증 결과는 서로 다른 문서에 저장한다. 소스·DB·비밀 파일 내용은 수정하지 않았다. Git은 첫 커밋이 없는 저장소여서 미반영이다.

## 문서 참조 관계

각 문서의 직접 참조 경로와 이번 작업에서 읽은 원본은 [직접 참조 목록](Evidence/direct-references.json)에 기록한다. 외부 자료는 1번 문서의 공식 제품 도움말만 시장조사 근거로 사용했다. 규칙 사용 기록은 [DocSearch 선택 기록](Evidence/docsearch-selection.json)에 있다.
