---
title: "실습 2.2: HTTP와 HTTPS 분석"
description: "자체 HTTP 대화와 가상 프록시·연결 기록을 비교해 요청·응답·암호화 한계를 정리합니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["2일차", "자체 실습", "블루팀 필수지식"]
order: "308"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "8"
chapter_title: "EXERCISE 2.2: HTTP and HTTPS Analysis"
textbook_page: "137"
lesson_type: "자체 실습"
---

## 실습 목표와 자료

[가상 HTTP 대화](downloads/blue-team-essentials-http.txt)와 [가상 사건 기록 20개](downloads/network-day2-events.jsonl)를 사용합니다. 첫 파일은 텍스트 대화 예이며 PCAP이 아닙니다. 네트워크에 전송한 자료나 원본 교재 실습의 패킷이 아닙니다.

## 1단계 — 요청 두 개의 구성 읽기

H001의 메서드는 GET, 경로는 /docs/start, query는 lang=ko, Host는 training.example입니다. User-Agent와 Cookie를 읽고 두 값이 클라이언트 표시·세션 자료일 수 있음을 적습니다.

H002는 독립적으로 기록한 POST /docs/next 요청입니다. Content-Type과 mode=study 본문을 확인합니다. GET과 POST의 용도가 어떻게 다른지 설명합니다.

## 2단계 — 응답 의미 비교하기

| 요청 | 응답 | 확인한 것 |
| --- | --- | --- |
| H001 | 302·Location /docs/next | 상대 경로로 이동을 지시 |
| H002 | 200·text/plain·hello | 상태와 작은 텍스트 본문 |

상대 Location은 원래 사이트를 기준으로 해석합니다. H002가 같은 사용자 탭에서 자동 생성됐는지는 이 텍스트만으로 증명되지 않습니다. 302 뒤에는 항상 POST가 생긴다고 외우지 않습니다.

## 3단계 — 길이와 본문 확인하기

mode=study는 ASCII 10바이트, hello는 5바이트입니다. 자료의 설명 줄은 패킷이나 본문이 아닙니다. Content-Length와 실제 콘텐츠를 구분하고 일반 트래픽의 압축·전송 방식·불완전 수집에서는 계산 조건이 달라질 수 있음을 적습니다.

## 4단계 — HTTPS의 자료 출처 비교하기

JSONL의 N007은 HTTP 302, N008은 프록시의 HTTPS 요청 기록입니다. 프록시에서 URI가 보인다는 사실과 수동 Sensor에서 TLS 본문을 읽었다는 사실은 다릅니다.

N014는 UDP/443 흐름이며 프로토콜 미식별, N020은 관련 PCAP 만료 기록입니다. HTTP/3·C2·유출 내용을 확인했다고 작성하지 않습니다.

## 5단계 — 후속 행동 요청하기

파일 수신·실행, 사용자 승인·로그인, 백엔드 처리 결과를 확인하려면 어떤 호스트·서비스 자료가 필요한지 씁니다. 단일 요청·응답을 침해 성공으로 바꾸지 않습니다.

**완료 기준:** 요청 2개 구성표, 상태·본문 비교, 리다이렉트 관계의 한계, HTTPS 출처와 미확인 결과를 설명합니다.

**막힐 때:** TXT와 PCAP의 형식 → 원문 → 요청/응답 구분 → 필드·센서 출처 순서로 확인합니다.

## 최신 보강과 실무 연결

실제 패킷이 있으면 [PCAP 보존](network-capture-evidence.html) 후 [웹 통신 조사](http-investigation.html)의 절차를 수행합니다. 이 실습에는 TLS 키·복호화 결과가 포함되지 않습니다.

## 공개 참고자료

- [RFC 9110 — HTTP 의미](https://www.rfc-editor.org/rfc/rfc9110)
- [Wireshark — 사용자 안내](https://www.wireshark.org/docs/wsug_html/)
- [Zeek — 로그 안내](https://docs.zeek.org/en/current/reference/logs/index.html)
