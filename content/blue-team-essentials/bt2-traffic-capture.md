---
title: "트래픽 수집과 분석"
description: "흐름 로그·프로토콜 메타데이터·PCAP, Zeek·Wireshark의 역할과 수집 한계를 이해합니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["2일차", "개념", "블루팀 필수지식"]
order: "302"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "2"
chapter_title: "Traffic Capture and Analysis"
textbook_page: "18"
lesson_type: "개념"
---

## 세 가지 자료 형식

| 형식 | 일반적으로 남는 내용 | 좋은 출발 질문 |
| --- | --- | --- |
| Flow · 흐름 | 주소·포트·전송 방식·기간·크기 등 | 누가 어디로 얼마나 통신했는가 |
| 서비스·프로토콜 로그 | 관찰한 DNS·HTTP 등 의미 있는 필드 | 무엇을 질의·요청·응답했는가 |
| PCAP·PCAPNG | 실제 수집한 패킷과 시각·인터페이스 등 | 원문·연결·재전송·평문 내용은 무엇인가 |

NetFlow/IPFIX, 표본을 포함할 수 있는 sFlow, 센서가 생성한 흐름 요약은 수집 방식이 같지 않습니다. 표본·집계·방향·내보내기 설정을 확인합니다. 작은 연결이 자료에서 누락될 수 있습니다.

## 메타데이터가 필요한 이유

PCAP은 크고 전체 패킷을 읽는 데 시간이 듭니다. Zeek 같은 분석기는 conn·dns·http 등의 구조화 자료로 질문을 빠르게 좁힙니다. 원본으로 되돌아갈 시간·주소·ID·센서 정보를 유지해야 합니다.

Suricata EVE에는 경보와 프로토콜·흐름 기록이 함께 있을 수 있습니다. 경보만 수집한 환경과 전체 관련 출력을 수집한 환경을 구분합니다. Arkime의 세션 검색 결과와 패킷 보존도 별도 조건입니다.

## Wireshark에서 읽는 순서

먼저 파일의 시작·종료와 패킷 수, 수집 위치와 양방향 여부를 확인합니다. 한 정상 통신을 골라 주소·포트·프로토콜을 읽고 요청과 응답을 연결합니다. 필요한 패킷만 표시 필터로 좁힙니다.

~~~text
dns
http.request
ip.addr == 192.0.2.10
~~~

각 줄은 독립된 표시 필터 예입니다. 실제 자료의 주소로 교체합니다. 캡처 필터는 저장할 패킷을 고르는 별도 문법입니다.

## PCAP의 한계

PCAP이 있어도 암호화 본문, 수집 밖 통신, 잘린 패킷과 만료된 구간은 확인하지 못할 수 있습니다. UDP/443을 보았다고 HTTP/3 본문을 읽은 것은 아닙니다.

내보낸 파일이 raw payload라면 PCAP으로 읽을 수 없습니다. 확장자를 바꾸는 대신 PCAP 내보내기를 사용하고 capinfos로 형식·패킷·기간을 확인합니다.

## 작은 활동 — 같은 질문에 자료 고르기

“웹 파일을 받았는가”, “누가 실행했는가”, “얼마나 외부로 보냈는가” 각각에 필요한 자료와 확인하지 못하는 결과를 적습니다.

**완료 기준:** 자료의 크기만 비교하지 않고 질문·필드·원본·가시성·보존을 연결합니다.

## 최신 보강과 실무 연결

수집 설정·해시·도구 버전을 남기는 실무 단계는 [수집과 증거](network-capture-evidence.html), 로그 필드는 [Zeek 안내](zeek-logs.html)로 연결합니다.

## 공개 참고자료

- [Zeek — 로그 안내](https://docs.zeek.org/en/current/reference/logs/index.html)
- [Wireshark — 사용자 안내](https://www.wireshark.org/docs/wsug_html/)
- [Suricata — EVE 형식](https://docs.suricata.io/en/latest/output/eve/eve-json-format.html)
