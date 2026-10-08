---
title: "방어 가능한 네트워크의 개념"
description: "관측·자산·통제·소유·공격 표면·평가·갱신·측정을 연결하고 자료를 중앙화합니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["1일차", "개념", "블루팀 필수지식"]
order: "205"
level: "입문 · 교재 중심"
course_day: "1"
course_order: "5"
chapter_title: "Defensible Network Concepts"
textbook_page: "46"
lesson_type: "개념"
---

## 방어 가능한 환경이란

방어 가능한 환경은 문제가 생겼을 때 볼 수 있고, 자산과 담당을 찾고, 필요에 맞는 통제를 적용하고, 결과를 다시 확인할 수 있는 환경입니다. 방화벽이나 EDR 한 가지가 모든 조건을 대신하지 않습니다.

Richard Bejtlich의 Defensible Network Architecture 관점에서 다음 질문을 정리할 수 있습니다. 표의 질문과 예시는 이 사이트의 설명입니다.

| 관점 | 확인 질문 | 남길 근거 |
| --- | --- | --- |
| Monitored · 관측 | 필요한 행위가 실제 남는가 | 정상 이벤트·수집·보존 |
| Inventoried · 목록 | 어떤 자산이 있는가 | 장비·서비스·신원 목록 |
| Controlled · 통제 | 누가 어떤 경로로 접근하는가 | 정책·허용 경로·실제 결과 |
| Claimed · 소유 | 담당과 운영 목적은 누구에게 있는가 | 소유자·지원·변경 담당 |
| Minimized · 최소화 | 필요 없는 기능과 노출을 줄였는가 | 서비스·권한·노출 검토 |
| Assessed · 평가 | 약점과 탐지 조건을 시험했는가 | 점검·재현·재검증 기록 |
| Current · 갱신 | 알려진 문제와 변경을 반영했는가 | 버전·패치·예외 기간 |
| Measured · 측정 | 개선이 근거로 보이는가 | 전후 결과·공백·추세 |

## 네트워크·호스트·서비스 자료의 차이

네트워크 자료는 통신의 상대와 관찰 가능한 프로토콜을 보여줍니다. 호스트 자료는 사용자·프로세스·파일·설정의 행동을, 앱·클라우드 감사는 서비스 내부의 접근과 변경을 보여줍니다.

외부 파일 수신 뒤 네트워크에서 후속 연결이 없더라도 호스트의 실행 여부는 별도 질문입니다. 반대로 현재 호스트 프로세스 목록만으로 이틀 전 통신을 재구성할 수 없습니다. 서로 다른 자료가 필요한 이유입니다.

## 중앙 검색과 원본 보존

자료 중앙화에는 수집, 전송, 파싱, 시간 해석, 저장과 검색 권한이 포함됩니다. 모든 자료를 같은 형식으로 바꿀 때 출처·원본·식별자·누락 필드를 보존합니다.

경보와 이벤트는 구분합니다. Suricata 경보가 들어왔다고 Zeek 로그와 PCAP, 호스트 감사도 확보된 것은 아닙니다. 중앙 검색 화면과 원본 저장소의 보존 기간도 확인합니다.

## 현재 키트에 적용하는 예

Sensor + 대상망 TAP은 통과하는 네트워크 자료를 상시 수집합니다. Core는 검색·분석 역할이고 분석 측 스위치와 연결됩니다. 각 영역의 방화벽과 실제 라우팅을 표시합니다.

호스트 자료는 필요 시 Velociraptor Hunt로 수집하고 결과를 Splunk에 넣습니다. 이를 상시 호스트 감시와 구분합니다. 같은 VLAN 내부·VM 내부·SaaS 서비스 측 행동은 TAP에서 안 보일 수 있습니다.

**작은 활동:** 업무 PC·DNS·파일 서버 각각에 필요한 자료, 담당과 공백을 한 줄씩 씁니다.

**완료 기준:** 보호 도구 목록 대신 관측 가능한 행동과 통제·소유·보존의 근거를 설명합니다.

## 최신 보강과 실무 연결

클라우드·임시 자산·토큰·암호화 통신은 자산과 관측 지도를 확장할 이유입니다. [관측 지도 운영](defensible-visibility.html)과 [수집 상태](telemetry-health.html)에서 검증 절차를 수행합니다.

## 공개 참고자료

- [Richard Bejtlich — Defensible Network Architecture 2.0](https://taosecurity.blogspot.com/2008/01/defensible-network-architecture-20.html)
- [ASD — 이벤트 로깅과 위협 탐지](https://www.cyber.gov.au/publication/best-practices-for-event-logging-and-threat-detection)
