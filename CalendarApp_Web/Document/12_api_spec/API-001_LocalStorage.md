# API-001 localStorage 계약

BrowserEventStore가 FR-007·FR-008을 위해 getItem/setItem을 사용한다. 네트워크 전송은 없다.

- 일정 정본: workplan-calendar-events-v2, DATA-001 배열 JSON.
- v2가 없을 때 읽는 기존 키: workplan-calendar-events-v1. 기존 원본은 변경하지 않는다.
- 접힘 상태: workplan-calendar-collapsed-v1, 접힌 일정 id 배열 JSON.
- 복원 실패: 오류를 표시하고 일정 자동 쓰기와 변경 조작을 차단한다. 실패 원본을 빈 배열로 덮어쓰지 않는다.
- 쓰기 실패: 메모리 변경 유지, 저장 오류 표시. 다음 일정 변경 시 다시 시도한다.
- 접힘 상태 저장 실패: 화면 상태는 유지하고 별도 경고한다.

다중 탭 동시 편집은 마지막 쓰기가 우선하며 병합하지 않는다. 브라우저 origin·프로필을 옮기면 별개 저장소다.

[데이터](../11_data_spec/DATA-001_Events.md), [상위 API](../12_APISpecification.md).

## 단계별 색상 설정

- 키: workplan-calendar-color-presets-v1, DATA-004 설정 JSON. 일정 v2·v1·접힘 키와 분리한다.
- 누락: 기본 프리셋을 메모리에서 사용하며 자동 쓰지 않는다.
- 손상·읽기 실패: 기본 표시와 오류를 제공하고 원본을 자동 덮어쓰지 않는다. 복구는 사용자의 설정 저장으로만 수행한다.
- 쓰기 실패: 활성 설정과 원본은 유지하고 팝업 초안·오류를 유지한다.
- 기존 일정의 colorMode 부재는 manual로 해석한다. 새 필드가 있으면 auto/manual만 허용한다.
