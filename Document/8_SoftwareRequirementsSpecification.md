# 소프트웨어 요구사항 명세

## 적용 범위

[6_FunctionalRequirements](6_FunctionalRequirements.md)와 [7_SystemConditions](7_SystemConditions.md)를 결합하고 9~16번 구현 도메인별 상세의 입력을 정의한다. 2026-10-23 승인된 공통 저장·로컬 AI 제어·명시적 이전을 포함한다. 책임 확정과 전체 운영 환경 검증을 구분한다.

## 구현 도메인 정의

| 구현 도메인 ID | 도메인 | 담당 범위 | 선택 근거 | 상태 |
| --- | --- | --- | --- | --- |
| web | Web | 개인 달력·공통 일정 제어·AI 연결 | FR-001~008, FR-013~019 | 확정 |
| database | Database | 로컬 데이터베이스 준비·일정 보존 | FR-010, FR-017~019 | 확정 |
| infrastructure | Infrastructure | 프로세스·설정·연결 준비·비공개 파일 보호 | FR-009, FR-011, FR-012 및 공통 저장 협력 | 확정 |

## 도메인별 구현 범위

| 구현 도메인 ID | 구현 내용 | 주 책임 기능 | 협력 기능 | 관련 품질·조건 |
| --- | --- | --- | --- | --- |
| web | 일정 사용 경험·공통 일정 제어·AI 연결 | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019 | FR-012 | 관련 행의 NFR·SA·CT |
| database | DB 준비·공통 기록 보존·정합성 | FR-010 | FR-002, FR-003, FR-004, FR-005, FR-007, FR-008, FR-011, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019 | 관련 행의 NFR·SA·CT |
| infrastructure | 실행 환경·연결 준비·비공개 경로 보호 | FR-009, FR-011, FR-012 | FR-002, FR-003, FR-004, FR-005, FR-007, FR-008, FR-010, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019 | 관련 행의 NFR·SA·CT |

## 통합 구현 요구사항

| 기능 ID | 구현 요구사항 | 주 구현 도메인 | 협력 구현 도메인 | 품질·완료 기준 | 적용 전제 | 적용 제약 | 우선순위 | 차단 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FR-001 | 현재 기간 및 월·주·일 보기 탐색 | web | - | NFR-003 | SA-001, SA-003 | CT-001, CT-006 | Must | - |
| FR-002 | 새 일정 입력과 등록 | web | database, infrastructure | NFR-001 | SA-001, SA-003, SA-004 | CT-001, CT-005, CT-006 | Must | - |
| FR-003 | 기존 일정 내용 갱신 | web | database, infrastructure | NFR-001 | SA-001, SA-003, SA-004 | CT-001, CT-005, CT-006 | Must | - |
| FR-004 | 선택 일정 삭제 | web | database, infrastructure | NFR-001 | SA-001, SA-003, SA-004 | CT-001, CT-005, CT-006 | Must | - |
| FR-005 | 일정 이동·길이 조정 결과 반영 | web | database, infrastructure | NFR-001 | SA-001, SA-003, SA-004 | CT-001, CT-005, CT-006 | Must | - |
| FR-006 | 편집 초안을 반영하지 않고 종료 | web | - | NFR-002 | SA-001 | CT-001 | Must | - |
| FR-007 | 같은 개인 저장 범위의 일정 보존·복원 | web | database, infrastructure | NFR-001 | SA-001, SA-004 | CT-001, CT-005 | Must | - |
| FR-008 | 제목·기간 오류 및 저장 실패 안내 | web | database, infrastructure | NFR-002 | SA-001, SA-003, SA-004 | CT-001, CT-005, CT-006 | Must | - |
| FR-009 | 설정 검증과 로컬 실행·종료 제어 | infrastructure | - | NFR-004 | SA-004 | CT-002, CT-003, CT-004, CT-005 | Must | - |
| FR-010 | 로컬 데이터베이스 존재 확인·준비 | database | infrastructure | NFR-004 | SA-004 | CT-002, CT-003, CT-004, CT-005 | Must | - |
| FR-011 | 데이터베이스 프로세스 시작·정지 관리 | infrastructure | database | NFR-004 | SA-004 | CT-002, CT-003, CT-004, CT-005 | Must | - |
| FR-012 | 웹 제공과 비공개 파일 접근 차단 | infrastructure | web | NFR-005 | SA-004 | CT-002, CT-003, CT-004, CT-005 | Must | - |
| FR-013 | 단계별 색상 프리셋 편집·선택·보존 | web | database, infrastructure | NFR-001, NFR-002 | SA-001, SA-004 | CT-001, CT-005 | Must | - |
| FR-014 | 자동 색상 일괄 적용·개별 지정 우선 | web | database, infrastructure | NFR-001 | SA-001, SA-004 | CT-001, CT-005 | Must | - |
| FR-015 | 일정별 체크리스트 편집·보존 | web | database, infrastructure | NFR-001, NFR-002 | SA-001, SA-004 | CT-001, CT-005 | Must | - |
| FR-016 | 계획·작업 구분과 작업 중심 표시 | web | database, infrastructure | NFR-001, NFR-002 | SA-001, SA-004 | CT-001, CT-005 | Must | - |
| FR-017 | 웹·AI가 같은 개인 일정·색상 설정을 보존·조회·변경 | web | database, infrastructure | NFR-001, NFR-002, NFR-005 | SA-001, SA-003, SA-004 | CT-001, CT-002, CT-004, CT-005, CT-006 | Must | - |
| FR-018 | 로컬 AI 연결로 일정과 계층·순서를 제어 | web | database, infrastructure | NFR-001, NFR-005 | SA-001, SA-003, SA-004 | CT-001, CT-002, CT-005, CT-006 | Must | - |
| FR-019 | 기존 브라우저 기록을 미리보기 후 원본 보존하며 가져오기 | web | database, infrastructure | NFR-001, NFR-002 | SA-001, SA-002, SA-004 | CT-001, CT-005, CT-006 | Must | - |

FR-017~019는 기존 일정·색상·체크리스트·구분의 의미를 바꾸지 않고 같은 개인 저장 범위를 웹과 AI에서 사용하도록 한다. 입력 실패·취소는 원본을 바꾸지 않으며 다른 변경과 충돌하면 사용자가 최신 내용을 다시 확인한다. 같은 요청 재시도는 중복 반영하지 않는다. 신규 기본 구분은 계획, 구분 없는 과거 기록은 작업으로 유지한다. 삭제 시 하위 기록을 보존한다.

## 도메인 간 연결

| 송신 도메인 | 수신 도메인 | 전달 목적 | 관련 기능 | 상세 명세 시점 |
| --- | --- | --- | --- | --- |
| infrastructure | web | 실행 환경과 공통 저장 연결의 준비·실패 전달 | FR-012, FR-017~019 | 각 도메인 12번·14번 |
| infrastructure | database | 데이터베이스·공통 저장 준비 요청 | FR-010, FR-011, FR-017 | 각 도메인 12번·14번 |
| database | infrastructure | 준비·종료 결과와 실패 반환 | FR-010, FR-011, FR-017 | 각 도메인 12번·14번 |
| web | database | 일정·설정 조회·변경·이전 요청 | FR-002~005, FR-007, FR-008, FR-013~019 | 각 도메인 12번·14번 |
| database | web | 보존 결과·최신 기록·충돌·실패 반환 | FR-002~005, FR-007, FR-008, FR-013~019 | 각 도메인 12번·14번 |

Web은 사용자 입력·업무 판단·AI 연결을, Database는 기록 보존과 정합성을, Infrastructure는 준비·실행·종료를 소유한다. 원격 연결과 다중 사용자 공유는 현재 범위 밖이며 적용 조건은 7번 SA·CT를 따른다. 내부 모듈·전송 필드·제품별 기술 계약은 각 도메인의 후속 문서에서 정의한다.

## FR-018 신규 등록 미리보기 기준선

UF-010의 AI 신규 등록은 제안 접수 → 웹 검토·선택·수정 → 명시적 확정이다. 주 책임 web(표시·입력·서비스·MCP), 협력 database(초안 보관·원자성), infrastructure(새 테이블 앱 계정 권한)다. Web API-006/DATA-008/MOD-004와 각 소유 Task를 따른다. 신규 알림·반복 일정·원격 인증은 추가하지 않는다.
