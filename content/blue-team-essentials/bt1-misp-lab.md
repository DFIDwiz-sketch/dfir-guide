---
title: "실습 1.2: MISP 위협 인텔리전스 플랫폼"
description: "시험 정보 묶음에 관찰값·관계·출처·공유 조건을 붙이고 상관관계를 검토합니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["1일차", "자체 실습", "블루팀 필수지식"]
order: "210"
level: "입문 · 교재 중심"
course_day: "1"
course_order: "10"
chapter_title: "EXERCISE 1.2: MISP Threat Intelligence Platform"
textbook_page: "132"
lesson_type: "자체 실습"
---

## 실습 목표와 준비

자체 정보 카드 또는 시험 MISP 조직을 사용합니다. 도메인은 study.example, 문서용 IP는 192.0.2.20으로 정하며 악성으로 판정하지 않습니다. 이 실습은 실제 Feed와 외부 공유를 연결하는 활동이 아닙니다.

## 1단계 — 정보 요구와 Event 만들기

요구를 “가상 업무 PC가 접속한 이름·주소·기간을 정리한다”로 씁니다. 제목 LAB-BT1-INTEL, 날짜·출처·분석 담당과 “자체 가상 자료” 표시를 붙입니다. MISP에서는 시험용 Event에 해당 항목을 적습니다.

Distribution은 실제 공유 수신자 설정입니다. 연습 데이터는 자신의 시험 조직 안에서만 사용하는 범위로 정합니다. TLP 태그만으로 배포가 자동 제한된다고 가정하지 않습니다.

## 2단계 — Attribute와 설명 입력하기

| 유형 | 값 | 설명 |
| --- | --- | --- |
| domain | study.example | 가상 요청 이름 |
| ip-dst | 192.0.2.20 | 가상 응답·접속 후보 |
| text | LAB-BT1-INTEL | 출처·맥락·관찰 기간 |
| link | 이 실습 글의 공개 URL | 자체 자료의 설명 위치 |

Event 전체 제목을 개별 IOC로 넣지 않습니다. 값은 실제 유형에 맞추고 맥락을 Comment 또는 정보 카드에 적습니다. to_ids 등 탐지 활용 옵션은 학습 관찰값을 곧바로 운영 탐지·차단으로 내보내지 않도록 검토합니다.

## 3단계 — 관계와 상관관계 구분하기

다른 시험 Event에도 study.example을 넣으면 동일 값의 관계 후보를 확인할 수 있습니다. 같은 값이라는 사실과 같은 공격이라는 해석을 분리합니다. 한 Event의 IP가 오래전 재할당됐다면 같은 사건이라고 자동 합치지 않습니다.

## 4단계 — 관찰과 품질 기록하기

관찰 시각·호스트·증거 ID, 출처 신뢰와 미확인 사항을 남깁니다. Sighting·Tag·Taxonomy·Object는 필요에 맞게 사용하며 실제 제공 버전의 지원을 확인합니다.

제품을 사용하지 않으면 위 표 아래에 “동일 값 관찰”, “원인 관계 미확인”, “운영 차단 용도 아님”을 적어 같은 결과를 만듭니다.

## 5단계 — 검토하고 정리하기

공유 수신자·탐지 활용·발행 상태를 확인하고 시험 결과를 저장합니다. 실제 조직 간 발행·동기화는 이 활동의 완료 조건이 아닙니다.

**완료 기준:** Event 또는 정보 카드 1개, 유형을 구분한 관찰값 4개, 출처·기간·신뢰·공유 범위와 관계 설명이 있습니다.

**막힐 때:** 권한·Distribution·필수 필드·값 유형·현재 버전 문서를 확인합니다.

## 최신 보강과 실무 연결

현재 TLP 2.0의 CLEAR·AMBER+STRICT를 구분합니다. 제품의 Distribution과 TLP는 서로 다른 역할입니다. [인텔리전스 운영](threat-intelligence-operations.html)에서 IOC 수명·만료와 운영 적용을 학습합니다.

## 공개 참고자료

- [MISP — 문서와 교육자료](https://www.misp-project.org/documentation/)
- [MISP Book](https://www.circl.lu/doc/misp/)
- [FIRST — TLP](https://www.first.org/tlp/)
