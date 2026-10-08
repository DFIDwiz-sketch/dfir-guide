---
title: "원격 접속과 내부 이동 조사: SMB·RDP·SSH·WinRM"
description: "포트·연결·인증·실행을 구분하고 SMB 서명·QUIC·RMM·터널과 호스트 자료를 연결하는 6단계."
category: "network"
updated: "2026-10-08"
tags: ["SMB", "RDP", "SSH", "WinRM", "내부 이동"]
order: "26"
level: "입문 · 실무 확장"
---

## 원격 접속은 맥락과 결과로 판단하기

관리자가 쓰는 SMB·RDP·SSH·WinRM은 공격자도 사용할 수 있습니다. 포트가 열렸거나 연결이 성립했다는 사실과 성공 로그인·권한 사용·명령 실행을 구분합니다. 2022년의 원격 프로토콜 감시에 게이트웨이·암호화·RMM·신원 감사와 제품 기본값을 추가합니다.

## 1단계 — 허용된 관리 경로부터 적기

| 방식 | 일반적 시작점 | 추가할 자료 |
| --- | --- | --- |
| SMB | TCP/445, 파일·관리 공유 | 계정·서명/암호화 설정·공유 접근·파일·서비스 |
| RDP | TCP·UDP/3389 또는 게이트웨이 | 게이트웨이·대상 인증·세션·프로세스 |
| SSH/SFTP | 보통 TCP/22 | sshd 인증·키·계정·세션·프로세스 |
| WinRM | 보통 TCP/5985·5986 | WinRM·PowerShell·인증·원격 실행 |
| VNC | 보통 TCP/5900 계열 | 실제 구현·인증·암호화·원격 세션 |
| FTP | 제어·별도 데이터 채널 | 제어와 데이터 흐름·전송 파일·계정 |
| ICMP | 포트 없음 | 타입·코드·방향·패턴·프로세스 맥락 |
| RMM·터널 | HTTPS·벤더 인프라 등 | 승인 목록·설치·세션·계정·실행 |

포트는 보통 값이며 임의 포트·프록시·QUIC·터널에서는 다를 수 있습니다. SFTP는 SSH 위 전송이며 FTP나 FTPS와 다릅니다. WinRM HTTP 사용만으로 콘텐츠가 항상 평문이라고 결론 내리지 않고 인증·메시지 암호화 조건을 확인합니다.

## 2단계 — 네트워크의 연결 후보 찾기

주소·포트·프로토콜·시각·지속 시간·바이트와 센서 위치를 확인합니다. TCP 연결 성공이나 Zeek 상태만으로 응용 로그인 성공을 증명하지 않습니다. RDP의 게이트웨이 경유와 SSH 터널은 원래 원격 사용자의 주소를 가릴 수 있습니다.

SMB over QUIC는 TLS 1.3 기반으로 보통 UDP/443을 사용합니다. UDP/443을 모두 웹으로 분류하거나 TCP/445 부재로 SMB가 없다고 단정하지 않습니다. 서버 지원·종단 로그와 실제 설정을 확인합니다.

## 3단계 — 인증과 대상 행동 연결하기

| 질문 | 관련 자료 | 해석 주의 |
| --- | --- | --- |
| 대상에 로그인했는가 | Windows 4624·4625, sshd 등 | 계정·대상·시간·로그온 유형 확인 |
| RDP 세션인가 | RemoteInteractive 유형 10과 세션·게이트웨이 | 유형만으로 사용자의 의도 확정 불가 |
| 공유에 접근했는가 | 5140·5145 등 감사, SMB 로그 | 감사 설정·실제 대상·요청한 권한 확인 |
| 실행이 있었는가 | 4688·Sysmon·서비스·PowerShell | 계정·로그온 ID·부모·실행 내용 연결 |
| 원격 도구가 설치됐는가 | 설치·서비스·파일·벤더 세션 | 승인 업무·담당과 비교 |

위 이벤트는 정책이 켜지고 보존돼야 관찰할 수 있습니다. 네트워크 로그에 계정이 없으면 억지로 채우지 않습니다. 로그온 ID는 해당 호스트·기간의 맥락에서 연결하며 다른 호스트에서 같은 값이라고 합치지 않습니다.

## 4단계 — 현재 SMB 방어 기준 확인하기

Microsoft의 확인일 기준 안내에서 Windows 11 24H2 Enterprise·Pro·Education은 송수신 SMB 서명을 요구하고 Server 2025는 송신을 요구합니다. 24H2 Home은 둘을 기본 요구하지 않습니다. 정책 변경·업그레이드·외부 NAS·실제 협상에 따라 결과를 확인해야 합니다.

서명은 무결성·인증 보호이며 암호화와 다릅니다. SMB 서명이 있어도 유효 계정의 모든 악용을 막는 것은 아닙니다. 서비스별 Relay 방어·NTLM·권한·자격 증명 보호는 [NTLM 가이드](ntlm.html)와 연결합니다. 호환성 문제를 해결하려고 검증 없이 서명·암호화 정책을 낮추지 않습니다.

## 5단계 — 키트에서 호스트 자료 요청하기

Sensor의 Zeek·Suricata·Arkime와 Splunk에서 자산·기간을 좁힌 뒤 Velociraptor Hunt로 대상 장비의 남아 있는 EVTX·프로세스·서비스·설정 자료를 수집합니다. 수집 범위·artifact 버전·성공/실패·수집 시각을 기록합니다.

현재 프로세스 목록에서 SSH 터널이 없다고 과거 터널이 없었다고 말할 수 없습니다. 당시 프로세스·명령행·인증·네트워크 기록을 요청합니다. Hunt 수집은 상시 탐지가 아니므로 부재의 의미를 제한합니다. Hayabusa 규칙의 일치도 원문과 환경을 대조합니다.

## 6단계 — 정상 관리와 비교하고 인계하기

[통합 실습](network-capstone.html)의 N003·N004는 승인 여부를 확인할 정상 SSH 대조 사례입니다. N016·N017은 RDP 연결과 대상 로그인 성공을 각각 보여줍니다. N018은 같은 대상의 프로세스 생성이지만 로그온 ID와 부모가 없어 해당 RDP 세션의 실행으로 확정할 수 없습니다.

**0개 결과:** 동일 VLAN·가상 스위치의 공백, 터널·QUIC, 게이트웨이 주소, 이벤트 감사·보존·Hunt 상태와 파서를 확인합니다.

**완료 기준:** 승인 경로, 네트워크 연결, 인증, 대상 행동과 미확인 관계를 분리한 기록을 남깁니다. 계정과 내부 이동 범위는 [AD 조사](ad-investigation.html), 외부 관리 도구는 [ClickFix·RMM](clickfix-rmm-investigation.html)으로 이어갑니다.

## 참고자료

- [Microsoft — SMB 서명 제어](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-signing)
- [Microsoft — SMB over QUIC](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-over-quic)
- [Microsoft — 4624](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624)
- [Microsoft — WinRM 인증](https://learn.microsoft.com/en-us/windows/win32/winrm/authentication-for-remote-connections)
- [Microsoft — 5145](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-5145)
- [OpenBSD — sshd 설정](https://man.openbsd.org/sshd_config)
