# infrastructure 운영 상세

## 1. 운영 환경

기본 loopback 웹·DB와 root hash별 IPC. 별도 stage/prod 없음.

## 2. 빌드 기준

Node·Vite·PG 도구와 플랫폼별 실행 스크립트 확인. PG_BIN은 macOS 도구 경로 선택 옵션이다.

## 3. 배포 기준

start.command/start.bat→DB→Vite→control→wait --open. macOS 시작 스크립트는 vite 존재·import 사전 검사도 수행한다.

## 4. 릴리스 / 롤백 기준

stop.command/stop.bat→Vite close→DB fast stop→control close. 기존 실행 서비스 소유권을 확인한다. 종료 실패 시 로그와 process 상태를 대조한다.

## 5. 모니터링 / 로그 기준

supervisor.log, supervisor-error.log(Windows), postgres[-macos].log. metric·알림·로그 회전·보관 기간 없음.

## 6. 장애 대응 기준

포트 충돌·stale socket·비정상 초기화·외부 DB·브라우저 열기 실패를 분리한다. status를 HTTP/DB health로 오인하지 않는다.

## 7. 보안 / 권한 기준

신규 macOS 비밀 파일·control socket 0600, initdb SCRAM. Windows ACL와 기존 파일 권한은 검증 필요.

## 8. 확인 필요 사항

설치 도구 버전 일치·OS별 shutdown·control 권한·정상 복구 실측 미확정.

[공통 운영](../../16_DeploymentOperationsRequirements.md).
