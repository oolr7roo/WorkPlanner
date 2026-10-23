# 소프트웨어 요구사항 명세

## 적용 범위

[6_FunctionalRequirements](6_FunctionalRequirements.md)와 [7_SystemConditions](7_SystemConditions.md)를 결합한다. 확정은 기존 구현 책임의 분류이며 고객 승인·실측 완료를 뜻하지 않는다.

## 구현 도메인 정의

| 구현 도메인 ID | 도메인 | 담당 범위 | 선택 근거 | 상태 |
| --- | --- | --- | --- | --- |
| web | Web | 개인 달력과 브라우저 일정 관리 | FR-001~008, FR-013~016 | 확정 |
| database | Database | 로컬 데이터베이스 존재 확인·생성 | FR-010 | 확정 |
| infrastructure | Infrastructure | 프로세스·설정·loopback 웹 제공 | FR-009, FR-011, FR-012 | 확정 |

## 도메인별 구현 범위

| 구현 도메인 ID | 구현 내용 | 주 책임 기능 | 협력 기능 | 관련 품질·조건 |
| --- | --- | --- | --- | --- |
| web | 일정 사용 경험 | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-013, FR-014, FR-015, FR-016 | FR-012 | NFR-001~003, SA-001~003, CT-001 |
| database | DB 준비 계약 | FR-010 | FR-011 | NFR-004, SA-004, CT-004 |
| infrastructure | 실행 환경 관리 | FR-009, FR-011, FR-012 | FR-010 | NFR-004~005, SA-004, CT-002~004 |

## 통합 구현 요구사항

| 기능 ID | 구현 요구사항 | 주 구현 도메인 | 협력 구현 도메인 | 품질·완료 기준 | 적용 전제 | 적용 제약 | 우선순위 | 차단 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FR-001 | 현재 기간 및 월·주·일 보기 탐색 | web | - | NFR-003 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-002 | 새 일정 입력과 등록 | web | - | NFR-001 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-003 | 기존 일정 내용 갱신 | web | - | NFR-001 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-004 | 선택 일정 삭제 | web | - | NFR-001 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-005 | 일정 이동·길이 조정 결과 반영 | web | - | NFR-001 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-006 | 편집 초안을 반영하지 않고 종료 | web | - | NFR-002 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-007 | 같은 사용 환경의 일정 보존·복원 | web | - | NFR-001 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-008 | 제목·기간 오류 및 저장 실패 안내 | web | - | NFR-002 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-009 | 설정 검증과 로컬 실행·종료 제어 | infrastructure | - | NFR-004 | SA-004 | CT-002, CT-003, CT-004 | Must | - |
| FR-010 | 로컬 데이터베이스 존재 확인·준비 | database | infrastructure | NFR-004 | SA-004 | CT-002, CT-003, CT-004 | Must | - |
| FR-011 | 데이터베이스 프로세스 시작·정지 관리 | infrastructure | database | NFR-004 | SA-004 | CT-002, CT-003, CT-004 | Must | - |
| FR-012 | 웹 제공과 DB 파일 접근 차단 | infrastructure | web | NFR-005 | SA-004 | CT-002, CT-003, CT-004 | Must | - |
| FR-013 | 단계별 색상 프리셋 편집·선택·보존 | web | - | NFR-001·002 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-014 | 자동 색상 일괄 적용·개별 지정 우선 | web | - | NFR-001 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-015 | 일정별 체크리스트 편집·보존 | web | - | NFR-001·002 | SA-001, SA-002, SA-003 | CT-001 | Must | - |
| FR-016 | 계획·작업 구분과 작업 중심 표시 | web | - | NFR-001·002 | SA-001, SA-002, SA-003 | CT-001 | Must | - |

## 도메인 간 연결

| 송신 도메인 | 수신 도메인 | 전달 목적 | 관련 기능 | 상세 명세 시점 |
| --- | --- | --- | --- | --- |
| infrastructure | web | 브라우저에 제공하는 달력 실행 환경 | FR-012 | 도메인 12·14번 |
| infrastructure | database | 데이터베이스 준비 요청 | FR-010, FR-011 | 도메인 12·14번 |
| database | infrastructure | 존재·준비 결과와 실패 반환 | FR-010 | 도메인 12·14번 |

Web→Database 일정 저장 계약은 존재하지 않는다. database 책임은 파일 경계와 무관하게 같은 DB 관리 파일 안에서 실행되는 논리 책임이다. Unity·Dedicated Server·AI 도메인은 구현 근거가 없어 선택하지 않는다.

## 단계별 색상 확장 (2026-10-22)

UF-009 → FR-013, UF-002·UF-003 → FR-014를 Web 주 책임으로 확정한다. 기존 NFR-001·002와 동일 브라우저 저장 제약을 적용한다. Database·Infrastructure 변경은 없다.

FR-013·014의 도메인 책임과 품질 조건은 위 통합 구현 요구사항 표를 따른다.


## 2026-10-23 체크리스트와 색상 편집 조정

[기능 요구사항](6_FunctionalRequirements.md)의 FR-014 색상 편집 기준을 따른다. FR-015는 Web이 단독 주 책임이며 NFR-001·002, 기존 SA·CT의 동일 브라우저 보존 조건을 적용한다. 완료 기준은 항목 추가/수정/체크/삭제·저장/취소·기존 데이터 호환이며 다른 구현 도메인과 신규 전송 계약은 없다.
