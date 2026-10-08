---
title: "GOAD-Light 공격·탐지 실습: 시작 안내"
description: "Windows PC에서 GOAD-Light를 격리해 설치하고 공격 행동과 블루팀 증거를 비교하는 입문 과정의 전체 지도."
category: "learning"
updated: "2026-10-08"
tags: ["GOAD-Light", "Active Directory", "퍼플팀", "실습"]
order: "40"
level: "입문"
---

## 이 과정에서 만들 것

GOAD-Light는 의도적으로 취약하게 만든 Active Directory 연습 환경입니다. 공식 프로젝트는 **Windows VM 3대, 포리스트 1개, 도메인 2개**로 소개합니다. 여기에 공격자용 VM과 분석용 VM을 별도로 더합니다. GOAD 서버 세 대만으로 Splunk·센서까지 구동된다는 뜻은 아닙니다.

| 역할 | 구성 | 먼저 확인할 것 |
| --- | --- | --- |
| 공격 대상 | GOAD-Light의 kingslanding(DC01), winterfell(DC02), castelblack(SRV02) | 설치 완료·IP·DNS·시간 |
| 공격자 | Kali 또는 Ubuntu VM | 랩 대역으로만 도달하는지 |
| 분석 서버 | Splunk Enterprise가 있는 Linux VM | Windows 이벤트를 검색할 수 있는지 |
| 호스트 수집 | Windows Security 및 선택한 Sysmon/Velociraptor | 원본 이벤트와 Splunk 수신 비교 |
| 네트워크 수집 | Zeek·Suricata·Arkime를 실행할 별도 Sensor VM | **미러된 패킷**이 실제로 보이는지 |

사용자님의 실무 키트에 대응하면 분석 서버가 **Core**, 패킷 미러를 받는 VM이 **Sensor**에 가깝습니다. 다만 VirtualBox 호스트 전용 네트워크가 자동으로 TAP이 되는 것은 아닙니다. Splunk로 들어가는 호스트 이벤트는 이 가정용 랩에서 연속 수집을 검증하기 위한 선택이며, 실제 키트의 **네트워크 상시 수집·엔드포인트 Velociraptor Hunt 수시 수집** 정책과는 구분합니다.

## 읽는 순서와 완료 조건

1. [01 · Windows와 VirtualBox에 GOAD-Light 설치](goad-light-install.html): 세 VM이 부팅되고 도메인과 IP를 기록합니다.
2. [02 · 블루팀 로그 수집 환경 구성](goad-light-telemetry.html): 4688 또는 4624 원본 이벤트 한 건을 Splunk에서 같은 호스트·시각으로 찾습니다.
3. [03 · 공격 행동과 조사 실습](goad-light-investigation.html): 정상 기준선, 정찰, 인증, 예약 작업을 각각 **행동 기록 → 탐지 → 원문 확인 → 판정**으로 수행합니다.

한 단계를 끝냈다는 기준은 설치 화면이 나타난 것이 아니라 **명령/클릭의 결과, 원본 증거, 수집 결과, 해석**을 한 줄씩 남긴 것입니다. 실습 노트 예시는 아래와 같습니다.

| 시각(시간대) | 행동·출발지 | 대상 | 원본 | Splunk/센서 | 판정·다음 확인 |
| --- | --- | --- | --- | --- | --- |
| 14:05 AEST | 시험 계정으로 로그온 | castelblack | Security 4624, LogonType | 같은 host/EventCode | 승인된 시험 로그온 |

## 시작 전 결정

- **가상화 호스트:** 이 가이드는 Windows 10/11 PC + VirtualBox + Vagrant + WSL 1의 공식 경로를 기본으로 설명합니다. GOAD와 도구 버전별 지원 범위를 설치 직전 공식 문서와 대조합니다.
- **용량:** 공식 Windows 안내는 GOAD-Light 구동에 **적어도 약 20 GB RAM**을 제시합니다. 이는 전체 블루팀 도구의 메모리를 포함한 수치가 아닙니다. GOAD 설치 페이지의 약 115 GB 디스크 예시는 전체 랩/이미지 기준이므로 센서, Splunk 데이터와 스냅샷 공간을 추가로 확보합니다.
- **네트워크:** 인터넷 연결은 설치 파일을 받을 때만 사용하고 취약한 서버의 **호스트 전용 어댑터를 외부 브리지로 변경하지 않습니다**. 분석 서버·공격자도 해당 랩 대역에서만 접속하도록 구성합니다. NAT 보조 어댑터가 필요한 순간에는 노출 서비스를 점검하고 작업 뒤 끕니다.
- **Windows 평가판:** 공식 GOAD README는 Windows 평가 VM의 사용 기간을 180일로 설명합니다. 기간이 지난 이미지는 적법한 라이선스를 적용하거나 랩을 재구축합니다.

## 현실적인 세 단계

| 단계 | 추가 VM·자료 | 검증 목표 |
| --- | --- | --- |
| A · 최소 실습 | GOAD 3대 + 공격 VM; Windows 이벤트를 EVTX로 수동 내보내기 | 랩 동작과 사건 타임라인 이해 |
| B · 호스트 블루팀 | Splunk VM + Windows Universal Forwarder | 4624·4688·4698를 원격 검색 |
| C · 패킷 블루팀 | 실제 미러 포트를 가진 Sensor VM + Zeek/Suricata/Arkime, 필요시 Velociraptor | 이벤트와 세션·패킷을 같은 시간선에 연결 |

메모리가 모자라면 B/C를 억지로 동시 구동하지 말고 A를 먼저 완료합니다. 도구마다 별도 VM과 라이선스/디스크 요구가 있으므로 총 요구량을 고정 숫자로 약속하지 않습니다.

## 참고자료

- [Orange Cyberdefense — GOAD README](https://github.com/Orange-Cyberdefense/GOAD)
- [GOAD-Light 구성](https://orange-cyberdefense.github.io/GOAD/labs/GOAD-Light/)
- [GOAD Windows 준비](https://orange-cyberdefense.github.io/GOAD/installation/windows/)
