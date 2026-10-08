---
title: "실습 2.1: DNS 탐색"
description: "가상 DNS 6개에서 질의자·리졸버·이름·타입·응답과 후속 연결을 정리합니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["2일차", "자체 실습", "블루팀 필수지식"]
order: "305"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "5"
chapter_title: "EXERCISE 2.1: Exploring DNS"
textbook_page: "86"
lesson_type: "자체 실습"
---

## 실습 목표와 자료

[가상 사건 기록 20개](downloads/network-day2-events.jsonl) 중 DNS 6개를 사용합니다. 실습은 자체 기록을 읽는 활동이며 원본 PCAP이나 원본 교재 Lab Workbook의 수행 결과를 제공하지 않습니다.

준비물은 편집기와 메모, 선택적으로 Python 또는 시험 Splunk입니다. .example 이름을 실제 인터넷에서 조회해 가상 답을 재현하려 하지 않습니다.

## 1단계 — DNS 행 찾기

source_type이 dns인 N001·N006·N011·N012·N013·N015를 찾습니다. event_ts, src_ip, resolver_ip, query, qtype, rcode와 answers를 표로 옮깁니다. 이 스키마는 Zeek 원문이 아니라 학습용입니다.

## 2단계 — 요청한 자산과 리졸버 구분하기

N006의 클라이언트는 192.0.2.10, 리졸버는 192.0.2.53입니다. 응답은 198.51.100.40입니다. 리졸버 주소를 웹 목적지로 옮겨 적지 않습니다.

N001과 N015는 .11의 질의이고 나머지는 .10의 질의입니다. 주소가 같아도 실제 과거 자산 식별에는 유효 기간과 자산 자료가 필요합니다.

## 3단계 — 후속 웹 연결 비교하기

N001 → N002, N006 → N007의 답·목적지·이름·시각을 비교합니다. DNS uid와 웹 uid가 다름을 확인합니다. 대응 가능한 후보로 기록하며 실행이나 사용자 의도를 확정하지 않습니다.

## 4단계 — TXT와 긴 이름 읽기

N011–N013은 TXT 3개이고 N015는 긴 A 질의입니다. TXT, 긴 이름과 30초 간격만으로 악성·유출을 판단하지 않습니다. 정상 프로그램, 추가 기간, 호스트 프로세스와 승인 정책을 요청합니다.

## 5단계 — 선택: Python 검증

~~~python
import json
from collections import Counter
from pathlib import Path

rows = [json.loads(s) for s in
        Path("network-day2-events.jsonl").read_text(encoding="utf-8").splitlines()]
dns = [r for r in rows if r["source_type"] == "dns"]
print(len(dns), dict(Counter(r["qtype"] for r in dns)))
print([r["event_id"] for r in dns if r["src_ip"] == "192.0.2.10"])
~~~

기대 출력은 DNS 6개, A 3개·TXT 3개, .10의 ID N006·N011·N012·N013입니다. 파일 경로·JSON 형식·필드와 실제 값을 확인합니다.

**완료 기준:** 질의 표 6행, 이름·주소 대응 후보 2개, 정상 설명과 추가 수집 목록이 있습니다.

## 최신 보강과 실무 연결

실제 DoH·DoT·DoQ나 캐시가 있으면 dns.log에 같은 내용이 없을 수 있습니다. 실제 검색 절차는 [DNS 조사](dns-investigation.html), 범위 확장은 [통합 실습](network-capstone.html)으로 연결합니다.

## 공개 참고자료

- [RFC 1035 — DNS](https://www.rfc-editor.org/rfc/rfc1035)
- [Zeek — 로그 안내](https://docs.zeek.org/en/current/reference/logs/index.html)
