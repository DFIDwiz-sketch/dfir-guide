---
title: "시스템 이해에서 DFIR·퍼플팀까지"
description: "입문 조사부터 네트워크, 시스템, 인증·AD, 프로그래밍, 악성코드와 퍼플팀까지 읽을 글·실습·완료 기준을 연결한 8단계 경로."
category: "learning"
updated: "2026-10-08"
tags: ["학습 로드맵", "실습", "전문 역량"]
order: "32"
level: "입문"
---

## 학습 방법과 시작점

각 단계에서 **읽기 → 작은 실습 → 원문 확인 → 결과 메모**를 반복합니다. 처음부터 모든 도구를 설치할 필요는 없습니다. [첫 조사 실습: 가상 로그 12개](first-investigation.html)는 텍스트 편집기만으로 시작할 수 있고 Python·Splunk로 확장할 수 있습니다.

아래는 사이트에서 구성한 학습 순서입니다. 플랫폼의 공식 통합 과정이나 특정 직무의 자격 기준은 아닙니다. 시간보다 단계별 결과물을 기준으로 진행합니다. 앞 단계에서 자료를 설명할 수 없다면 다음 도구를 추가하기 전에 그 부분을 다시 확인합니다.

## 1단계 — 조사 기록을 남기는 기본기

**읽을 글:** [DFIR 기본 6단계](dfir-basics.html), [증거 보존과 타임라인](evidence-timeline.html).

가상 자료를 원본과 분석 사본으로 나누고 해시·출처·기간을 적습니다. [첫 조사 실습](first-investigation.html)의 기록을 시간순으로 정리합니다.

**완료 기준:** 관찰된 사실, 가능한 설명, 추가로 필요한 자료를 서로 구분한 한 페이지 메모를 만들 수 있습니다.

## 2단계 — 데이터와 검색 구조 이해하기

**읽을 글:** [Splunk 검색 6단계](splunk-basics.html), [Zeek 로그](zeek-logs.html), [네트워크 도구 비교](network-tools.html).

인덱스·sourcetype·필드 이름을 확인하고 조건을 하나씩 넣습니다. 가상 자료로 종류별 건수를 구한 다음 실제 이벤트 한 개로 되돌아갑니다. 네트워크 요약과 경보·원본 패킷이 서로 다른 자료라는 점을 설명합니다.

**완료 기준:** 결과가 0개일 때 시간·인덱스·필드·수집 중 어느 단계부터 확인할지 결정할 수 있습니다.

## 3단계 — 네트워크 통신 한 개 설명하기

**읽을 글:** [네트워크 조사 7단계](network-investigation.html).

TCP/IP의 주소·포트·연결 상태를 시작으로 ARP·DNS·HTTP·TLS를 익힙니다. 관찰 가능한 PCAP에서 정상 통신 한 개를 고르고 요청·응답·이름 해석을 확인합니다. 이후 SMB·LDAP·RPC·SSH를 서비스 역할과 함께 공부합니다.

**완료 기준:** 센서 위치, 5-tuple, 요청·응답, 암호화와 수집 누락의 한계를 포함한 통신 메모를 만들 수 있습니다.

## 4단계 — Windows와 Linux 내부 동작 연결하기

**읽을 글:** [Windows 초기 조사](windows-triage.html), [이벤트 로그](windows-events.html), [Linux 초기 조사](linux-triage.html), [시스템 내부 구조](windows-internals.html).

시험 장비의 정상 프로세스 한 개를 선택해 부모·사용자·시작 시각·실행 경로와 연결을 조사합니다. Windows의 토큰·권한·서비스·레지스트리와 Linux의 사용자·권한·프로세스·서비스를 비교합니다. 휘발성 현재 상태와 디스크에 남은 과거 자료를 구분합니다.

**완료 기준:** PID 하나만으로 오래전 행동을 연결하면 왜 위험한지, 현재 목록에 없는 항목이 왜 과거의 부재를 뜻하지 않는지 설명할 수 있습니다.

## 5단계 — NTLM에서 Kerberos와 AD로 확장하기

**읽을 글:** [NTLM 전체 가이드](ntlm.html), [NTLM 조사 절차](ntlm-triage.html), [Kerberos](kerberos-basics.html), [AD 조사](ad-investigation.html), [자격 증명 구조](credential-architecture.html).

NTLM의 인증 자료·NT hash·Relay·Pass-the-Hash를 비교한 뒤 Kerberos의 TGT·TGS·SPN·위임을 학습합니다. 가상 자료에서 검증 장비와 실제 서비스 대상을 나누고 인증 이후 행동을 확인합니다.

**완료 기준:** 인증 성공, 서비스 접근과 권한 행사, 공격 방식의 확인을 별도 결론으로 작성할 수 있습니다. 서비스별 방어 조건과 필요한 증거도 함께 적습니다.

## 6단계 — Python·C와 웹 보안 기초

**읽을 글:** [보안 프로그래밍](security-programming.html), [Python 로그 파서](python-log-parser.html), [웹 보안](web-security-basics.html).

Python으로 작은 JSONL 파일의 이벤트 종류와 오류를 집계합니다. 입력 경로·필드 누락·인코딩·시간 파싱을 다룬 뒤 C의 포인터·메모리·스택과 힙을 공부합니다. 웹은 정상 HTTP 요청과 세션·인증·접근 제어를 먼저 이해한 후 제공되는 학습 랩을 사용합니다.

**완료 기준:** 직접 만든 파서에서 잘못된 입력을 정상 이벤트로 숨기지 않고, 웹 요청이 서버에서 어떤 처리를 거치는지 설명할 수 있습니다.

## 7단계 — 악성코드 분석과 위협 인텔리전스

**읽을 글:** [리버스 엔지니어링 기초](reverse-basics.html), [악성코드 행동 분석](malware-behavior.html), [APT 분석](apt-analysis.html), [Lazarus 사례 읽기](lazarus-study.html).

작은 정상 프로그램으로 파일 형식·문자열·imports·API·디버거와 어셈블리의 연결을 익힙니다. 공개 보고서에서는 관찰 사실·분석자의 추정·기관의 귀속을 구분하고 행동을 ATT&CK 원문에 대조합니다. 실제 악성 샘플을 일반 업무 PC에서 실행하는 과정은 이 입문 경로에 포함하지 않습니다.

**완료 기준:** 관찰 가능한 행동과 근거를 설명하고, 도구나 기법이 같다는 이유만으로 특정 조직에 귀속하지 않습니다.

## 8단계 — 탐지·대응과 퍼플팀 검증

**읽을 글:** [Velociraptor 7단계](velociraptor.html), [예약 작업 실습](scheduled-tasks.html), [탐지 설계](blue-detection.html), [퍼플팀 검증](purple-validation.html), [초기 대응](incident-triage.html).

정상 예약 작업 하나를 만들어 생성·변경·실행·삭제를 관찰합니다. 호스트 원문, 수집 결과, SIEM 검색과 경보까지 도착 여부를 각각 기록합니다. 정상 사례와 비교하고 수집 누락이나 불필요한 경보 조건을 수정한 뒤 같은 실습을 반복합니다.

**완료 기준:** 실행 성공과 탐지 성공을 따로 증명하고, 개선 전후에 무엇이 바뀌었는지 근거를 제시할 수 있습니다.

## 기초 실습 다음의 연결 과정

첫 조사 메모를 완성했다면 다음 세 묶음 중 필요한 경로를 선택합니다. 각 글의 완료 기준을 충족한 뒤 다음 글로 넘어갑니다.

집에서 AD 공격과 블루팀 조사를 함께 연습하려면 [GOAD-Light 전체 과정](goad-light-overview.html) → [Windows/VirtualBox 설치](goad-light-install.html) → [Splunk·센서 수집](goad-light-telemetry.html) → [공격 행동과 조사](goad-light-investigation.html)로 진행합니다. VM 자원이 부족하면 수동 EVTX와 PCAP부터 시작할 수 있습니다.

| 경로 | 읽고 수행할 순서 | 완성할 결과물 |
| --- | --- | --- |
| 인증과 권한 | [Kerberos](kerberos-basics.html) → [AD 조사](ad-investigation.html) → [자격 증명 보호](credential-architecture.html) | 티켓·검증·대상 접근과 권한을 구분한 인증 조사표 |
| 시스템 증거 | [Windows 내부 구조](windows-internals.html) → [Linux 지속성](linux-persistence.html) → [메모리 조사](memory-investigation.html) | 현재 상태·설정·과거 실행을 구분한 호스트 메모 |
| 탐지와 대응 | [탐지 설계](blue-detection.html) → [레드팀 검증](red-team-validation.html) → [퍼플팀 검증](purple-validation.html) → [초기 대응](incident-triage.html) | 규칙 검증표, 구간별 수집 확인과 대응·인계 기록 |

Windows·AD 실습 환경이나 메모리 이미지가 없는 경우에는 가상 자료와 조사 계획부터 작성합니다. 아직 실행하지 않은 단계를 완료된 실험으로 기록하지 않습니다.

## 주간 학습 운영

한 주에 한 행동을 [주간 ATT&CK 실습 노트](weekly-technique.html)로 정리합니다. 첫 주는 정상 PowerShell 실행, 다음 주는 예약 작업으로 시작합니다. 공격의 명령어 수보다 **원리 → 흔적 → 탐지 → 대응**을 연결한 결과물의 품질을 확인합니다.

| 진행 상태 | 다음 행동 |
| --- | --- |
| 개념이 불명확함 | 기본 구조와 정상 동작부터 다시 설명하기 |
| 행동은 했지만 로그가 없음 | 정책·센서·수집·보존을 단계별로 확인하기 |
| 로그는 있지만 검색이 안 됨 | 시간·인덱스·필드와 원문을 비교하기 |
| 경보가 너무 많음 | 정상 관리 사례와 추가 맥락 비교하기 |
| 근거를 설명할 수 있음 | 조건을 하나만 바꾸고 재검증하기 |

## 학습 플랫폼 활용

PortSwigger Academy는 웹 학습 랩, HTB Academy는 체계적인 침투 테스트 학습, pwn.college는 시스템·저수준 기초, Malware Unicorn RE101은 역분석 기초, CyberDefenders는 조사 실습에 활용할 수 있습니다. 비용·접근 조건·과정 구성은 각 원문에서 확인하고 현재 단계에 필요한 자료를 선택합니다.

## 참고자료

- [PortSwigger Academy](https://portswigger.net/web-security)
- [HTB Academy — Penetration Tester](https://academy.hackthebox.com/path/preview/penetration-tester)
- [pwn.college](https://pwn.college/dojos)
- [Malware Unicorn — RE101](https://malwareunicorn.org/workshops/re101)
- [CyberDefenders Labs](https://cyberdefenders.org/blue-team-labs/)
