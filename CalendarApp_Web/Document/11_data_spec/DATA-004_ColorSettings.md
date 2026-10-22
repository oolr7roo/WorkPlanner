# DATA-004 단계별 색상 프리셋

[상위 데이터](../11_DataRequirements.md), [저장 계약](../12_api_spec/API-001_LocalStorage.md), [형식](../../../src/features/schedules/types.ts), [검증·계산 정책](../../../src/features/schedules/scheduleColors.ts). FR-013·014를 지원한다.

| 필드 | 형식 | 제약 |
| --- | --- | --- |
| version | 정수 | 1 |
| activePresetId | 문자열 | presets에 존재하는 id |
| presets | 배열 | 한 개 이상 |
| presets[].id | 문자열 | 공백만으로 구성 불가·고유 |
| presets[].name | 문자열 | 저장 시 trim·빈 이름 거부 |
| presets[].colors | 문자열 배열 | 각 값 #RRGGBB; 대소문자 구분 없이 서로 다른 색 두 개 이상 |

기본 프리셋은 id=default, 이름=기본 단계별 색상, 색상=#3366dd/#16845b/#c56a15/#8053bd다. 없으면 기본값을 메모리에 제공하며 자동 저장하지 않는다. 키는 workplan-calendar-color-presets-v1이며 같은 브라우저 origin·프로필에서만 보존한다. 서버·DB 전송은 없다.

설정 팝업은 복제한 초안을 편집한다. 저장 어댑터의 동기 쓰기가 성공한 다음 Hook이 활성 상태를 바꾼다. 손상·읽기 차단 시 기본색과 오류를 표시하고 원본을 보존한다. 쓰기 실패 시 기존 활성 설정과 원본을 보존한다. 사용자가 확인하고 명시적으로 저장하면 해당 키를 대체한다.

자동 일정은 최상위를 1단계로 하여 배열을 순환한다. 후보가 부모 실제 표시색과 같으면 다음 다른 색을 사용한다. 부모의 직접 지정 색상도 비교 대상이다. 일정 원본 DATA-001과 달리 표시색은 파생값이며 프리셋 변경만으로 일정 원본을 재저장하지 않는다. 기존 colorMode 누락 일정은 직접 지정으로 취급한다. 계층은 들여쓰기와 이름으로도 표현한다.

다중 탭 동기화·서버 공유·접근성 적합성 전체 인증·사용자별 설정은 범위 밖이다. 검증은 [범위 보고서](../Evidence/ColorPresets/README.md)를 참조하며 전체 문서 상태는 Review다.
