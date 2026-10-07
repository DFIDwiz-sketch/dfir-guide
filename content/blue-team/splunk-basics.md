---
title: "Splunk 검색의 시작점"
description: "인덱스·sourcetype·필드를 확인한 뒤 조건을 더하는 기초 SPL 흐름."
category: "blue-team"
updated: "2026-10-07"
tags: ["Splunk", "SPL", "데이터 확인"]
order: "14"
level: "입문"
---

## 데이터가 어디에 있는지 확인하기

Time Picker에서 조사 범위를 정하고 사용 권한이 있는 데이터부터 확인합니다. 아래 검색은 예시입니다. `index=*`는 접근 가능한 일반 인덱스를 검색하며 시스템 내부 인덱스까지 전부 포함하는 표현은 아닙니다. 데이터가 크면 구체적인 인덱스와 짧은 시간 구간으로 제한합니다.

```spl
index=*
| stats count by index sourcetype
| sort -count
```

결과의 `sourcetype`은 수집·파싱 분류입니다. 모든 JSON 기록이 같은 값이면 실제 이벤트 종류를 구분하는 필드를 추가로 조사합니다.

## 원문과 필드 확인

아래 `lab_logs`는 가상 이름이며 실제 인덱스로 바꿉니다.

```spl
index=lab_logs
| head 20
| table _time host source sourcetype _raw
```

```spl
index=lab_logs
| head 1000
| fieldsummary
```

표본의 필드 이름과 이벤트의 원문을 확인한 뒤 이벤트 ID·IP·계정 조건을 넣습니다. `EventCode`, `EventID` 같은 이름은 환경마다 다를 수 있습니다.

## 조건을 한 번에 많이 넣지 않기

인덱스, 장비, 이벤트 종류, 계정의 순서로 조건을 더하며 결과가 사라지는 지점을 확인합니다. `stats ... by`에서 필요한 필드가 없는 이벤트는 기대한 그룹에 나오지 않을 수 있어 원문과 필드의 존재 여부를 먼저 확인합니다.

## 검색 결과를 사건으로 해석하기

집계는 규모를 보는 데 유용하지만 원래 이벤트의 맥락이 줄어듭니다. 경보의 근거 이벤트, 시간·장비와 원문을 함께 보존하고 프로세스·인증·네트워크 자료를 연결합니다.

## 참고자료

- [Splunk — stats](https://help.splunk.com/en/splunk-cloud-platform/spl-search-reference/9.3.2408/search-commands/stats)
- [Splunk — fieldsummary](https://help.splunk.com/en/splunk-cloud-platform/search/search-reference/10.3.2512/search-commands/fieldsummary)
