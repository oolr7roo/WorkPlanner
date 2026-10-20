# CalendarApp 배포 운영 요구사항

## 1. 운영 환경

현재는 개인 PC의 로컬 개발 실행이며 dev·stage·prod 분리나 원격 서비스 배포는 없다. Windows는 포함된 PostgreSQL runtime, macOS는 설치 도구를 사용한다. 웹 URL은 http://127.0.0.1:5173/, DB는 127.0.0.1:55432다. 프로젝트 위치·포트·브라우저 프로필이 일정 보존 범위에 영향을 준다.

## 2. 빌드 기준

`npm ci`로 잠금 파일 기준 의존성을 준비한 뒤 `npm run build`로 TypeScript noEmit과 Vite build를 통과시킨다. dist가 정적 빌드 산출물이다. 현재 start는 dist의 운영 서버가 아니라 Vite 개발 서버를 실행한다. `npm run preview`는 정적 미리보기이며 DB와 감독자 IPC를 시작하지 않는다.

## 3. 배포 기준

OPS-001: 로컬 전달 시 코드·package-lock·스크립트와 해당 플랫폼 PostgreSQL 도구의 준비를 확인한다. 비밀 파일·DB 데이터·브라우저 프로필을 공개 산출물에 혼입하지 않는다. macOS는 start.command, Windows는 start.bat을 사용한다. 운영 릴리스 자동화·CI·원격 배포 승인은 구현되어 있지 않다.

## 4. 릴리스 / 롤백 기준

OPS-002: 현재 package version은 1.0.0이다. 운영 전달 전 변경 범위·검증 결과·설정 차이·데이터 호환을 기록한다. 코드 롤백은 현재 origin·저장 키·데이터 형식을 유지하는지 확인해야 하며, 코드 복원만으로 브라우저 삭제 기록을 되살릴 수 없다. DB raw 디렉터리를 서로 다른 플랫폼에 복사하는 방식은 지원된 이관으로 간주하지 않는다.

## 5. 모니터링 / 로그 기준

OPS-003: 감독 status는 IPC ping이고 서비스 건강 점검이 아니다. postgresql/supervisor.log, Windows supervisor-error.log, postgres.log 또는 postgres-macos.log를 확인한다. 자동 metric·로그 회전·보존 기간·알림은 없고 운영자 수동 확인에 의존한다. 비밀 내용·개인 일정은 로그에 기록하지 않는다.

## 6. 장애 대응 기준

OPS-004: 시작 실패는 Node·의존성→포트 설정→PG 도구→클러스터·인증→웹 포트→control 순서로 로그와 상태를 확인한다. 미완료 data-macos는 삭제하지 않고 복구 또는 별도 보관을 판단한다. 저장 실패는 브라우저 경고와 프로필·정책·용량을 확인하고 재로드 전에 메모리만 남은 일정의 손실 가능성을 설명한다. 자동 export·backup UI는 없다. 담당자와 사후 기록 책임은 프로젝트 운영자이며 공식 RTO·RPO는 미정이다.

## 7. 보안 / 권한 기준

OPS-005: 웹과 DB의 loopback 바인딩, 웹 DB 경로 차단, macOS 신규 비밀 파일·socket 0600을 유지한다. 웹 로그인·DB 앱 전용 계정·원격 인증·Windows ACL 강화가 이미 적용되었다고 서술하지 않는다. 비밀 파일 내용은 문서나 캡처에 포함하지 않는다. 종료 명령은 운영 상태를 바꾸므로 작업 중 서비스 소유 범위를 먼저 확인한다.

## 8. 확인 필요 사항

도메인 상세: [Web](16_DeploymentOperationsRequirements/Domain/web.md), [Database](16_DeploymentOperationsRequirements/Domain/database.md), [Infrastructure](16_DeploymentOperationsRequirements/Domain/infrastructure.md). 공식 지원 OS·브라우저·최소 사양·로그 보관·알림·백업 주기·RTO/RPO·릴리스 승인 담당은 미확정이다. 실행 구현: [server](../server.mjs), [DB 관리](../postgresql/manage.mjs), [설정](../runtime-config.mjs).
