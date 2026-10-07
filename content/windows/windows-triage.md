---
title: "Windows 호스트 초기 조사"
description: "로그온, 프로세스, 실행 흔적과 지속성 설정을 연결하는 호스트 조사 시작점."
category: "windows"
updated: "2026-10-07"
tags: ["Windows", "호스트 포렌식", "초기 조사"]
order: "4"
level: "입문"
---

## 목표와 준비물

Windows 한 대에서 계정·프로세스·통신·지속성의 조사 출발점을 만드는 절차입니다. 대상 장비와 조사 권한, 증거 저장 위치, 분석용 PowerShell을 준비합니다. 실제 사건에서는 조직의 수집 절차와 격리 판단을 먼저 적용합니다. 아래 명령은 상태 조회 예시이며 디스크·메모리 전체 획득을 대신하지 않습니다.

## 1단계 — 장비와 시간을 식별하기

```powershell
$env:COMPUTERNAME
Get-Date -Format o
Get-TimeZone
Get-CimInstance Win32_OperatingSystem |
  Select-Object Caption, Version, LastBootUpTime
```

장비 이름, OS 버전, 현재 시간대, 마지막 부팅 시각을 기록합니다. 도구 실행 자체도 대상의 상태를 바꾸므로 조사 명령과 실행 시각을 남깁니다. 부팅 후에만 남는 자료가 필요한지 판단하기 전에 무작정 재부팅하지 않습니다.

**확인할 결과:** 조사 대상과 증거 파일의 장비명이 일치하는지, 사건 구간이 현재 부팅보다 이전인지 알 수 있어야 합니다.

## 2단계 — 현재 프로세스와 연결 확인하기

```powershell
Get-CimInstance Win32_Process |
  Select-Object ProcessId, ParentProcessId, Name, ExecutablePath, CommandLine

Get-NetTCPConnection |
  Select-Object State, LocalAddress, LocalPort, RemoteAddress, RemotePort, OwningProcess
```

의심 연결의 `OwningProcess`를 프로세스의 `ProcessId`와 비교합니다. 일부 경로나 명령행은 권한에 따라 비어 있을 수 있습니다. 종료된 프로세스, PID 재사용, 두 명령 사이의 시간 차이 때문에 현재 PID만으로 과거 통신을 연결하면 안 됩니다. TCP 조회에는 UDP나 종료된 연결 전체가 포함되지 않습니다.

**해석 예시:** PowerShell 프로세스가 있다는 사실은 정상 관리와 공격 양쪽에서 가능합니다. 부모, 명령행, 계정, 경로와 실행 시점을 추가로 봅니다.

## 3단계 — 조사 기간의 이벤트 확보하기

Security, System과 사용 중인 Sysmon·PowerShell 채널의 보존 범위를 확인합니다. 채널과 감사 설정은 환경마다 다릅니다.

```powershell
Get-WinEvent -ListLog Security |
  Select-Object LogName, IsEnabled, RecordCount, MaximumSizeInBytes, LogMode
```

필요한 EVTX는 승인된 수집 도구나 이벤트 뷰어의 저장 기능으로 확보합니다. 명령으로 내보내는 경우 아래 예시는 **미리 준비한 증거 저장 경로에 새 파일을 쓰는 작업**입니다. 접근 권한과 여유 공간을 확인하고 기존 증거를 덮어쓰지 않습니다.

```powershell
wevtutil epl Security E:\CASE-001\LAB-FS01-Security.evtx
```

수집 파일의 해시와 경로를 [증거 목록](evidence-timeline.html)에 기록합니다. Sysmon이 설치되지 않았거나 해당 이벤트가 설정되지 않았다면 뒤늦게 설치해 과거 행동을 복원할 수는 없습니다.

## 4단계 — 인증과 실행을 연결하기

[Windows 이벤트 읽기](windows-events.html)에 따라 4624·4625의 계정과 로그온 유형을 확인한 뒤 4688 또는 Sysmon 1의 실행 맥락을 봅니다.

| 연결점 | 사용 방법 | 한계 |
| --- | --- | --- |
| Computer + 시각 | 같은 대상과 시간 구간부터 좁히기 | 시계 오차와 동일 시간의 별도 작업 |
| Logon ID | 같은 장비·해당 부팅 구간의 로그온과 주체 연결 | 다른 장비의 값과 전역 조인하지 않음 |
| PID + 생성 시각 | 당시 실행과 후속 행위 비교 | PID는 재사용됨 |
| Sysmon ProcessGuid | 수집된 프로세스 관련 이벤트 연결 | 모든 데이터에 존재하지 않음 |

## 5단계 — 다시 실행될 설정 확인하기

```powershell
Get-ScheduledTask | Select-Object TaskPath, TaskName, State
Get-CimInstance Win32_Service |
  Select-Object Name, State, StartMode, StartName, PathName
```

현재 작업·서비스 정의와 과거 생성·변경 기록을 비교합니다. 이름이 그럴듯해도 실행 경로와 계정, 인자를 확인합니다. 현재 목록에 없다는 이유로 과거 작업까지 없었다고 결론 내리지 않습니다. 작업을 찾았으면 [예약 작업 조사](scheduled-tasks.html)로 이어갑니다.

## 6단계 — 네트워크와 범위 확인하기

의심 프로세스의 시간·주소·포트를 연결 로그 및 PCAP과 비교합니다. 수동 네트워크 센서는 프로세스 이름을 보통 직접 알지 못하므로 호스트 자료와 연결해야 합니다. 같은 계정으로 다른 장비에 접근했는지 인증 자료를 조회합니다.

**완료 기준:** 장비 정보, 수집 목록, 핵심 이벤트, 현재 상태와 과거 기록의 구분, 조사 타임라인과 후속 수집 목록을 남깁니다. 자료가 없으면 ‘행동 없음’ 대신 ‘해당 자료로 확인 불가’라고 씁니다.

## 자주 막히는 지점

- Security 접근 거부: 수집 계정 권한과 승인된 수집 경로를 확인합니다.
- 4688 명령행이 비어 있음: 프로세스 생성 감사와 명령행 포함 정책을 각각 확인합니다.
- 외부 IP의 프로세스를 찾을 수 없음: 프로세스 종료, 수집 시점 차이, NAT·프록시를 확인합니다.
- Prefetch가 없음: 생성·보존 조건을 검토하고 이벤트·EDR 등 다른 실행 흔적을 찾습니다.

추가 공식 문서: [wevtutil](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/wevtutil).

## 참고자료

- [Microsoft — Security 4688](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4688)
- [Microsoft Sysinternals — Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)
- [Velociraptor — Windows.Forensics.Prefetch](https://docs.velociraptor.app/artifact_references/pages/windows.forensics.prefetch/)
