# CalendarApp Web 인터페이스

## 1. 인터페이스 범위

| 포함 / 제외 | 내용 | 이유 |
| --- | --- | --- |
| 포함 | 브라우저 저장소·난수 API, 달력 SDK props·콜백 | 애플리케이션과 외부 실행 환경의 경계 |
| 제외 | App 내부 함수, 일정 REST·GraphQL·WebSocket | 내부 함수 또는 존재하지 않는 계약 |

## 2. 공통 규칙

브라우저 API와 SDK 계약이다. 날짜는 offset 없는 현지 문자열이며 UTC 전환이나 표준 시간대 서버 보정이 없다. 저장은 v2 키를 사용하고 v2가 없으면 v1 데이터를 호환 변환한다. v1 원본은 보존한다.

## 3. 인증 / 권한

| 구분 | 방식 | 적용 인터페이스 | 확인 필요 사항 |
| --- | --- | --- | --- |
| 브라우저 저장소 | 동일 origin 권한, 사용자 로그인 없음 | API-001 | 프로필 접근·기업 정책 |
| UUID | crypto.randomUUID | API-002 | 지원 브라우저와 안전한 실행 컨텍스트 |
| SDK | 앱이 props를 제공하고 콜백 수신 | API-003 | 라이브러리 버전별 동작 |

## 4. 인터페이스 목록

| API ID | 이름 | 유형 | 용도 | 호출 Module | Data | UI 사용 위치 | 상세 문서 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API-001 | localStorage | browser API | 일정 읽기·쓰기 | BrowserEventStore | DATA-001, DATA-003 | COMMON-003.json#storage-error | [계약](12_api_spec/API-001_LocalStorage.md) | Review |
| API-002 | crypto.randomUUID | browser API | 새 일정 ID 생성 | EventManagement | DATA-001 | MOD-001.json#save | 호출 입력 없음, UUID 문자열 반환; 저장 시 호출 | Review |
| API-003 | Calendar SDK | SDK | 보기·선택·이동·리사이즈 | App UI | DATA-001, DATA-002 | SCR-001~003.json#calendar, COMMON-002.json#toolbar | [계약](12_api_spec/API-003_CalendarSDK.md) | Review |

[모듈](10_ModuleMapping.md), [데이터](11_DataRequirements.md). 일정 데이터는 HTTP로 전달되지 않는다.

## 색상 설정 저장 확장

기존 API-001 localStorage 계약에 DATA-004 별도 키를 추가한다. UI는 저장 어댑터 함수를 거치며 프리셋 저장 성공 후에만 화면 설정을 갱신한다. 네트워크·DB 인터페이스는 추가하지 않는다.
