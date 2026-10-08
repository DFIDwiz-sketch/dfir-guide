---
title: "GOAD-Light 02 · 블루팀 수집 환경"
description: "Windows 감사 정책, Splunk 수집·검색, Velociraptor Hunt와 Zeek/Suricata/Arkime 패킷 가시성을 단계별로 검증합니다."
category: "learning"
updated: "2026-10-08"
tags: ["GOAD-Light", "Splunk", "Velociraptor", "Zeek", "Arkime", "Suricata"]
order: "42"
level: "입문"
---

## 목표와 배치

[01 · 설치](goad-light-install.html)를 완료하고 대상 VM 세 대의 실제 IP를 기록했어야 합니다. 첫 목표는 **Windows 원본 Security 이벤트 1건 → Splunk에서 같은 이벤트 1건**입니다. 그 후 패킷을 추가합니다. 실무 키트의 Core/Sensor 역할을 따라 분석과 패킷 수집을 나누되, 집 PC의 자원이 부족하면 단계별로 켭니다.

| 신호 | 생성/수집 지점 | 관찰할 수 있는 것 | 한계 |
| --- | --- | --- | --- |
| Security 4624/4625 | 접속 대상 Windows, DC | 성공/실패 로그온과 유형·계정·출발지 | 정책과 로그온 방식에 따라 IP·이벤트가 다름 |
| Security 4688 | 실행한 Windows | 프로세스 생성·명령줄(정책 활성 시) | 기본값으로 명령줄이 비어 있을 수 있음 |
| Security 4768/4769 | 인증한 DC | Kerberos TGT/TGS 요청 | 실제 서비스 사용·성공한 침해의 단독 증거가 아님 |
| Security 4698/4702 | 작업을 만든 Windows | 예약 작업 생성/변경 | 감사 설정·이벤트 버전에 의존 |
| Zeek conn/dns | 트래픽을 실제로 받은 Sensor | 연결 메타데이터·DNS | 호스트의 실행 프로세스를 직접 증명하지 않음 |
| Suricata EVE alert | Sensor | 룰이 매칭한 통신 | 경보 부재가 공격 부재는 아님 |
| Arkime 세션/PCAP | Sensor | 수집한 패킷과 세션 | 미러링 누락·암호화된 본문은 보이지 않음 |
| Velociraptor Hunt | 지정한 Windows 클라이언트 | 실행 시점의 아티팩트 및 관련 로그 | 수시 Hunt만으로 과거 모든 행위를 알 수 없음 |

## A. Windows 원본 로그부터 확인

각 대상 VM에서 **관리자 PowerShell**을 열고 현재 정책을 먼저 저장합니다. 도메인 GPO가 로컬 설정을 덮어쓸 수 있으므로 변경 뒤 `auditpol /get`으로 적용을 확인합니다. 이 문서에서는 좁은 시험 범위에만 적용합니다.

```powershell
auditpol /get /category:*
auditpol /set /subcategory:"Process Creation" /success:enable
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Other Object Access Events" /success:enable
auditpol /get /subcategory:"Process Creation"
```

Windows UI가 한국어/다른 언어라면 `auditpol` 하위 범주 이름도 로컬 언어일 수 있습니다. `auditpol /list /subcategory:*`에서 정확한 이름을 확인합니다. 4698/4702는 **Other Object Access Events** 범주의 성공 감사 여부와 이벤트 버전을 확인하세요. DC의 Kerberos 정책은 해당 DC에서 `auditpol /get /category:*`로 확인하고, 필요하다면 **Kerberos Authentication Service / Kerberos Service Ticket Operations** 성공 감사를 소규모 랩 GPO에 적용합니다. 과다 로그 발생을 살핍니다.

4688에 명령줄이 보이도록 하려면 각 Windows VM의 `gpedit.msc` 또는 해당 OU에만 적용되는 GPO에서 **Computer Configuration → Administrative Templates → System → Audit Process Creation → Include command line in process creation events = Enabled**를 설정하고 `gpupdate /force` 후 새 프로세스를 실행합니다. 명령줄에 민감한 인수가 평문으로 남을 수 있으므로 시험 계정만 사용합니다. Microsoft 설명에서 감사 정책과 명령줄 포함 정책은 별개의 설정입니다.

```powershell
whoami
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4688} -MaxEvents 3 |
  Select-Object TimeCreated, MachineName, Id, Message
```

권한 오류면 관리자 세션인지 확인합니다. `whoami`를 실행했다고 4688이 반드시 뜨는 것이 아니라 **새 프로세스가 실제 생성되고 감사가 켜져 있어야** 합니다. 원본 이벤트의 `TimeCreated`, `MachineName`, `Id`, 계정을 기록합니다.

### Splunk가 아직 없을 때의 수동 경로

Windows 관리자 PowerShell에서 EVTX를 내보내기 전에 목적지 폴더를 만듭니다. 수집 시각·호스트·필터와 해시를 기록하고 분석 사본만 다룹니다. Security 로그에는 계정 정보가 들어가므로 외부 공개 저장소에 올리지 않습니다.

```powershell
New-Item -ItemType Directory -Force C:\LabEvidence
wevtutil epl Security C:\LabEvidence\castelblack-Security.evtx
Get-FileHash C:\LabEvidence\castelblack-Security.evtx -Algorithm SHA256
```

파일명 `castelblack`은 실제 호스트로 바꿉니다. 이 방식은 **수동 시점 자료**이며 지속 수집은 아닙니다. 먼저 이벤트 뷰어에서 필터/원문을 보는 실습도 가능합니다.

## B. Splunk Core VM과 Windows 전달

Splunk 전용 Linux VM을 GOAD가 쓰는 **같은 host-only 대역**에 연결합니다. 패키지와 라이선스/시험 조건은 [Splunk Enterprise 공식 다운로드와 설치 안내](https://help.splunk.com/en/splunk-enterprise/get-started/installation-manual)에서 실행 시점에 확인합니다. VM에 고정 IP를 지정한다면 GOAD의 할당 주소·호스트 전용 DHCP 풀과 충돌하지 않게 고릅니다. VM 화면에서 `ip addr`, Windows에서 `Test-NetConnection <SplunkIP> -Port 9997`로 경로를 기록합니다. Splunk UI는 `http://<SplunkIP>:8000`의 **랩 내부에서만** 엽니다.

1. Splunk Web에서 **Settings → Indexes → New Index**를 열고 `lab_windows`를 만듭니다. 기존 인덱스와 보존 용량도 확인합니다.
2. **Settings → Forwarding and receiving → Configure receiving → New Receiving Port**에 `9997`을 등록합니다. 이것은 Forwarder 수신 포트이며 Splunk Web 8000과 다릅니다.
3. 각 GOAD Windows VM에 [Windows Universal Forwarder](https://help.splunk.com/en/splunk-enterprise/forward-and-process-data/universal-forwarder-manual/10.6/install-the-universal-forwarder/install-a-windows-universal-forwarder)를 설치합니다. 설치 마법사에서 Security 로그 입력과 수신지 `<SplunkIP>:9997`을 선택하고 관리 권한/서비스 계정을 확인합니다. DC에서는 Security 로그 읽기 권한이 중요합니다.
4. 설치 마법사에서 로그 입력을 선택하지 못했다면 UF의 `etc\system\local\inputs.conf`에 아래를 추가하고 서비스를 다시 시작합니다. 같은 stanza가 이미 있는 경우 중복 정의를 만들지 말고 현재 구성을 먼저 확인합니다.

```ini
[WinEventLog://Security]
disabled = 0
index = lab_windows
current_only = 1

[WinEventLog://Microsoft-Windows-TaskScheduler/Operational]
disabled = 0
index = lab_windows
current_only = 1
```

`current_only = 1`은 기존 로그 전체를 보내는 대신 이후 이벤트부터 확인하기 위한 **이 가이드의 설정 선택**입니다. 과거 사건 재구성이 필요하면 수집 범위와 보존량을 정한 뒤 변경합니다. 파일 위치와 실제 서비스 시작 방식은 설치한 UF 버전/경로에 맞춰 확인합니다. Windows 방화벽과 Splunk VM 방화벽에서는 **Windows → Core TCP/9997** 경로만 필요합니다. 설정한 `index`가 Splunk에 존재하는지 확인합니다.

5. 대상 Windows에서 새로운 시험 동작을 한 번 실행하고 Splunk의 시간 범위를 **최근 60분**으로 둡니다. Splunk Search에서 아래 순서로 범위를 좁힙니다. `host`는 실제 수집된 값으로 교체합니다.

```spl
index=lab_windows earliest=-60m
| stats count by host, source, sourcetype
```

```spl
index=lab_windows earliest=-60m (EventCode=4688 OR EventID=4688)
| table _time host source sourcetype EventCode EventID Message
| sort - _time
```

**검증:** 원본 Event Viewer의 시각/호스트/ID와 Splunk의 `_time`/`host`/원문이 같은지 비교합니다. 필드가 추출되지 않았더라도 원문에 ID가 있는지 확인하세요. 시간대, 이벤트 생성 시각, 수집 시각(`_indextime`)이 다를 수 있습니다. 검색 0건이면 `index` → 시간 → host → source/sourcetype → 원본 존재 → UF 연결/권한 순서로 되돌아갑니다. `index=*`를 상시 전체 검색하는 대신 작은 시간 범위에서 메타데이터를 찾습니다.

## C. Velociraptor는 대상 한 대부터

[Velociraptor 공식 서버 구성](https://docs.velociraptor.app/docs/deployment/)에 따라 별도 랩 서버에 프런트엔드/GUI를 설치하고 클라이언트를 생성합니다. 인증서, GUI 계정, 서버 주소는 **랩 내부 주소**로 지정합니다. 먼저 **castelblack 한 대**에 클라이언트를 설치하고 GUI에서 그 클라이언트가 Online인지 확인합니다. 다음에 kingslanding, winterfell로 넓힙니다.

1. **Clients**에서 `castelblack`의 호스트명/Client ID를 확인합니다. 같은 이름의 오래된 레코드와 구분합니다.
2. 해당 클라이언트를 열어 **Collect / New Collection**에서 `Windows.EventLogs.Evtx` 등 설치 버전에서 제공하는 EVTX 아티팩트를 검색합니다. **GUI에 표시되는 실제 아티팩트 이름과 매개변수**를 기록합니다. 없으면 이름이 다른 버전인지 확인하고 목록에 없는 아티팩트를 있다고 가정하지 않습니다.
3. 수집 범위는 Security/TaskScheduler Operational의 시험 시간으로 줄입니다. 결과 표에 `ClientId`, 수집 시각, 이벤트 시각, 호스트가 있는지 확인하고 CSV/JSON으로 내보낼 때 원본 보존 계획을 세웁니다.
4. 추가 호스트를 동시에 조사할 때만 **Hunt**를 만들고 라벨/대상 수를 확인합니다. Hunt 결과는 수동 다운로드→Splunk의 별도 `lab_hunt` 인덱스로 가져올 수 있습니다. 형식과 필드를 확인하기 전부터 임의의 `sourcetype`을 고정하지 않습니다.

실무 키트의 운영 흐름에 맞추려면 Velociraptor는 **필요할 때 지정 호스트를 Hunt하고 결과를 Splunk에 추가**하는 경로로 남겨둡니다. 별도의 Client Monitoring은 예약 작업의 실시간 탐지처럼 목표가 분명할 때 이후에 설정합니다. 설치만으로 자동 실시간 탐지가 되지는 않습니다.

## D. 네트워크 Sensor는 패킷 가시성 시험 후

VirtualBox의 host-only 네트워크는 연결성을 제공하지만 물리 TAP의 복제 동작을 보장하지 않습니다. Sensor VM에서 `tcpdump`로 **공격자→GOAD 대상의 실제 시험 패킷**을 먼저 보고, 없으면 센서 설정을 진행하지 않습니다. 재현 가능한 시작점은 공격자 VM 자체에서 시험 PCAP을 캡처하거나, 별도 가상 스위치/미러를 구성해 Sensor의 캡처 NIC로 트래픽을 복제하는 것입니다. 어떤 배치든 **NIC, 송신/수신 패킷 수, 시험 시간**을 기록합니다.

```bash
# 공격자 VM 또는 검증된 미러 NIC에서, 실제 인터페이스와 대상 IP로 바꿉니다.
sudo tcpdump -i <캡처NIC> -nn host <확인한_GOAD_IP> -w goad-test.pcap
```

다른 터미널에서 랩 대상에만 시험 연결을 만들고 `Ctrl+C`로 캡처를 끝낸 뒤 파일 크기와 `tcpdump -r goad-test.pcap -nn -c 10`의 출발/목적지를 확인합니다. 이 **PCAP 우선 경로**는 실시간 미러링을 아직 만들지 못한 초보자도 같은 패킷을 세 도구로 비교하게 해 줍니다.

| 도구 | 첫 검증 | 이후 연결 |
| --- | --- | --- |
| [Zeek](https://docs.zeek.org/en/master/quickstart.html) | 새 폴더에서 `zeek -r /절대경로/goad-test.pcap`; 생성된 `conn.log`의 두 IP·시간 확인 | JSON 로그 설정/전달 뒤 Splunk `lab_zeek` 인덱스에 넣고 필드 검사 |
| [Suricata](https://docs.suricata.io/en/latest/command-line-options.html) | 설치된 설정 경로를 확인한 뒤 `suricata -r /절대경로/goad-test.pcap -c /절대경로/suricata.yaml -l /절대경로/output`; `eve.json`의 flow/alert 확인 | `HOME_NET`을 실제 랩 대역에 맞추고 룰·SID·오탐을 검증한 뒤 `lab_suricata` 수집 |
| [Arkime](https://arkime.com/install) | 공식 설치 문서에 따라 캡처/뷰어를 별도 랩 주소로 구성하고 동일 PCAP을 오프라인 입력; 세션 양쪽 IP 확인 | 검증된 미러 NIC만 캡처 대상으로 지정, 저장 공간·보존 범위 결정 |

Zeek/Suricata의 패키지 설치 경로와 Arkime의 오프라인 가져오기 명령은 OS·도구 버전에 따라 달라집니다. 각 제품의 **공식 설치 안내에서 설치 버전의 명령**을 확인하고 위 예시의 경로를 실제 파일로 바꿉니다. `zeek -r`는 현재 작업 폴더에 로그를 만드니 빈 폴더에서 실행합니다. PCAP에 해당 프로토콜이 없으면 `dns.log`/`http.log`/경보가 없는 것이 정상일 수 있습니다. 암호화된 RDP/SMB 내용을 Arkime에서 평문으로 볼 수 있다고 기대하지 않습니다.

**완료 기준:** Windows 원본 ↔ Splunk 한 이벤트를 대조하고, 캡처 PCAP ↔ Zeek `conn.log`의 통신 하나를 대조했습니다. Suricata 경보가 없다면 EVE `flow` 존재 여부와 룰셋/가시성을 구분해 기록합니다. 다음: [03 · 공격·조사 실습](goad-light-investigation.html).

## 공식 자료

- [Microsoft — 명령줄 프로세스 감사](https://learn.microsoft.com/windows-server/identity/ad-ds/manage/component-updates/command-line-process-auditing)
- [Microsoft — 고급 감사 정책](https://learn.microsoft.com/windows-server/identity/ad-ds/plan/security-best-practices/advanced-audit-policy-configuration)
- [Splunk — Windows 이벤트 로그 수집](https://help.splunk.com/en/splunk-enterprise/get-started/get-data-in/9.4/get-windows-data/monitor-windows-event-log-data-with-splunk-enterprise)
- [Zeek — PCAP 빠른 시작](https://docs.zeek.org/en/master/quickstart.html)
