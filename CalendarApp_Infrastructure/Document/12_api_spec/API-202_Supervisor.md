# API-202 Supervisor 운영 계약

## 1. 기본 정보

FR-009의 로컬 CLI·IPC 계약이며 Supervisor가 제공하고 시작·종료 스크립트가 소비한다. [상위 API](../12_APISpecification.md).

## 2. 엔드포인트 / 채널 / 메서드

CLI는 `node server.mjs [start|stop|status|wait]`; 기본값 start다. wait는 선택적으로 --open을 받는다. IPC endpoint는 Windows named pipe 또는 시스템 tmp의 calendarapp-<root hash>.sock이다.

## 3. 요청

IPC `ping
`, `stop
`. 일반 요청 timeout은 3초, stop 응답은 40초, wait 준비 조회는 최대 120회·500ms 간격이다. CLI start는 DB 준비→Vite listen→control listen 순으로 실행한다.

## 4. 응답

ping은 running, stop은 stopped, 알 수 없는 IPC는 unknown command. CLI status는 running/stopped 문자열을 출력하고 stopped에서 exit 1이다. wait 준비 후 URL과 DB 포트를 출력하고 --open이면 OS 브라우저 열기를 호출한다.

## 5. 에러

중복 직접 start, 제어 timeout, 포트 충돌, 준비 실패는 오류다. POSIX stale socket은 실제 socket이고 감독자가 없을 때만 제거하며 일반 파일이면 실패한다. shutdown은 Vite 닫기→관리 중 DB 정지→control 닫기 순이고 오류를 모아 전달한다. 신호·uncaughtException·unhandledRejection에서도 shutdown을 시도한다.

## 6. 관련 데이터

DATA-202. status는 감독 프로세스 ping 기준이며 HTTP·DB 건강 상태를 보장하지 않는다. [데이터](../11_DataRequirements.md).

## 7. 확인 필요 사항

종료 응답과 socket close의 실제 완료 경계, Windows pipe 동작, 외부 DB를 발견한 경우의 stop 범위는 운영 검증 필요다. 감독자가 없을 때 stop은 stopPostgres를 직접 호출한다.
