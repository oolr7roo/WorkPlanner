# web 운영 상세

## 1. 운영 환경

동일 브라우저·origin localStorage가 일정 정본이다.

## 2. 빌드 기준

React·SDK·Tailwind CSS를 포함한 dist 생성; 현재 운영 start와 정적 preview 구분.

## 3. 배포 기준

WEB_PORT·host를 바꾸면 origin이 달라져 기존 일정이 안 보일 수 있다.

## 4. 릴리스 / 롤백 기준

저장 키 v1·offset 없는 날짜 호환을 확인한다. 앱에 migration·export 없음.

## 5. 모니터링 / 로그 기준

저장 실패 UI 경고를 확인한다. 성공 완료 로그·서버 일정 로그 없음.

## 6. 장애 대응 기준

새로고침 전 메모리 미저장 기록의 손실을 고려한다. 손상 읽기는 빈 배열로 대체될 수 있다.

## 7. 보안 / 권한 기준

브라우저 프로필 사용자 권한과 origin 스크립트 접근에 의존한다. 민감 일정 보호 정책 미정.

## 8. 확인 필요 사항

포커스·대비율·반응형 잘림·다중 탭 충돌·성능 상한 미검증.

[공통 운영](../../16_DeploymentOperationsRequirements.md).
