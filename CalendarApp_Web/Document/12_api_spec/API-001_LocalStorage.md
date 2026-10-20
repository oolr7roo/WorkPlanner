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
