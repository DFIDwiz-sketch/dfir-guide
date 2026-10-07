---
title: "시스템 이해에서 DFIR·퍼플팀까지"
description: "네트워크, Windows·AD, 프로그래밍, 공격 원리, 리버싱과 탐지의 학습 경로."
category: "learning"
updated: "2026-10-07"
tags: ["학습 로드맵", "실습", "전문 역량"]
order: "32"
level: "입문"
---

## 학습 목표

패킷과 시스템 동작을 설명하고, 통제된 환경에서 행동을 재현한 뒤 호스트·네트워크 증거를 찾아 탐지·대응으로 연결하는 능력을 기릅니다. 다음 순서는 권장 학습 설계이며 플랫폼의 공식 통합 커리큘럼은 아닙니다.

## 단계와 결과물

| 단계 | 주제 | 다음 단계로 가기 전 결과물 |
| --- | --- | --- |
| 1 | TCP/IP, ARP·DNS·HTTP·TLS·SMB·LDAP·RPC | 패킷과 로그로 통신 한 개 설명 |
| 2 | Windows·Linux 프로세스·서비스·파일·권한 | 실행·접근의 호스트 타임라인 |
| 3 | NTLM → Kerberos → AD → 자격 증명 | 인증·권한·공격 조건의 비교표 |
| 4 | Python과 C·메모리 기초 | 검증 가능한 로그 파서와 작은 C 프로그램 |
| 5 | 웹 보안과 공격 원리 | 원인·재현 조건·남는 흔적의 노트 |
| 6 | PE·디버거·정적·동적 분석 | 프로그램의 기능과 관찰 결과 설명 |
| 7 | 탐지·헌팅·대응 | SPL 조건·근거 이벤트·조사 플레이북 |
| 8 | 퍼플팀 통합 실습 | 개선 전후의 재현·관찰·재검증 보고서 |

## 참고할 학습 플랫폼

| 플랫폼 | 활용 목적 |
| --- | --- |
| PortSwigger Web Security Academy | 웹 취약점 원리와 제공 랩 |
| HTB Academy Penetration Tester | 침투 테스트 과정의 체계적 학습 |
| pwn.college | 시스템·저수준 보안 기초 실습 |
| Malware Unicorn RE101 | Windows 역분석 기초 |
| CyberDefenders | 블루팀 조사·분석 랩 |

각 플랫폼의 접근 조건·과정·비용은 현재 원문에서 확인합니다. 한꺼번에 등록하기보다 지금 필요한 주제를 골라 실습 결과를 남깁니다.

## 실습 도구를 연결하는 방법

Windows·Sysmon에서 실행과 계정의 흔적을 보고, Velociraptor로 필요한 아티팩트를 수집하며, Zeek·Suricata·Arkime으로 통신을 확인합니다. Splunk에서는 실제 필드 구조를 확인한 뒤 탐지 검색을 작성합니다. 모든 행동이 네트워크 흔적을 남기는 것은 아니며 각 센서의 가시성을 기록합니다.

## 한 주에 하나의 기술

[주간 ATT&CK 실습 노트](weekly-technique.html)의 형식으로 **원리 → 재현 → 흔적 → 탐지 → 대응**을 정리합니다. 다음 주제로 넘어가는 기준은 도구 실행 성공보다 행동을 설명하고 관찰 근거를 제시할 수 있는지입니다.

## 참고자료

- [PortSwigger Academy](https://portswigger.net/web-security)
- [HTB Academy — Penetration Tester](https://academy.hackthebox.com/path/preview/penetration-tester)
- [pwn.college](https://pwn.college/dojos)
- [Malware Unicorn — RE101](https://malwareunicorn.org/workshops/re101)
- [CyberDefenders Labs](https://cyberdefenders.org/blue-team-labs/)
