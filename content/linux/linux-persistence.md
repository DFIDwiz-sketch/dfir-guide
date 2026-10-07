---
title: "Linux 지속성 조사"
description: "서비스·timer·cron과 SSH 접근 설정에서 변경과 실제 실행을 구분합니다."
category: "linux"
updated: "2026-10-07"
tags: ["Linux", "지속성", "systemd"]
order: "8"
level: "입문"
---

## 지속성 설정과 실행을 구분하기

지속성은 재부팅·로그인 또는 특정 조건 후 다시 실행될 수 있는 경로를 만드는 행동입니다. 설정 파일이 존재한다는 사실, 설정이 활성화됐다는 사실, 실제로 실행됐다는 사실은 서로 다른 증거입니다.

## 확인할 영역

| 영역 | 조사 관점 |
| --- | --- |
| systemd 서비스와 timer | unit 내용, drop-in, 실행 파일·계정과 활성 상태 |
| cron | 시스템·사용자 작업, 실행 주기와 명령 |
| SSH 접근 | 승인된 공개키, 계정과 접근 정책의 변경 |
| 셸·로그인 설정 | 자동 실행되는 설정과 쓰기 권한 |
| 실행 파일 | 해시·소유자·권한과 수집 당시 내용 |

설치된 소프트웨어, 관리 자동화와 정상 계정 변경을 기준으로 비교합니다. 모든 시스템이 systemd를 사용하는 것은 아니므로 먼저 배포판과 서비스 관리 방식을 확인합니다.

## 조사 절차

1. 의심 설정의 원본을 보존하고 경로·권한·해시를 기록합니다.
2. 실행 파일과 인자를 추적해 다른 스크립트로 이어지는지 확인합니다.
3. journal·인증·감사 로그에서 수정한 계정과 실제 실행을 찾습니다.
4. 관련 프로세스와 연결을 네트워크 기록에 연결합니다.
5. 제거 전에 변경 이력과 다른 호스트의 동일 설정을 확인합니다.

## 현재 상태 확인 예시

```bash
systemctl list-unit-files --type=service
systemctl list-timers --all
```

이는 현재 systemd 상태를 조회합니다. 과거에 존재했던 작업을 빠짐없이 복원하는 명령은 아닙니다. 특정 unit의 내용과 journal 기록은 별도로 조사합니다.

## 참고자료

- [MITRE ATT&CK — Systemd Service T1543.002](https://attack.mitre.org/techniques/T1543/002/)
- [MITRE ATT&CK — Cron T1053.003](https://attack.mitre.org/techniques/T1053/003/)
- [journalctl(1)](https://man7.org/linux/man-pages/man1/journalctl.1.html)
