---
title: "실습 1.3: Elastic Stack으로 SIEM 학습"
description: "가상 기록 6개를 읽고 Elastic의 데이터 뷰·시간·필드·KQL 검색을 익힙니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["1일차", "자체 실습", "블루팀 필수지식"]
order: "214"
level: "입문 · 교재 중심"
course_day: "1"
course_order: "14"
chapter_title: "EXERCISE 1.3: SIEM with the Elastic Stack"
textbook_page: "171"
lesson_type: "자체 실습"
---

## 실습 목표와 자료

[가상 NDJSON 6개](downloads/blue-team-essentials-events.ndjson)를 사용합니다. 자료는 자체 정규화 예제이며 Elastic Security의 제품 이벤트 스키마나 원본 교재 실습 자료가 아닙니다.

Elasticsearch는 자료의 저장·검색, Kibana는 검색·분석 화면, 수집 도구·연동은 자료 유입을 지원합니다. 모든 기능을 설치하지 않아도 파일 읽기와 검색 조건 설계부터 할 수 있습니다.

## 1단계 — 파일에서 필드 확인하기

한 줄이 한 JSON 문서입니다. record_id, @timestamp, dataset, record_type과 각 행의 필드를 확인합니다. 네트워크·로그인 이벤트 4개, 경보 1개, 사건 메모 1개가 있습니다.

B003의 새 장비 로그인은 이벤트, B004는 그 조건으로 만든 경보입니다. 같은 행동을 두 번 발생한 것으로 계산하지 않습니다.

## 2단계 — 선택: 시험 Elastic에 수집하기

이미 사용할 수 있는 시험 환경에서만 수행합니다. 현재 공식 문서의 파일 업로드 기능이 있으면 NDJSON 파일을 선택합니다. 데이터·인덱스 생성 권한과 지원 형식을 확인합니다. 이 활동은 제품 설치나 실제 운영 인덱스 변경을 요구하지 않습니다.

시험 인덱스를 bt1-learning으로 정하고 @timestamp를 날짜로 해석했는지 확인합니다. dataset·record_id·record_type·protocol 같은 필드의 text/keyword mapping을 살펴봅니다. 자료를 한 번만 수집했는지 확인합니다.

## 3단계 — 데이터 뷰와 시간을 고르기

Discover에서 해당 인덱스의 Data view를 선택합니다. 시간 필드는 @timestamp이며 자료의 UTC 기간은 2026-10-08 08:00–08:05입니다. 화면의 시간대 표시를 확인하고 이 기간을 포함하는 절대 범위로 설정합니다.

처음에는 조건 없이 6개 문서를 확인하고 record_id와 원문을 읽습니다. index·Data view·시간·권한을 확인하기 전 경보 조건부터 넣지 않습니다.

## 4단계 — KQL로 하나씩 좁히기

아래는 Kibana Query Language 예이며 Kusto Query Language나 Splunk SPL과 다릅니다. 필드가 keyword 등 정확한 값 검색에 맞는 mapping인지 확인합니다.

~~~text
dataset: "bt1-essentials-v1"
~~~

기대 결과는 6개입니다. 다음은 이벤트만 고르는 조건입니다.

~~~text
dataset: "bt1-essentials-v1" AND record_type: "event"
~~~

기대 결과는 B001·B002·B003·B005의 4개입니다.

~~~text
dataset: "bt1-essentials-v1" AND record_type: "event" AND protocol: "http"
~~~

기대 결과는 B002·B005의 2개입니다. status 200과 302의 의미를 비교합니다. KQL은 필터링 언어이며 집계·정렬은 화면 기능 또는 해당 목적의 다른 쿼리 언어를 사용합니다.

## 5단계 — 도구 없이 같은 조건 확인하기

~~~python
import json
from pathlib import Path

rows = [json.loads(line) for line in
        Path("blue-team-essentials-events.ndjson").read_text(encoding="utf-8").splitlines()]
events = [r for r in rows if r["record_type"] == "event"]
http = [r["record_id"] for r in events if r.get("protocol") == "http"]
print(len(rows), len(events), http)
~~~

확인할 출력은 6 4 ['B002', 'B005']입니다. 이 출력은 파일 조건 검증이며 Elastic 서버에서 검색을 실행한 결과가 아닙니다.

## 6단계 — 결과를 해석하고 막힌 곳 찾기

0개면 Data view → 시간대·범위 → 인덱스 권한 → 수집 완료 → 필드 mapping → KQL 조건 순서로 확인합니다. 12개면 같은 파일 중복 유입인지 record_id로 비교합니다.

**완료 기준:** 원문 6개, 이벤트 4개, HTTP 2개와 이벤트·경보·사건 메모의 차이를 설명합니다. 성공 로그인이나 HTTP 200을 침해 성공으로 작성하지 않습니다.

## 최신 보강과 실무 연결

2022년 Kibana 화면과 현재 UI·검색 언어는 다를 수 있습니다. KQL·Lucene·ES|QL의 역할을 구분합니다. 현재 키트의 Splunk 적용은 [Splunk 기본 검색](splunk-basics.html)과 연결합니다.

## 공개 참고자료

- [Elastic — 파일 업로드](https://www.elastic.co/docs/manage-data/ingest/upload-data-files)
- [Elastic — KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql)
