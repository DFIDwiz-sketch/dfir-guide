---
title: "실습 1.3: Elastic Stack으로 SIEM 학습"
description: "가상 기록 16건을 입력·검색하고 기대 ID·건수·수집 지연과 사건 타임라인을 검증합니다."
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

## 실습 목표와 데이터

이 실습은 데이터를 입력하고 필드를 확인한 뒤, 검색 결과를 근거·타임라인·인계로 바꾸는 활동입니다. [공통 사례 NDJSON 16건](downloads/blue-team-day1-case.ndjson)과 [학습 워크북](downloads/blue-team-day1-workbook.md)을 사용합니다. 교재의 SIEM with Elastic Stack 목표에 맞춘 별도 실습이며 원본 Lab Workbook의 재현은 아닙니다.

데이터는 `dataset: bt1-case-v2`이며 날짜는 2026-10-08 UTC입니다. `record_type`은 이벤트·경보·맥락·조치·사건 메모·수집 상태를 구별합니다. 실제 제품의 ECS 표준 자료가 아니라 기능과 판단을 연습하는 교육용 스키마입니다. 제품 없이 Python으로 기대 결과를 확인할 수도 있습니다.

## 1단계 · 입력과 필드 확인

승인된 Elastic 교육 환경에서 공식 파일 업로드 기능을 사용합니다. 현재 문서는 Integrations에서 Upload a file을 찾아 Data Visualizer를 여는 흐름을 설명하며, 버전·배포에 따라 다른 업로드 화면도 제공합니다. 분석 결과에서 `@timestamp`가 날짜, ID·종류·계정·세션이 검색 가능한 값으로 해석되는지 확인한 뒤 교육용 인덱스 `bt1-case-v2`에 가져옵니다.

업로드에는 데이터 뷰·Discover·인덱스·파이프라인 관련 권한이 필요할 수 있습니다. 권한 오류는 해당 환경 운영자에게 요청하고 무조건 관리자 권한으로 바꾸지 않습니다. 파일 업로드는 초기 자료 탐색용이며 반복 운영 수집 파이프라인을 대신하는 방식이 아닙니다.

## 2단계 · Discover와 날짜 범위 맞추기

해당 인덱스의 데이터 뷰를 선택하고 시간 필드를 `@timestamp`로 지정합니다. 검색 범위는 **2026-10-08 00:00:00~2026-10-09 00:00:00 UTC**로 맞춥니다. 브라우저의 현지 시간 표시를 쓰면 같은 UTC 범위에 해당하는 시각으로 설정합니다. 기본 최근 15분은 학습 데이터의 고정 날짜와 맞지 않을 수 있습니다.

표에는 `id`, `record_type`, `event_type`, `account`, `session_id`, `source_ip`, `related_id`, `received_at`을 추가합니다. 없는 필드는 해당 레코드에 적용되지 않거나 기록되지 않았을 수 있습니다. 원문 한 건을 펼쳐 필드 이름·값·시각을 대조합니다.

## 3단계 · 필터와 기대 ID 대조

각 검색은 별도로 실행합니다. 값·필드·날짜 범위가 정확하고 원본을 한 번만 입력했을 때 다음 결과를 기대합니다.

| KQL 필터 | 기대 결과 | 학습 질문 |
| --- | --- | --- |
| `dataset: "bt1-case-v2"` | D01~D16, 16건 | 전체 입력과 중복 여부 |
| `dataset: "bt1-case-v2" AND record_type: "alert"` | D06·D08, 2건 | 경보와 원문 관계 |
| `dataset: "bt1-case-v2" AND event_type: "authentication"` | D01·D03·D04·D05, 4건 | 실패·성공·정상 세션 |
| `dataset: "bt1-case-v2" AND session_id: "S002"` | D05·D07·D11·D13·D14, 5건 | 관련 자료의 종류 차이 |
| `dataset: "bt1-case-v2" AND event_type: "mail_rule_created"` | D07, 1건 | 실제 전달 자료와의 차이 |
| `dataset: "bt1-case-v2" AND record_type: "collection_health"` | D16, 1건 | 미관측과 안전함의 차이 |

세션 검색에는 경보 D06·D08이 직접 들어 있지 않습니다. 이 경보들은 `related_id`로 원문을 참조합니다. 세션 필드 검색만으로 모든 관련 자료를 찾았다고 결론 내리지 않는 이유입니다.

## 4단계 · 타임라인과 수집 지연

발생 시각으로 오름차순 정렬합니다. D05의 로그인 뒤 D07의 설정 변경이 같은 세션에서 이어지는지 확인합니다. D07의 `received_at`과 발생 시각을 비교하면 8분 지연이 있습니다. 사건 조사에서는 발생 순서와 분석 시점에 확보한 자료의 차이를 함께 남깁니다.

D09·D10은 내부 PC의 정상 활동으로 분리합니다. 같은 계정이나 가까운 시각만으로 S002와 연결하지 않습니다. D13·D14는 요청과 서비스 감사이며, D15·D16에 남은 질문과 공백이 있습니다. 마지막 인계는 확인·미확인·다음 작업을 포함해야 합니다.

## 5단계 · 제품 없이 결과 검증

Python 3에서 내려받은 파일과 같은 폴더에서 실행합니다. 이 코드는 로컬 파일만 읽습니다.

~~~python
import json
from collections import Counter
from datetime import datetime

with open("blue-team-day1-case.ndjson", encoding="utf-8") as f:
    records = [json.loads(line) for line in f if line.strip()]
print("total", len(records))
print("types", dict(Counter(r["record_type"] for r in records)))
for key, value in [("record_type", "alert"),
                   ("event_type", "authentication"),
                   ("session_id", "S002")]:
    print(key, [r["id"] for r in records if r.get(key) == value])
r = next(r for r in records if r["id"] == "D07")
parse = lambda s: datetime.fromisoformat(s.replace("Z", "+00:00"))
print("D07 lag seconds",
      (parse(r["received_at"]) - parse(r["@timestamp"])).total_seconds())
~~~

종류별 수는 event 7, alert 2, context 3, action 1, action_result 1, case_note 1, collection_health 1입니다. D07 지연은 480초입니다. 결과가 다르면 입력 파일·중복·필드·필터를 확인합니다. 분할 학습에서 매핑·검색·시간 문제를 자세히 다룹니다.

## 완료 결과물

입력 확인 16건, 필터별 ID, D07 지연, 타임라인, 사건 인계 문장을 워크북에 남깁니다. 단순히 화면에 점이 보이는 것보다 **왜 해당 ID를 연결하고 무엇은 연결하지 않았는지** 설명할 수 있어야 합니다.

## 공개 참고자료

- [Elastic — 파일 업로드·권한](https://www.elastic.co/docs/manage-data/ingest/upload-data-files)
- [Elastic — KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql)
