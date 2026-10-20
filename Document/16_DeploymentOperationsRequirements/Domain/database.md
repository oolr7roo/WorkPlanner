# database 운영 상세

## 1. 운영 환경

DB calendarapp은 준비 대상이며 일정 테이블·저장 API는 없다.

## 2. 빌드 기준

PostgreSQL 도구 설치와 cluster 버전 일치를 별도 확인한다.

## 3. 배포 기준

start 전에 대상 클러스터·포트·인증 파일의 존재를 확인한다. 관리자 자격값은 출력하지 않는다.

## 4. 릴리스 / 롤백 기준

업무 migration 없음. 향후 schema 변경은 백업→호환→격리 검증→적용→복구 검증의 별도 Task가 필요하다. raw 데이터 플랫폼 복사 금지.

## 5. 모니터링 / 로그 기준

DB 로그와 pg_ctl 상태를 확인한다. 자동 backup job·RPO·RTO 없음.

## 6. 장애 대응 기준

보관된 backups/windows-before-macos-20261005.tar.gz 존재는 복구 성공 근거가 아니다. 정지 상태 원본 보관 또는 논리 dump 복구 검증은 별도 운영 작업이다.

## 7. 보안 / 권한 기준

준비는 postgres 관리자 권한이며 앱 전용 최소 권한 계정은 없다. 보존 데이터의 민감도는 실제 내용 확인 필요.

## 8. 확인 필요 사항

백업 주기·복구 목표·보존 기간·동시 준비 경합·Windows 운영 미검증.

[공통 운영](../../16_DeploymentOperationsRequirements.md).
