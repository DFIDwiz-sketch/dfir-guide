---
title: "Linux 호스트 초기 조사"
description: "현재 프로세스·통신과 인증·서비스 로그를 연결하는 Linux 조사 흐름."
category: "linux"
updated: "2026-10-07"
tags: ["Linux", "호스트 포렌식", "journal"]
order: "7"
level: "입문"
---

## 목표와 준비물

Linux의 현재 상태를 조사하고 인증·서비스 로그와 연결합니다. 대상의 배포판, 조회 권한, 별도 수집 경로가 필요합니다. 명령은 살아 있는 시스템의 조회 예시입니다. 라이브 조회 자체가 프로세스·로그를 만들고 파일 접근 정보에 영향을 줄 수 있으므로 실행 내역을 기록합니다.

## 1단계 — 시스템과 시간 확인하기

```bash
hostname
cat /etc/os-release
date --iso-8601=seconds
uname -a
uptime -s
```

배포판·커널·호스트 이름과 부팅 시점을 적습니다. systemd 환경이라면 `timedatectl`로 시간대와 동기화 상태도 확인합니다. 명령이 없으면 배포판이나 최소 설치 환경의 차이를 확인합니다.

**확인할 결과:** 로그의 원래 시간대와 조사 구간, 현재 부팅 이후 자료인지 구분할 수 있어야 합니다.

## 2단계 — 프로세스와 연결의 현재 상태 보기

```bash
ps -eo pid,ppid,user,lstart,args --sort=pid
ss -tupna
```

`ps`에서 PID·PPID·사용자·시작 시각을 보고, `ss`에서 리스닝과 연결 상태를 구분합니다. 다른 사용자의 프로세스 정보는 권한에 따라 보이지 않을 수 있습니다. 현재 목록에는 이미 종료된 실행이나 연결이 없을 수 있습니다.

눈에 띄는 프로세스가 있다면 실제 조회한 PID로 다음 값을 바꿉니다.

```bash
suspect_pid=1234
ps -p "$suspect_pid" -o pid,ppid,user,lstart,args
readlink "/proc/$suspect_pid/exe"
tr '\0' ' ' < "/proc/$suspect_pid/cmdline"
```

프로세스가 종료되면 `/proc/<PID>`가 사라질 수 있습니다. `/proc`는 커널의 현재 상태 인터페이스이며 디스크 이미지에 당시 상태가 남아 있으리라 기대해서는 안 됩니다. 실행 파일 표시와 명령행도 변경되거나 조작될 수 있으므로 독립적인 로그와 함께 봅니다.

## 3단계 — 조사 시간의 journal 읽기

systemd journal을 사용하는 시스템의 예시입니다. 입력 시간에 UTC를 명시해 화면 표시 시간대와 혼동하지 않습니다.

```bash
journalctl --since "2026-10-07 00:00:00 UTC" \
  --until "2026-10-07 00:15:00 UTC" --utc --no-pager -o short-iso-precise
```

시간은 실제 조사 범위로 바꿉니다. SSH 서비스 이름은 배포판에 따라 `ssh.service` 또는 `sshd.service`일 수 있으므로 존재를 확인한 뒤 `-u` 필터를 적용합니다. `/var/log/auth.log`나 `/var/log/secure`도 설치·설정에 따라 없을 수 있습니다.

**확인할 결과:** 로그인·권한 사용·서비스 시작 등의 근거와 대상 시점입니다. journal 보존이 메모리 기반이면 재부팅 이후 과거 기록이 없을 수 있습니다. `journalctl --list-boots`로 보존된 부팅 구간을 확인합니다.

## 4단계 — 지속성 후보 살펴보기

```bash
systemctl list-unit-files --type=service
systemctl list-timers --all
crontab -l
```

`crontab -l`은 현재 계정의 항목입니다. 모든 사용자의 cron을 조사한 결과로 해석하지 않습니다. 시스템 cron 디렉터리, 사용자별 설정, SSH `authorized_keys` 등은 별도 수집 범위를 정해 조사합니다.

서비스를 찾았다면 실제 서비스 이름을 사용해 정의를 봅니다.

```bash
systemctl cat ssh.service
```

프로그램 경로, 실행 계정, 인자와 drop-in 설정을 비교합니다. `ssh.service`가 없는 시스템에서 다른 이름을 무작정 동일하게 취급하지 않습니다. systemd를 사용하지 않는 배포판은 해당 서비스 관리자에 맞춰 조사합니다.

## 5단계 — 파일과 실행의 관계 확인하기

의심 파일은 실행하지 않고 승인된 방법으로 사본을 확보합니다. 분석 사본의 해시·유형·내용을 확인하고 라이브 경로의 메타데이터와 비교합니다. 파일명·확장자·크기만으로 웹셸이나 악성 파일이라고 단정하지 않습니다.

Linux의 `ctime`은 일반적으로 inode 메타데이터 변경 시각이며 파일 생성 시각과 같지 않습니다. 수정·접근·메타데이터 변경 시각과 생성 시각 지원 여부를 구분하고, 웹 요청·프로세스·감사 기록으로 보완합니다.

## 6단계 — 네트워크와 교차 확인하기

의심 프로세스의 사용자·부모·시작 시점을 SSH·sudo·웹 서비스 기록과 비교합니다. 외부 연결은 목적지와 연결 시각을 센서 자료에 대조합니다. 센서에서 보인 IP가 NAT 뒤 어떤 호스트였는지 확인해야 할 수도 있습니다.

**완료 기준:** 현재 상태와 과거 기록을 구분한 타임라인, 의심 프로세스 1개의 근거, 추가 확보할 자료와 미확인 항목을 남깁니다.

## 자료가 없을 때

`/proc` 항목 부재는 종료·권한·마운트·컨테이너 네임스페이스 차이를 확인합니다. 인증 로그 부재는 로깅 구성과 보존을 확인합니다. auditd가 실행 중이어도 필요한 규칙이 사건 전에 설정됐는지 확인해야 합니다. 사전에 기록하지 않은 시스템 호출을 나중에 auditd로 복원할 수는 없습니다.

다음은 [Linux 지속성 조사](linux-persistence.html)와 [네트워크 조사](network-investigation.html)입니다.

## 참고자료

- [Linux proc(5)](https://man7.org/linux/man-pages/man5/proc.5.html)
- [journalctl(1)](https://man7.org/linux/man-pages/man1/journalctl.1.html)
- [auditd(8)](https://www.man7.org/linux/man-pages/man8/auditd.8.html)
