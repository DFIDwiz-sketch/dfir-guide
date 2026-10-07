---
title: "Python으로 JSONL 로그 요약하기"
description: "잘못된 레코드와 누락 필드를 기록하며 이벤트 종류를 집계하는 기초 분석 예제."
category: "programming"
updated: "2026-10-07"
tags: ["Python", "JSONL", "로그 파싱"]
order: "24"
level: "입문"
---

## 입력 형식 정하기

JSONL은 한 줄마다 JSON 객체를 기록하는 형식입니다. 아래 예시는 가상의 분석 사본 `sample.jsonl`을 읽고 `event_type`별 개수를 출력합니다. 다른 필드 구조에는 해당 필드명을 맞춰 수정합니다.

```json
{"event_type":"alert","host":"LAB-01"}
{"event_type":"flow","host":"LAB-01"}
{"event_type":"alert","host":"LAB-02"}
```

## 파싱 오류를 숨기지 않기

```python
from collections import Counter
import json
from pathlib import Path

counts = Counter()
invalid = 0
missing = 0

for line in Path("sample.jsonl").read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    try:
        event = json.loads(line)
    except json.JSONDecodeError:
        invalid += 1
        continue
    if not isinstance(event, dict):
        invalid += 1
        continue
    kind = event.get("event_type")
    if not isinstance(kind, str) or not kind.strip():
        missing += 1
        continue
    counts[kind] += 1

for kind, count in counts.most_common():
    print(kind, count)
print("invalid_records", invalid)
print("missing_event_type", missing)
```

정상 예시 입력의 결과는 `alert 2`, `flow 1`, 오류·누락 각각 0입니다. 잘못된 JSON이나 문자열이 아닌 이벤트 종류는 별도 집계합니다.

## 분석용 도구로 확장하기

입력 경로·필드명을 인자로 받고 처리한 전체 레코드 수를 출력하도록 개선합니다. 큰 파일은 전체를 메모리에 읽는 대신 줄 단위로 처리합니다. 인코딩 오류나 파일 읽기 실패도 운영용 코드에서 별도 처리합니다.

이 집계는 이벤트 종류의 개수입니다. 파일의 무결성이나 악성 여부를 확인하는 프로그램은 아닙니다. 실제 로그의 원문과 수집 맥락을 함께 조사합니다.

## 참고자료

- [Python — json](https://docs.python.org/3/library/json.html)
- [Python — collections.Counter](https://docs.python.org/3/library/collections.html#collections.Counter)
