---
title: "GOAD-Light 03 · 공격 행동과 블루팀 조사"
description: "기준선, 제한된 정찰, 인증, 프로세스와 예약 작업을 수행하고 Splunk·PCAP·Velociraptor로 증거를 확인하는 상세 실습."
category: "learning"
updated: "2026-10-08"
tags: ["GOAD-Light", "공격 재현", "탐지", "조사", "ATT&CK"]
order: "43"
level: "입문"
---

## 실습 규칙과 준비

[01 · GOAD 설치](goad-light-install.html)와 [02 · 수집 환경](goad-light-telemetry.html)의 **원본 ↔ Splunk 한 건 대조**를 마쳤다면 시작합니다. 이 글의 명령은 본인이 만든 격리 GOAD VM에 한합니다. `<...>`는 **그대로 입력하는 문자열이 아니라 실제 값으로 바꿀 자리**입니다. IP는 실습자의 `ipconfig /all` 기록에서 가져옵니다.

GOAD 자체는 취약점을 학습할 수 있는 대상이지만 이 입문 과정은 **파괴·암호 추출·다른 장비 이동** 대신 다음의 제한된 행동으로 공격자 관점과 탐지 관점을 연결합니다. 실습 2의 포트 확인과 실습 3의 승인된 시험 계정 로그온을 공격 측에서 수행하고, 실습 4의 호스트 명령은 해당 VM 콘솔에서 공격 행동을 **재현**합니다. 콘솔 재현을 원격 침해에 성공한 것처럼 보고하지 않습니다.

### 공통 기록지

| 구분 | 실습 전에 채울 내용 |
| --- | --- |
| 랩 대상 | kingslanding IP, winterfell IP, castelblack IP |
| 역할별 IP | 공격자, Splunk Core, 캡처 Sensor |
| 계정 | 본인이 관리하는 시험 계정과 대상/권한; 암호는 기록지에 쓰지 않음 |
| 범위 | 이 세 VM의 IP만. 집/회사 네트워크·외부 주소 제외 |
| 시각 | 시작과 종료, Windows/리눅스 시간대, 시계 차이 |
| 원복 | 베이스라인 스냅샷, 만든 작업/파일, 제거 방법 |

실습마다 `행동이 실제로 실행됐는가`와 `블루팀이 증거를 확보했는가`를 별도 판정합니다. ATT&CK 표기는 관찰된 행동의 학습용 매핑이며 악성 의도의 증명이나 특정 APT 귀속이 아닙니다.

## 실습 1 · 정상 기준선 (15–20분)

**목적:** 나중에 같은 계정/서버에서 발생한 동작을 비교할 기준을 만듭니다.

1. castelblack 콘솔에서 관리자 PowerShell을 열어 `hostname`, `whoami`, `Get-Date`를 기록합니다. `cmd.exe /c whoami`를 한 번 실행하고 종료합니다. 현재 세션과 생성된 **새 프로세스**를 구분합니다.
2. Event Viewer의 **Windows Logs → Security → Filter Current Log**에서 4688을 찾습니다. 이벤트가 없으면 [감사 정책](goad-light-telemetry.html)으로 돌아갑니다. 이벤트의 생성 시각, `New Process Name`, `Creator Process Name`, 계정과 명령줄 존재 여부를 적습니다.
3. Splunk에서 최근 60분 `index=lab_windows host=<실제_host>`로 검색합니다. `host`가 예상한 값과 다르면 먼저 `stats count by host`로 실제 값을 찾습니다.

```spl
index=lab_windows earliest=-60m (EventCode=4688 OR EventID=4688)
| table _time host EventCode EventID Message
| sort - _time
```

**질문:** 4688 한 건의 정확한 프로세스 경로가 원문에 있습니까? Splunk `_time`은 원본 `TimeCreated`와 일치합니까? 1–5분 차이가 나면 수집 지연과 시계/시간대 중 무엇인지 `_indextime`을 함께 봅니다.

```spl
index=lab_windows earliest=-60m (EventCode=4688 OR EventID=4688)
| eval ingestion_delay_seconds=_indextime-_time
| table _time _indextime ingestion_delay_seconds host Message
| sort - _time
```

**완료:** 정상 프로세스의 경로·부모·계정·시간을 한 줄로 설명합니다. 검색 0건은 탐지 실패 확정이 아니라 원본/수집/시간의 어느 구간에서 끊겼는지를 적습니다.

## 실습 2 · 제한된 네트워크 정찰 (15–25분)

**공격 측:** 공격자 VM에서 실제 GOAD IP 한 대, 필요하면 세 대만 범위로 적고 접근 가능한 몇 개의 AD 포트를 확인합니다. `nmap`이 설치돼 있지 않으면 배포판 공식 패키지로 설치합니다. `-sT`는 TCP 연결 시도, `-Pn`은 ICMP 호스트 탐지에 의존하지 않는 옵션입니다. `-oN` 출력 파일에 시험 시각을 같이 남깁니다.

```bash
date -Is
nmap -Pn -sT -p 53,88,135,389,445,3389 <castelblack_IP> -oN castelblack-ports.txt
date -Is
```

1. 포트가 open/closed/filtered 중 무엇인지 기록합니다. `open`은 서비스 응답이지 침해 성공이 아닙니다.
2. 공격자 VM에서 같은 시간창을 `tcpdump`로 캡처했다면 PCAP의 두 IP·포트·시각을 확인합니다.
3. Sensor가 실제 패킷을 받는다면 Zeek `conn.log`의 originator/responder와 상태를 확인합니다. Sensor에 안 보이고 공격자 PCAP에만 보이면 **수집 경로 문제**입니다. Suricata 경보가 없으면 룰 매칭 대상인지와 EVE `flow` 존재 여부를 나누어 적습니다.

Splunk에 **실제로 Zeek 로그를 넣은 경우에만** 다음 쿼리를 사용합니다. 먼저 `index=lab_zeek | head 5`로 필드 이름과 JSON 구조를 확인합니다. Zeek JSON을 사용했다면 보통 `id.orig_h`, `id.resp_h`, `id.resp_p`를 추출할 수 있습니다.

```spl
index=lab_zeek earliest=-60m
| spath
| eval src='id.orig_h', dst='id.resp_h', port='id.resp_p'
| search src="<공격자_IP>" dst="<castelblack_IP>"
| table _time src dst port proto conn_state
| sort _time
```

**판정:** 출발지·대상·시간·여러 관리 포트의 접근은 정찰 후보입니다. 한 번의 포트 확인은 승인된 점검일 수 있으므로 실행 기록과 비교합니다. ATT&CK 학습 매핑: [T1046 Network Service Discovery](https://attack.mitre.org/techniques/T1046/).

## 실습 3 · 인증 성공과 실패 구분 (20–30분)

**전제:** castelblack에 로그인할 수 있는 **본인 랩 전용 시험 계정**을 준비하고, 계정 잠금 정책을 확인합니다. 기본 제공 GOAD 계정의 암호를 무작정 추측하지 않습니다. RDP가 허용되면 공격자 VM 또는 Windows 호스트의 원격 데스크톱으로 **한 번 정상 로그인**합니다. 필요하다면 잘못된 암호는 단 한 번만 시험하고 잠금 위험이 있으면 건너뜁니다.

1. 접속 시각, 출발 IP, 계정, 접속 대상과 성공/실패를 기록합니다.
2. castelblack 원본 Security에서 **4624/4625**, `Logon Type`, `Account Name`, `Source Network Address`를 봅니다. RDP는 보통 Logon Type 10이지만 경로·서비스에 따라 다르므로 실제 이벤트를 기준으로 합니다.
3. Splunk에서 같은 시각 ±10분의 원문을 확인합니다. DC의 4768/4769가 있다면 그 이벤트는 **발행한 DC**에서 찾고, 대상 로그온 이벤트와 혼동하지 않습니다.

```spl
index=lab_windows earliest=-60m (EventCode=4624 OR EventCode=4625 OR EventID=4624 OR EventID=4625)
| table _time host EventCode EventID Account_Name Logon_Type Source_Network_Address Message
| sort - _time
```

필드 이름이 비면 `Message`/원본 XML을 열고 설치된 TA의 추출 필드를 확인합니다. 계정이 같다는 이유만으로 한 요청과 다른 서버 이벤트를 연결하지 않습니다. 같은 시각·대상·출발지·Logon ID 및 후속 행위를 보며 판단합니다. ATT&CK 학습 매핑: [T1078 Valid Accounts](https://attack.mitre.org/techniques/T1078/). **완료:** 성공, 실패, 후속 사용 여부를 각각 적습니다.

## 실습 4 · 프로세스와 예약 작업 재현 (25–35분)

**공격 행동 재현:** castelblack **VM 콘솔의 관리자 PowerShell**에서 테스트 작업을 만듭니다. 이 단계는 원격 침해가 아니라, 공격자가 서버에 실행 권한을 얻은 뒤 사용할 수 있는 방식의 **로그 검증**입니다. 실행 파일은 Windows 기본 `whoami.exe`이며 결과 파일만 랩 VM 로컬에 씁니다. 랩의 현재 시각을 보고 **5분 뒤**의 HH:mm을 직접 정합니다.

```powershell
Get-Date
New-Item -ItemType Directory -Force C:\LabEvidence
schtasks.exe /Create /TN "GOAD-Lab-Whoami" /TR "cmd.exe /c whoami > C:\LabEvidence\whoami.txt" /SC ONCE /ST HH:mm /F
schtasks.exe /Query /TN "GOAD-Lab-Whoami" /V /FO LIST
schtasks.exe /Run /TN "GOAD-Lab-Whoami"
Get-Content C:\LabEvidence\whoami.txt
```

`HH:mm`은 실제 24시간제 시각으로 바꿉니다. 작업이 등록됐지만 `whoami.txt`가 없다면 작업의 실행 계정, 최근 실행 결과, TaskScheduler/Operational을 확인합니다. 명령에 `>`가 포함되므로 **Task Scheduler의 실제 action 인수**가 의도대로 저장됐는지도 `Query /V`로 검사합니다. 명령줄 인용이 환경에서 맞지 않으면 GUI에서 작업 Action을 `cmd.exe`, 인수를 `/c whoami > C:\LabEvidence\whoami.txt`로 등록해 실행합니다.

1. Security 4698(생성), 4688(프로세스), TaskScheduler Operational의 작업 등록/실행 기록을 원본에서 찾습니다. 4702는 작업을 **변경한 경우**에만 기대합니다.
2. Splunk에서 두 이벤트를 같은 host·작업 이름·시간으로 좁혀 원문을 엽니다.

```spl
index=lab_windows earliest=-60m (EventCode=4698 OR EventCode=4702 OR EventCode=4688 OR EventID=4698 OR EventID=4702 OR EventID=4688)
| search "GOAD-Lab-Whoami" OR "whoami"
| table _time host source EventCode EventID Message
| sort _time
```

Splunk에서 `OR` 뒤 자유 텍스트 필터가 설치된 버전/추출에 따라 의도와 다르면 `index=lab_windows earliest=-60m "GOAD-Lab-Whoami"`로 먼저 원문을 찾습니다. 작업 생성 이벤트가 없다면 4698 감사 범주, GPO 적용, Event Viewer 원문을 순서대로 확인합니다. **작업이 등록된 것**과 **실행됐고 파일이 생성된 것**을 따로 증명합니다. ATT&CK 학습 매핑: [T1053.005 Scheduled Task](https://attack.mitre.org/techniques/T1053/005/).

작업을 삭제하고 결과 파일을 확인한 뒤 수동으로 정리합니다. 삭제 이벤트가 남는지도 보되 정책에 따라 없을 수 있습니다.

```powershell
schtasks.exe /Delete /TN "GOAD-Lab-Whoami" /F
Remove-Item C:\LabEvidence\whoami.txt -ErrorAction SilentlyContinue
```

## 실습 5 · 수시 Hunt와 사건 보고 (20–30분)

1. Velociraptor가 있다면 **castelblack Client ID 하나만** 선택해 시험 시간의 Security/TaskScheduler EVTX를 수집합니다. GUI에 있는 실제 아티팩트와 매개변수를 사용하고 수집 성공/실패, 총 행 수를 적습니다. 실습 4의 시간·작업 이름을 검색합니다.
2. Splunk에 Hunt 결과를 별도로 수동 수집했다면 `index=lab_hunt`에서 원본 필드/시간대와 Windows 원본을 비교합니다. `lab_hunt`를 만들지 않았다면 이 검색은 실행하지 않습니다.
3. Arkime에 PCAP을 넣었다면 실습 2의 동일 출발/목적 IP·시간 구간 세션을 열어 5-tuple을 Zeek와 대조합니다. RDP/SMB의 암호화된 payload를 읽을 수 없어도 연결 사실과 패킷 수를 비교할 수 있습니다.
4. 아래 틀로 한 페이지 사건 메모를 작성합니다.

| 질문 | 메모할 것 |
| --- | --- |
| 무슨 일이 있었나 | 정찰 → 인증 → 프로세스/작업의 확인된 순서. 실제로 하지 않은 원격 실행은 쓰지 않음 |
| 가장 강한 근거 | 이벤트 원문, PCAP/Zeek UID, 정확한 host·시간·출발 IP |
| 빠진 근거 | 미러링 부재, 4688 명령줄 부재, Velociraptor 시점 차이 |
| 다른 설명 | 정상 관리자 점검, 설치 프로세스, 잘못 매핑한 계정 |
| 다음 조사 | 어떤 호스트/로그/기간을 왜 추가 확인할지 |
| 복원 | 작업과 파일 제거, 로그인 세션 종료, 스냅샷/시간/DNS 확인 |

## 혼자 하는 셀프 체크

- 스캔 포트가 `open`이면 침해됐나? **아닙니다.** 서비스가 TCP 연결에 응답한 것입니다.
- 4769 한 건이면 Kerberoasting에 성공했나? **아닙니다.** 정상 서비스 티켓 요청도 4769를 남깁니다. 계정/SPN·빈도·출발지·후속 행동이 필요합니다.
- Sensor에서 0건이면 트래픽이 없었나? 공격자 PCAP은 있는데 Sensor에는 없다면 **미러링 공백**부터 확인합니다.
- 4698은 있는데 4688/결과 파일이 없다면? **등록과 실행을 구분**하고 TaskScheduler 실행 결과, 감사 설정, 수집 범위를 확인합니다.
- Splunk에서 0건인데 Event Viewer에는 있다면? `index`, 시간 범위, UF 권한/연결, `host`/`source`, 필드 추출 순서로 좁힙니다.

### 다음 회차

같은 랩에서 조건을 하나만 바꿉니다. 예를 들어 **정찰 포트를 줄이거나**, 예약 작업을 **GUI로 등록**하고, 어떤 관찰이 달라졌는지 비교합니다. GOAD의 실제 취약 설정과 인증 공격을 깊게 다루기 전에는 [NTLM 가이드](ntlm.html), [Kerberos 기초](kerberos-basics.html), [AD 조사](ad-investigation.html)를 먼저 읽고 공격 수행 조건·수집 가능성·복원 계획을 기록합니다.

## 참고자료

- [MITRE ATT&CK — T1046](https://attack.mitre.org/techniques/T1046/)
- [MITRE ATT&CK — T1078](https://attack.mitre.org/techniques/T1078/)
- [MITRE ATT&CK — T1053.005](https://attack.mitre.org/techniques/T1053/005/)
- [Microsoft — Windows 고급 감사 정책](https://learn.microsoft.com/windows-server/identity/ad-ds/plan/security-best-practices/advanced-audit-policy-configuration)
