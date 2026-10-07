---
title: "Linux 지속성 조사"
description: "systemd·timer·cron·SSH·셸 설정을 조회하고 변경과 실제 실행을 구분해 대응까지 연결하는 Linux 지속성 조사 7단계."
category: "linux"
updated: "2026-10-08"
tags: ["Linux", "지속성", "systemd"]
order: "8"
level: "입문"
---

## 목표와 준비물

서비스·timer·cron·SSH·셸 설정의 현재 상태와 과거 실행을 비교합니다. 대상 Linux의 배포판·서비스 관리자, 조회 권한, 설정 사본과 로그가 필요합니다. [Linux 초기 조사](linux-triage.html)에서 장비와 시간을 먼저 확인합니다.

이 글은 기존 설정을 조사하는 절차입니다. 지속성은 재부팅·로그인·시간 조건 등에 따라 다시 실행되거나 접근할 수 있는 경로이며, 설정 파일 존재·활성화·실제 실행을 각각 확인해야 합니다.

## 1단계 — 자동 실행 경로 목록 만들기

| 영역 | 확인할 대상 |
| --- | --- |
| systemd 서비스 | unit, drop-in, 실행 파일·계정·활성 상태 |
| systemd timer | timer와 연결된 service, 최근·다음 실행 정보 |
| cron | 시스템 작업과 사용자별 crontab |
| SSH | 키·계정·인증 경로와 서버 설정 |
| 셸·로그인 | 해당 셸의 시작 파일과 자동 실행 명령 |

모든 배포판이 systemd를 사용하지는 않습니다. 컨테이너·최소 설치·다른 init 환경에서 도구가 없다는 것을 악성 흔적으로 해석하지 않습니다.

## 2단계 — systemd의 현재 상태 읽기

```bash
systemctl list-unit-files --type=service
systemctl list-timers --all
```

목록에서 조사할 서비스 하나를 고릅니다. 아래 `example.service`는 실제 발견한 이름으로 바꿉니다.

```bash
systemctl cat example.service
systemctl show example.service -p FragmentPath -p DropInPaths -p User -p ExecStart -p ActiveState -p UnitFileState
```

기본 unit만 보지 말고 drop-in이 덮어쓴 설정도 확인합니다. `active`는 현재 실행 상태, `enabled`는 시작 연결 구성의 한 측면이므로 같은 뜻이 아닙니다. 비활성화된 서비스도 수동 실행되거나 다른 unit의 의존 관계 등으로 시작될 수 있습니다.

**남길 결과:** 정의 파일 경로, 적용된 설정, 실행 계정·파일·인자, 활성·시작 상태를 구분한 표입니다.

## 3단계 — 사용자 서비스와 timer 범위 확인하기

시스템 서비스와 사용자 단위 서비스는 관리 범위가 다릅니다. 현재 사용자의 세션에서 조사하는 경우 `systemctl --user`로 해당 범위를 확인할 수 있지만, 그것이 다른 모든 사용자의 상태를 보여주지는 않습니다.

각 timer의 연결 서비스, 달력·상대 시간 조건과 최근 실행 정보를 비교합니다. next·last 값만으로 실행 프로그램이 목표 작업을 성공했는지까지 알 수는 없습니다. 연결된 서비스의 상태와 journal·실제 결과를 함께 봅니다.

## 4단계 — cron과 로그인 설정 살펴보기

```bash
crontab -l
ls -ld /etc/crontab /etc/cron.d /etc/cron.daily
```

경로는 배포판에 따라 다르며 `crontab -l`은 현재 계정의 작업입니다. 없는 경로를 오류로만 기록하지 말고 해당 시스템의 실제 구성을 확인합니다. 다른 사용자 작업은 승인된 권한과 수집 방식으로 별도 확인합니다.

명령에서 실행 파일·스크립트·환경 변수·상대 경로가 어떻게 해석되는지 추적합니다. 사용자 crontab과 시스템 crontab은 사용자 필드 유무 등 형식 차이가 있으므로 동일하게 파싱하지 않습니다.

셸 시작 파일은 로그인 셸인지 대화형 셸인지, Bash 등 어떤 셸인지에 따라 로드 조건이 다릅니다. `.bashrc` 하나만 검사하고 모든 로그인 자동 실행을 조사했다고 결론 내리지 않습니다.

## 5단계 — SSH 접근 변경 조사하기

계정별 공개키 파일과 SSH 서버의 실제 설정을 확인합니다. 기본 경로 외의 `AuthorizedKeysFile`, 외부 키 조회 등 구성 차이가 있을 수 있습니다. 키의 주석 문자열만으로 소유자를 확인하지 말고 승인된 키 목록·등록 이력·인증 기록을 대조합니다.

새 키가 존재하는 것과 그 키로 실제 접속한 것은 다릅니다. 사건 시간의 인증 로그·계정·출발지와 사용된 인증 방식의 근거를 확보합니다. 개인키나 비밀값을 공개 보고서에 넣지 않습니다.

## 6단계 — 설정과 실행을 타임라인에 연결하기

```bash
journalctl -u example.service --since "2026-10-07 00:00:00 UTC" \
  --until "2026-10-07 01:00:00 UTC" --utc --no-pager
```

서비스 이름과 시간을 실제 조사 범위로 바꿉니다. 파일 변경 시각·소유자·권한·해시를 기록하고 journal, 인증 및 사전에 수집된 감사 자료와 연결합니다. 파일 시간 하나만으로 생성 주체를 특정하지 않습니다.

현재 설정이 이미 삭제됐거나 수정됐다면 디스크 사본·구성 백업·이전 수집 결과를 비교합니다. 현재 목록에 없다는 사실이 과거에도 없었다는 뜻은 아닙니다.

## 7단계 — 제거와 재검증 계획 세우기

확인된 악성 경로를 처리하기 전에 설정과 실행 대상의 증거를 보존합니다. 정상 관리 자동화·패키지 설치와 비교해 업무 영향을 평가합니다. 설정 복원만으로 이미 실행 중인 프로세스나 노출된 계정이 자동 처리되는 것은 아닙니다.

**완료 기준:** 설정 경로·실행 조건·계정·대상 파일·실제 실행 근거·정상 기준과의 차이·조치 후 재검증 항목을 한 표로 정리합니다.

추가 공식 배포판 자료: [Debian systemctl manual](https://manpages.debian.org/trixie/systemd/systemctl.1.en.html).

## 참고자료

- [MITRE ATT&CK — Systemd Service T1543.002](https://attack.mitre.org/techniques/T1543/002/)
- [MITRE ATT&CK — Cron T1053.003](https://attack.mitre.org/techniques/T1053/003/)
- [journalctl(1)](https://man7.org/linux/man-pages/man1/journalctl.1.html)
