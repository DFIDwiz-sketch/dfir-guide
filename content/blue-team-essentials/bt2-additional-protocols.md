---
title: "추가 네트워크 프로토콜"
description: "DHCP 자산 대응과 SMB·SSH·RDP·VNC·PowerShell Remoting·FTP·ICMP·원격 관리의 기본."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["2일차", "개념", "블루팀 필수지식"]
order: "310"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "10"
chapter_title: "Additional Network Protocols"
textbook_page: "161"
lesson_type: "개념"
---

## 프로토콜 이름과 실제 행동 구분하기

추가 프로토콜은 자산을 식별하고 파일·계정·관리·내부 이동을 이해하는 데 필요합니다. “포트가 보였다”, “로그인했다”, “파일에 접근했다”, “실행했다”는 서로 다른 결론입니다.

## DHCP로 당시 자산 찾기

DHCPv4는 주소와 설정을 할당합니다. 처음 주소를 얻는 일반 흐름은 Discover → Offer → Request → Acknowledge로 설명할 수 있으며 서버·클라이언트는 보통 UDP/67·68을 사용합니다. 갱신과 다른 상태에서는 같은 네 단계가 모두 반복되지 않을 수 있습니다.

조사 시 IP, MAC·클라이언트 ID, 호스트 이름과 lease 시작·종료·갱신을 연결합니다. 현재 주소 목록을 이틀 전 대응으로 쓰지 않습니다. MAC·호스트 이름도 위조·복제될 수 있어 개인 신원을 보증하지 않습니다.

## 파일과 원격 접속

| 방식 | 정상 용도 | 방어 질문 |
| --- | --- | --- |
| SMB | 파일·프린터·관리 통신 | 어떤 계정·공유·권한·파일을 사용했는가 |
| SSH / SFTP | 원격 셸·파일·터널 | 승인된 키·계정·경로·터널인가 |
| RDP | 원격 데스크톱 | 게이트웨이·대상·계정·세션은 무엇인가 |
| VNC | 원격 화면·제어 | 구현·인증·암호화·승인은 적절한가 |
| PowerShell Remoting | 원격 관리·실행 | WinRM 또는 SSH, 인증·메시지 보호·실행 기록 |
| FTP / FTPS | 파일 전송 | 제어·데이터 채널·암호화·대상 파일 |
| ICMP | 오류·진단·네트워크 기능 | 타입·코드·패턴·내용과 정상 기준 |

SMB1·2·3의 기능·방어 조건은 다릅니다. SMB 서명은 무결성 보호, 암호화는 콘텐츠 기밀성 보호입니다. 하나가 설정됐다고 다른 하나도 항상 켜진 것은 아닙니다.

SSH는 암호화된 원격 연결이며 터널 안의 다른 프로토콜이 센서에서 보이지 않을 수 있습니다. SFTP는 SSH 기반이며 FTP·FTPS와 다릅니다. FTP는 별도 데이터 연결이 있어 제어 포트만으로 전송 범위를 설명할 수 없습니다.

## 관리 도구도 승인과 행동으로 분석하기

정상 RMM·터널·원격 지원 제품도 악용될 수 있습니다. 설치·서명·공급자 이름 외에 승인 담당·세션·계정·대상과 실행 기록을 확인합니다. ICMP 페이로드가 길거나 원격 접속이 있었다고 자동 침해로 결론 내리지 않습니다.

## 작은 활동 — 세 자료 연결하기

가상 RDP 연결 N016, 대상 로그인 N017, 프로세스 N018을 비교합니다. 포트·로그온 유형·계정·대상·로그온 ID·부모의 존재와 누락을 적습니다. 같은 호스트·시각만으로 해당 세션의 명령 실행을 확정하지 않습니다.

**완료 기준:** 프로토콜별 정상 목적, 악용 가능성, 필요한 호스트·서비스 자료를 설명합니다.

## 최신 보강과 실무 연결

Windows 11 24H2의 에디션과 Server 2025 방향에 따라 SMB 서명 기본 요구가 다릅니다. SMB over QUIC도 검토합니다. 현재 키트의 Hunt와 조사는 [원격 프로토콜 가이드](remote-protocol-investigation.html)로 연결합니다.

## 공개 참고자료

- [RFC 2131 — DHCPv4](https://www.rfc-editor.org/rfc/rfc2131.html)
- [Microsoft — SMB 서명](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-signing)
- [Microsoft — PowerShell Remoting](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/running-remote-commands)
