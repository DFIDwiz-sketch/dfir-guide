---
title: "추가 프로토콜 상세 2 · SMB·SSH·RDP·WinRM·원격 도구"
description: "정상 관리·파일 이동과 원격 실행·유출을 구별하고 프로토콜별 후속 증거를 요청합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "분할 학습", "블루팀 필수지식"]
order: "310.02"
level: "입문 · 상세 해설"
course_day: "2"
course_order: "10"
chapter_title: "Additional Network Protocols"
textbook_page: "166"
lesson_type: "분할 학습"
chapter_parent: "bt2-additional-protocols"
part_order: "2"
textbook_range: "166–176"
---

## 연결에서 계정·행동으로 내려가기

TCP/445·22·3389·5985·5986은 서비스 후보를 찾는 데 도움이 됩니다. 실제 서비스가 다른 포트를 쓰거나 프록시·게이트웨이를 거칠 수 있습니다. 포트만으로 실행 도구를 정하거나 로그인 성공을 주장하지 않습니다. 사용자·자산·시간·대상·승인 작업과 동작 증거를 연결합니다.

| 기능 | 네트워크 단서 | 후속 증거 | 정상 맥락 |
| --- | --- | --- | --- |
| SMB | 공유·서비스 연결 후보 | 인증·공유 접근·파일·서비스·프로세스 | 업무 공유·배포·백업 |
| SSH/SFTP | 암호화 연결·장기 세션 | 서버 인증·세션·감사·전송 | 운영·배치·파일 이동 |
| RDP/VNC | 원격 화면 서비스 후보 | 로그인·세션·작업 기록 | 지원·관리·가상 데스크톱 |
| WinRM/PSRP | 관리 서비스 통신 | 인증·WinRM·스크립트·프로세스 | 원격 운영·자동화 |
| 관리 에이전트 | HTTPS·지속 연결·설치 | 승인·관리 tenant·세션·작업 | 정해진 지원 계약 |

## SMB는 공유 접근과 실행이 다르다

SMB 자체는 파일·프린터 공유 등 다양한 기능에 쓰입니다. 원격 실행 도구는 관리 권한, 공유·RPC·서비스 제어 등의 기능을 조합할 수 있습니다. N21의 SMB 연결만으로 PsExec 실행을 단정하지 않습니다. 계정과 대상 서버의 공유 접근·서비스 생성·프로세스 자료를 확인해야 합니다.

관리자 암호를 여러 장치에서 공유하면 계정 오용의 범위가 커질 수 있습니다. 장치별 관리 권한, 원격 관리 경로와 인증을 제한하고 필요 없는 SMBv1·외부 노출을 점검합니다. 내부 SMB를 모두 끄는 조치를 자동 제안하기보다 정상 업무 경로를 확인합니다.

현재 Microsoft 문서는 Windows 11 24H2 Enterprise·Pro·Education의 양방향 서명 요구, Server 2025의 outbound 요구, Home의 차이를 구별합니다. 실제 정책·서버 호환성·협상 상태를 확인합니다. SMB 서명이 활성화되어도 악성 권한 사용을 자동으로 막지는 않으며 SMB 암호화와 같은 뜻도 아닙니다.

## SSH·RDP·WinRM

SSH는 원격 셸·파일 전송·포워딩 등 기능을 가질 수 있습니다. 암호화 Flow만으로 내부 명령·파일을 읽을 수 없으므로 서버 감사와 계정·작업을 확인합니다. 이 학습은 우회 터널 구축을 실습하지 않고 승인 경로와 이상 사용을 조사합니다.

RDP는 TCP뿐 아니라 구성에 따라 UDP도 사용하고 게이트웨이를 거칠 수 있습니다. 로그인 유형 10 같은 Windows 이벤트는 단서지만 전체 세션·작업·계정 정상성까지 한 이벤트로 정하지 않습니다. 연결과 인증 성공, 실제 세션·행동을 구별합니다.

PowerShell Remoting은 WinRM 기반 PSRP 또는 SSH 전송 등 구성을 사용할 수 있습니다. WinRM의 HTTP/5985라고 해서 모든 명령이 무조건 평문으로 노출된다고 가정하지 않습니다. 인증·메시지 보호·HTTPS 구성에 따라 다릅니다. 제공되지 않은 PowerShell 로그는 필요 시 Hunt로 수집합니다.

## FTP·ICMP·HTTPS 기반 관리

FTP는 제어와 데이터 연결이 나뉘고 일반 FTP의 인증·내용이 보호되지 않을 수 있습니다. FTPS와 SSH 기반 SFTP는 서로 다른 방식입니다. 사용하지 않는 프로토콜이 나타나면 원인 앱·승인·전송 자료를 조사합니다.

ICMP의 반복·크기·페이로드도 후보가 될 수 있지만 진단·경로 MTU·오류 처리 등 정상 역할이 있습니다. 모든 ICMP를 차단하는 조치가 항상 적절하지는 않습니다. 정상 맥락과 보호 정책을 확인합니다.

일반 원격 관리 도구도 탈취 계정·미승인 설치·외부 tenant와 연결되면 오용될 수 있습니다. HTTPS와 정상 서명만으로 면제하지 않고 설치·세션·운영 승인을 검토합니다.

## 학습 활동

N21에서 확인한 것은 단말 주소→서버의 SMB 연결입니다. 계정·공유·파일·서비스·실행은 미확인입니다. N23의 결과를 얻을 때까지 그 상태를 유지하고 필요한 로그와 기간을 적습니다. 사건 요약에는 네트워크 관측과 후속 단말 증거의 출처를 분리합니다.

## 공개 참고자료

- [Microsoft — SMB signing](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-signing)
- [Microsoft — PowerShell Remoting security](https://learn.microsoft.com/en-us/powershell/scripting/security/remoting/winrm-security?view=powershell-7.5)
- [MITRE ATT&CK — Remote Services](https://attack.mitre.org/techniques/T1021/)
- [MITRE ATT&CK — Remote Access Tools](https://attack.mitre.org/techniques/T1219/)
