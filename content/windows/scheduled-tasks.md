---
title: "예약 작업의 생성과 변경 조사"
description: "예약 작업 이벤트와 작업 XML을 프로세스 실행 및 계정의 맥락에 연결합니다."
category: "windows"
updated: "2026-10-07"
tags: ["예약 작업", "지속성", "탐지"]
order: "6"
level: "입문"
---

## 목표와 준비물

예약 작업의 **생성 → 정의 확인 → 실제 실행 → 변경 → 탐지 검증**을 구분합니다. 격리된 시험 Windows VM, 이벤트 로그 조회 권한과 작업 스케줄러가 필요합니다. 실제 침해 장비에서는 아래의 생성 실습을 수행하지 말고 기존 자료만 조사합니다.

## 1단계 — 감사와 수집 준비 확인하기

Security의 예약 작업 이벤트는 `Audit Other Object Access Events`와 관련됩니다. 시험 VM의 고급 감사 정책에서 해당 성공 감사를 확인하고, 변경했다면 이전 상태를 기록합니다. 도메인 정책이 관리하는 설정은 담당자의 실습 정책을 따릅니다.

| 이벤트 | 관찰할 행동 |
| --- | --- |
| 4698 | 작업 생성 |
| 4699 | 작업 삭제 |
| 4700 / 4701 | 작업 활성화 / 비활성화 |
| 4702 | 작업 변경 |

4688 또는 Sysmon 1을 함께 수집할 수 있는지도 확인합니다. 과거에 꺼져 있던 감사를 나중에 켜도 이전 생성 이벤트가 생기지는 않습니다.

## 2단계 — 무해한 작업 하나 만들기

작업 스케줄러에서 새 작업을 만들고 이름을 `DFIR-Lab-Observe`로 지정합니다. 같은 이름의 작업이 이미 있다면 다른 고유 이름을 사용합니다.

1. 현재 시험 사용자로, 사용자가 로그온한 동안만 실행하도록 설정합니다.
2. 최고 권한 실행은 선택하지 않습니다.
3. 자동 트리거 없이 수동 실행을 위한 작업으로 만듭니다.
4. 실행 프로그램은 `powershell.exe`로 설정합니다.
5. 인자는 아래처럼 현재 시각을 시험 사용자의 임시 파일에 추가하는 내용으로 지정합니다.

```text
-NoProfile -Command "Get-Date -Format o | Out-File -Append -FilePath (Join-Path $env:TEMP 'dfir-lab-observe.txt')"
```

이 실습은 현재 시각을 쓰는 정상 실행 관찰입니다. 네트워크 접속이나 자격 증명 수집은 하지 않습니다. 생성 시각과 작업 이름, 실제 실행 계정을 기록합니다.

## 3단계 — 생성 이벤트와 XML 읽기

Security 로그에서 해당 시각의 4698을 찾고 Subject 계정·장비·작업 이름을 확인합니다. 작업 XML에서는 다음을 비교합니다.

| XML 영역 | 확인할 것 |
| --- | --- |
| Actions | 프로그램, 인자, 작업 디렉터리 |
| Principals | 실행 계정과 권한 수준 |
| Triggers | 실행 조건과 시각 |
| Settings | 활성화와 기타 실행 조건 |

현재 정의는 PowerShell에서도 내보낼 수 있습니다. 이름·경로는 실제 값으로 바꿉니다.

```powershell
Export-ScheduledTask -TaskName 'DFIR-Lab-Observe' -TaskPath '\'
```

**확인할 결과:** 이벤트에 기록된 정의와 현재 정의가 일치하는지 알 수 있습니다. 이미 변경된 작업이라면 다를 수 있으므로 과거 XML을 별도로 보존합니다.

## 4단계 — 수동 실행과 프로세스 확인하기

작업을 한 번 실행하고 해당 사용자의 임시 파일에 시각이 추가됐는지 확인합니다. 예약 작업의 실행 결과와 4688·Sysmon 1의 PowerShell 생성 시각·계정·명령행을 비교합니다. 현재 프로세스 목록은 짧게 실행하고 종료된 프로세스를 놓칠 수 있습니다.

**중요한 구분:** 4698은 작업 생성의 증거입니다. 작업의 실제 실행과 프로그램의 성공은 후속 기록과 출력 파일로 각각 확인해야 합니다. Task Scheduler의 실행 이력도 해당 Operational 채널의 활성화·보존 상태에 영향을 받습니다.

## 5단계 — 변경과 원상 정리 관찰하기

실습 작업의 설명을 바꾸고 저장한 뒤 4702가 기록되는지 봅니다. 변경 이벤트와 이전·이후 XML을 비교해 무엇이 달라졌는지 적습니다. 실습이 끝나면 직접 만든 작업과 해당 시험 파일만 제거하고, 필요하면 4699를 확인합니다. 실제 운영 작업은 이 절차로 삭제하지 않습니다.

## 6단계 — Splunk에서 생성·변경 후보 모으기

아래는 가상 로그 및 같은 필드 구조에 맞춘 예시입니다. 실제 필드는 먼저 [Splunk 기초](splunk-basics.html)로 확인합니다.

```spl
index=lab_logs
| spath
| eval event_id=coalesce(EventCode, EventID, 'System.EventID')
| where event_id=4698 OR event_id=4702
| table _time ComputerName event_id SubjectUserName TaskName TaskContent
| sort 0 _time
```

이 검색은 모든 생성·변경을 보여주는 시작점이며 악성 판정 규칙이 아닙니다. 실행 대상, 사용자 쓰기 가능 경로, 계정의 평소 역할, 승인된 배포, 실제 실행과 통신을 비교해 조사 조건을 추가합니다.

## 7단계 — 탐지와 수집 경로 검증하기

호스트 원본에 생성된 이벤트가 Velociraptor와 SIEM에도 나타나는지 확인합니다. 상시 호스트 전달이 없다면 Hunt는 과거 자료 수집에, 새 이벤트 지속 관찰은 [Client Monitoring](velociraptor.html)에 맞춰 설계합니다.

**완료 기준:** 작업 XML, 생성·변경·삭제 시각, 실제 실행 근거, SIEM 도착 여부와 지연, 탐지에서 정상 관리 작업을 구분할 조건을 기록합니다. 해당 기록이 없으면 감사·채널·전달을 단계별로 점검합니다.

추가 공식 문서: [Export-ScheduledTask](https://learn.microsoft.com/en-us/powershell/module/scheduledtasks/export-scheduledtask).

## 참고자료

- [Microsoft — Audit Other Object Access Events](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/audit-other-object-access-events)
- [Microsoft — Event 4698](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4698)
- [Microsoft — Event 4702](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4702)
