---
title: "추가 네트워크 프로토콜"
description: "DHCP 자산 연결과 SMB·SSH·RDP·WinRM·FTP·ICMP·원격 관리 도구의 관측·오용을 검증합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "개념", "블루팀 필수지식"]
order: "310"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "10"
chapter_title: "Additional Network Protocols"
textbook_page: "161"
lesson_type: "개념"
---

## 포트 번호를 행동으로 연결하기

DNS·HTTP·메일 이외의 프로토콜도 자산 식별, 원격 관리, 파일 이동과 내부 확산에 중요합니다. 특정 포트가 열려 있거나 연결을 관측했다는 것과 계정 로그인·명령 실행·유출 성공은 다른 사실입니다. 먼저 정상 역할과 승인 경로를 확인합니다.

교재의 DHCP, SMB, SSH, RDP/VNC, PowerShell Remoting, FTP, ICMP와 원격 관리 도구를 두 상세 글로 나눕니다. 첫 글은 IP를 사건 시각의 자산으로 연결하고, 두 번째 글은 정상 관리와 오용을 구별하는 증거를 정리합니다.

## 프로토콜별 조사 질문

| 프로토콜·기능 | 정상 역할 | 오용 후보를 검증할 자료 |
| --- | --- | --- |
| DHCP | 주소·설정 배정 | 임대 기간·장치·NAC·자산 목록 |
| SMB | 파일·프린터·Windows 관리 관련 | 계정·공유·파일·서비스/실행 자료 |
| SSH/SFTP | 암호화 관리·파일 이동 | 인증·세션·명령·전송 감사 |
| RDP/VNC | 원격 화면 | 로그인·연결·세션·승인 작업 |
| WinRM/PSRP | 원격 관리·PowerShell | 인증·WinRM·스크립트·실행 자료 |
| FTP/ICMP | 파일 이동·망 상태 | 사용 정책·페이로드·규모·정상 기준 |
| HTTPS 기반 관리 도구 | 지원·운영 | 도구 승인·tenant·원격 세션·설치 기록 |

## 시간 기준으로 자산을 찾기

N01과 N24는 같은 IP가 다른 시각에 다른 장치에 배정된 상황입니다. 09:09의 N21은 09:09를 포함하는 N01의 임대 구간으로 연결합니다. 현재 IP 소유자만으로 과거 사건을 조사하지 않습니다. DHCP의 장치 이름·MAC도 위조·랜덤화될 수 있어 자산·스위치·NAC 등과 대조합니다.

## 원격 관리와 내부 이동

SMB/445 연결 하나는 명령 실행 증거가 아닙니다. 파일 공유 접근일 수 있습니다. 원격 실행을 조사하려면 인증·관리 공유·서비스 생성·프로세스 등 관련 자료가 필요합니다. SSH·RDP·WinRM 역시 정상 운영에 필요한 경로일 수 있어 승인 주체·작업과 실제 행동을 비교합니다.

이 환경에서는 네트워크를 계속 색인하고, 필요하면 대상 단말·서버에서 Hunt로 이벤트를 가져와 Hayabusa 등으로 분석합니다. N23에는 요청만 있으므로 단말 증거를 상시 보유한 것으로 설명하지 않습니다.

## 현재 보안 기본값의 보강

Microsoft 문서 기준 Windows 11 24H2 Enterprise·Pro·Education은 양방향 SMB 서명을 기본 요구하고 Windows Server 2025는 기본적으로 outbound 서명을 요구합니다. 에디션·정책·실제 설정을 확인해야 하며 “모든 새 Windows에서 똑같다”고 일반화하지 않습니다. 서명은 전송 무결성 등에 관련되고 콘텐츠 암호화와는 구별됩니다.

일반 관리 도구가 HTTPS를 쓴다고 정상이라는 판정을 주지 않습니다. 미승인 설치, 외부 관리 tenant, 예상 밖 세션·계정과 지속 실행을 확인합니다. 도구 이름만으로 악성 판정하지 않으며 승인 목록도 정기적으로 갱신합니다.

## 학습 활동

N21을 사건 시각의 자산으로 연결하고, 현재 확인 가능한 연결과 미확인인 계정·파일·실행을 분리합니다. 상세 글에서 작성한 자료 요청 표를 워크북의 조사 기록에 넣습니다.

## 공개 참고자료

- [RFC 2131 — DHCP](https://www.rfc-editor.org/rfc/rfc2131.html)
- [Microsoft — SMB signing](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-signing)
- [MITRE ATT&CK — Remote Access Tools](https://attack.mitre.org/techniques/T1219/)
