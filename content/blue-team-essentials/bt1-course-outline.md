---
title: "과정 개요"
description: "1일차 14개 장과 분할 학습을 사건 사례·기록지·실습으로 연결하는 상세 학습 안내입니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["1일차", "안내", "블루팀 필수지식"]
order: "201"
level: "입문 · 교재 중심"
course_day: "1"
course_order: "1"
chapter_title: "Course Outline"
textbook_page: "4"
lesson_type: "안내"
---

## 1일차를 배우는 목적

1일차의 주제는 도구 이름 암기가 아니라 **보호할 업무를 정하고, 관측 자료에서 조사할 조건을 찾고, 판단과 조치를 기록하는 운영 과정**입니다. SOC가 위험을 줄인다는 설명을 실제 작업으로 바꾸려면 자산·사람·권한·로그·사건 기록을 연결해야 합니다. 최신 제품을 추가하더라도 이 연결이 없으면 경보는 쌓이고 대응의 근거는 사라집니다.

2022년 교재의 장 제목과 순서를 유지했습니다. 긴 장은 장 개요를 먼저 읽은 뒤 제목 아래의 분할 학습으로 들어갑니다. VM·TheHive·MISP·Elastic 실습은 해당 교재의 학습 목표에 맞춘 **새로운 가상 자료 실습**입니다. 원본 Lab Workbook의 지시문이나 교재 VM을 재배포하는 방식은 아닙니다.

## 장별로 연결되는 질문

| 교재 구간 | 이 구간에서 풀 질문 | 남길 결과물 |
| --- | --- | --- |
| Welcome / VM Setup | 무엇을 방어하고 어떤 환경에서 연습할까? | 업무 목표, 실습 환경표 |
| SOC Overview | 누가 판단하고 누가 조치할까? | SOC 임무·권한·인계 표 |
| Defensible Network | 어떤 행동이 어느 자료에 남을까? | 자산별 관측 지도와 공백 |
| Events, Alerts, Anomalies, and Incidents | 이상함과 침해를 어떻게 구별할까? | 경보 분류와 추가 확인 질문 |
| Incident Management / TheHive | 조사 작업과 증거를 어떻게 연결할까? | 담당·작업·판단이 있는 사건 기록 |
| Threat Intelligence / MISP | 외부 정보를 어떻게 판단에 사용할까? | 맥락·출처·공유 범위가 있는 정보 |
| SIEM and Automation | 무엇을 검색하고 무엇을 자동화할까? | 탐지 유스케이스와 안전한 자동화 |
| Know Your Enemy | 어떤 공격 행동에 먼저 대비할까? | 관측·통제·대응을 연결한 위협 모델 |
| Summary / Elastic | 배운 개념을 한 사례에 적용할 수 있을까? | 타임라인과 근거를 포함한 인계 문서 |

## 이번 학습의 공통 사례

교육용 조직의 계정 `learner`에서 새 장치 로그인과 메일 전달 규칙 생성이 관측됩니다. 같은 시각 내부 PC의 정상 DNS 조회와 백업 프로세스도 기록됩니다. 새 장치 로그인이 곧 침해를 뜻하는지, 내부 PC의 백업이 관련 행동인지, 세션 폐기 요청만으로 대응이 끝났는지를 순서대로 따져봅니다.

자료는 [1일차 사례 로그 16건](downloads/blue-team-day1-case.ndjson), 기록지는 [1일차 학습 워크북](downloads/blue-team-day1-workbook.md)입니다. IP는 문서용 대역, 도메인과 계정은 가상 값입니다. 날짜는 데이터 검색 연습을 위한 고정값이며 실제 보안 사건을 가리키지 않습니다. 도구 없이 파일을 읽어도 시작할 수 있습니다.

이 자료에는 원시 보안 이벤트뿐 아니라 경보, 담당자 확인, 대응 결과, 수집 상태도 들어 있습니다. `record_type`을 먼저 확인하고 같은 종류의 로그처럼 세지 않습니다. 보안 제품이 실제로 출력하는 표준 스키마가 아니라, 서로 다른 자료의 역할을 비교하기 위한 교육용 공통 형식입니다.

## 학습을 두 번에 나누는 방법

첫 번째 읽기에서는 각 장의 설명을 따라 **용어·자료·도구 역할**을 이해합니다. 두 번째 읽기에서는 분할 학습과 네 실습을 이용해 임무 문서, 관측 지도, 사건 기록, 탐지 설명서를 작성합니다. 시간이 부족하면 SOC → 관측 → 경보 → 사건 기록 → Elastic 순으로 공통 사례를 먼저 완주하고 TIP·자동화·위협 모델을 보완합니다.

읽은 글 수보다 결과물이 중요합니다. “침해 의심” 한 줄 대신 어떤 기록이 판단을 지지하고, 무엇은 아직 알 수 없으며, 다음 담당자가 무엇을 확인할지 설명할 수 있어야 합니다.

## 2022년에서 보완할 부분

| 교재에서 유지할 기본기 | 현재 함께 살필 내용 |
| --- | --- |
| 사람·절차·기술과 위험에 따른 운영 | NIST SP 800-61 Rev. 3의 위험 관리와 사고 대응 연결 |
| 네트워크와 호스트 관측의 결합 | 클라우드 제어면·SaaS·계정·토큰 감사 자료 |
| 사건 기록·정보 공유·자동화 | 현재 제품의 라이선스, API 권한, 공유 경계와 실패 처리 |
| 공격자의 목표와 행동 분석 | 바뀐 명명 체계와 공급망·아이덴티티 조사 |

최신 보강은 새로운 유행어를 별도로 나열하는 대신 각 장의 판단과 실습에 넣었습니다. 예를 들어 SaaS 계정 사건은 호스트 악성 파일 없이도 발생할 수 있으므로, 관측 지도와 대응 계획에 세션·메일 감사가 필요합니다.

## 자주 나오는 용어를 역할로 기억하기

| 용어 | 풀어 쓴 이름·의미 | 이 과정에서 하는 일 |
| --- | --- | --- |
| SOC | Security Operations Center | 지속 관측·분류·조사·대응 조율 |
| NSM | Network Security Monitoring | 통신과 네트워크 활동 관측 |
| CSM | Continuous Security Monitoring | 지속적인 보안 상태·활동 관측 관점 |
| IMS | Incident Management System | 사건·작업·근거·결정 기록 |
| TIP | Threat Intelligence Platform | 정보 맥락·관계·조회·공유 |
| SIEM | Security Information and Event Management | 로그·경보 검색과 연관 분석 |
| SOAR | Security Orchestration, Automation and Response | 여러 작업의 자동화·분기·연결 |
| IOC | Indicator of Compromise | 침해 관련 지표, 맥락·판정과 함께 사용 |
| API | Application Programming Interface | 제품 간 허용된 기능 호출 |
| KQL | Kibana Query Language | 이 실습의 필터 조건 표현 |
| PCAP | Packet Capture | 관측 지점의 패킷 원문 자료 |

## 시작 전 학습 활동

워크북의 조직 설명을 읽고 “가장 보호해야 할 업무”, “자료가 있는 시스템”, “조치 승인이 필요한 담당”을 한 줄씩 적으세요. 마지막 실습에서 같은 세 문장을 다시 읽고 어떤 근거가 추가됐는지 비교합니다.

## 공개 참고자료

- [NIST — SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
- [ASD — 이벤트 로깅과 위협 탐지](https://www.cyber.gov.au/publication/best-practices-for-event-logging-and-threat-detection)
