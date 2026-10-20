# CalendarApp 시장 조사

## 1. 시장 개요

CalendarApp은 개인이 한 기기의 브라우저에서 일정 시간을 정리하는 로컬 달력이다. 현재 구현을 설명하는 문서이며 시장 규모, 매출, 점유율, 고객 인터뷰는 확보되지 않았다. 작성 기준일은 2026-10-05다.

## 2. 타겟 사용자

타겟은 개인 업무·학습 일정을 직접 입력하고 관리하는 사용자라는 구현 기반 가설이다. 조직 공동 일정이나 다기기 동기화를 필요로 하는 고객군은 현재 구현 범위를 벗어난다. 실제 수요와 지불 의사는 확인되지 않았다.

## 3. 경쟁 제품 목록

| 제품 | 설명 | 장점 | 단점 |
| --- | --- | --- | --- |
| Google Calendar | 계정 기반 일정 서비스 | 일정 작성과 공유 기능이 공식 도움말에 설명됨 | CalendarApp과의 로컬 실행 적합성 비교는 미검증 |
| Microsoft Outlook Calendar | 개인·조직 일정 서비스 | 캘린더 공유와 위임 권한 문서 제공 | 계정·조직 정책별 차이가 있어 일괄 비교 불가 |
| Apple Calendar | Mac 일정 앱 | 일정 생성·변경·삭제를 공식 안내 | Windows 대상 사용 적합성은 본 조사 범위 밖 |

확인 출처: [Google 일정 생성](https://support.google.com/calendar/answer/72143?hl=en), [Outlook 공유 권한](https://support.microsoft.com/en-us/outlook/sharing/share-and-access-a-calendar-with-edit-or-delegate-permissions-in-outlook), [Apple 일정 관리](https://support.apple.com/en-gb/guide/calendar/icalwr13-events/mac). 제품 기능의 존재만 확인했으며 가격·보안 우위·오프라인 지원 수준은 판정하지 않았다.

## 4. 기회 요소

계정 가입 없이 로컬 브라우저에서 기본 일정 작업을 수행하는 좁은 사용 목적이 현재 구현과 일치한다. 단순한 한국어 UI와 로컬 실행 스크립트가 사용 진입을 줄일 가능성은 가설이다. 데이터 보존과 접근성의 검증이 수요 주장보다 먼저 필요하다.

## 5. 확인 필요 사항

사용자 수요, 개인정보 취급 정책, 브라우저 데이터 삭제 시 수용 가능한 손실 범위, 지속 운영 비용은 미확정이다. 이 문서는 신규 기능을 약속하지 않는다.
