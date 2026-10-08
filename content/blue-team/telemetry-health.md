---
title: "탐지 전에 확인할 수집 상태·지연·로그 공백"
description: "상시 네트워크 수집과 호스트 Hunt를 구분하고 Splunk의 도착 지연·시간 파싱·누락을 측정합니다."
category: "blue-team"
updated: "2026-10-08"
tags: ["Splunk", "수집 지연", "데이터 품질"]
order: "44"
level: "기초 · 실무 확장"
---

## 목표와 준비물

탐지 결과 0건은 공격이 없다는 뜻일 수도 있고 자료를 수집하지 못했다는 뜻일 수도 있습니다. 규칙을 늘리기 전에 로그 발생 → 전달 → 인덱싱 → 검색 → 경보의 각 구간을 검증합니다. 준비물은 기대 데이터 목록, 정상 시험 이벤트와 수집 경로를 볼 수 있는 권한입니다.

**네트워크는 상시 수집하고 호스트는 필요 시 Velociraptor Hunt로 수집하는 환경**을 기준으로 설명합니다. 이는 하나의 운영 방식이며 모든 Velociraptor 배포가 이와 같지는 않습니다. 호스트 실시간 경보가 필요하면 별도로 Client Monitoring·이벤트 전달·SIEM 연결을 설계해야 합니다.

## 1단계 — 기대 데이터 목록 만들기

| 항목 | 기록 예 |
| --- | --- |
| 원본·소유자 | 센서의 Zeek conn, Windows Security, 클라우드 감사 |
| 대상·필터 | 어떤 장비·이벤트·리소스가 포함/제외되는가 |
| 수집 방식 | 상시 스트림, 주기 작업, 필요 시 Hunt |
| 원본 보존·중앙 보존 | 원본 순환 기간과 중앙 검색 가능 기간 |
| 필드·시간 | 원래 시각·시간대·파서·장비 식별자 |
| 기대 도착·점검 | 허용 지연, 마지막 확인, 책임자 |

sourcetype 하나에 여러 JSON 자료를 넣었다면 sourcetype만으로 원본 종류를 구분할 수 없습니다. source, 원본의 장비·종류·artifact·flow 식별자를 함께 확인합니다. Collector의 `host`와 실제 대상 호스트가 다른 경우도 기록합니다.

## 2단계 — 정상 이벤트 한 개를 끝까지 추적하기

시험 장비에서 승인된 조회·로그인 등 정상 행동 한 번을 수행합니다. 발생 시각, 원본 레코드 식별자, 수집 작업·flow, Splunk 원문과 검색 결과를 비교합니다. 이벤트 감사가 꺼져 있으면 전달기를 고쳐도 원본이 생기지 않습니다.

원본은 있는데 수집 결과가 없으면 대상·권한·artifact·필터를, 결과는 있는데 Splunk에 없으면 전달·입력·인덱스·시간을 확인합니다. Hunt 성공 표시와 필요한 데이터 수집 성공은 별도로 검증합니다.

## 3단계 — 도착 시간 차이 측정하기

아래 `lab_logs`는 실제 시험 인덱스로 바꿉니다. 과거 자료가 있다면 Time Picker를 포함 기간으로 넓히고, 대규모 운영 인덱스에서는 제한된 source·대상으로 시작합니다.

```spl
index=lab_logs
| eval arrival_gap_s=_indextime-_time
| stats count min(arrival_gap_s) as min_gap_s
    median(arrival_gap_s) as median_gap_s
    perc95(arrival_gap_s) as p95_gap_s
    max(arrival_gap_s) as max_gap_s
    by source sourcetype
```

이 차이는 **파싱된 이벤트 시각과 인덱싱 시각의 차이**입니다. 전달기의 순수 전송 지연과 같지 않습니다. 과거 EVTX를 오늘 Hunt로 수집하면 큰 양수가 정상일 수 있고, 시간대·장비 시계·파싱 오류는 음수를 만들 수 있습니다. [Splunk 공식 지연 설명](https://help.splunk.com/en/splunk-enterprise/administer/troubleshoot/10.4/data-acquisition-problems/event-indexing-delay).

처음에는 평균보다 개별 원문 2~3개와 중앙값·상위 지연을 함께 봅니다. ‘대략 5분’ 같은 예상값은 실제 source별 측정으로 확인합니다. 이 예제 SPL은 환경별 원문 검증 후 사용하는 출발점입니다.

## 4단계 — 최근 유입과 과거 사건 시각 구분하기

새로 들어온 과거 자료를 찾을 때 이벤트 시간만 최근 15분으로 제한하면 누락될 수 있습니다. 아래는 **최근 1시간에 인덱싱된 자료**를 확인하는 예입니다. 이벤트 시간은 Time Picker에서 필요한 과거 범위를 포함시킵니다. 전체 유입을 빠짐없이 점검하려면 제한된 시험 인덱스에서 All Time을 사용합니다.

```spl
index=lab_logs _index_earliest=-1h _index_latest=now
| stats count max(_indextime) as last_indexed
    min(_time) as first_event max(_time) as last_event
    by source sourcetype
| convert ctime(last_indexed) ctime(first_event) ctime(last_event)
```

검색에 보이는 source만 집계하므로 완전히 끊긴 source는 행 자체가 없습니다. 1단계의 기대 목록과 결과를 대조해야 ‘0건’과 ‘누락’을 구분할 수 있습니다. 시간대 표시 설정도 확인합니다.

## 5단계 — 지연·누락·중복을 따로 검증하기

| 증상 | 우선 확인 | 흔한 오판 |
| --- | --- | --- |
| 원본 이벤트 없음 | 감사 정책·대상 행동·보존 | 수집기 장애라고 단정 |
| 오래된 이벤트가 새로 도착 | Hunt·백필·시간 파싱 | 모두 실시간 공격이라고 경보 |
| host가 모두 동일 | collector/대상 필드 매핑 | 모든 행동이 수집 서버에서 발생 |
| 건수가 두 배 | 중복 입력·재수집·레코드 식별자 | 공격 빈도 증가라고 단정 |
| source가 사라짐 | 기대 재고·가동·필터·전달 | 검색에 안 나오니 정상이라고 판단 |

고유 레코드 키는 데이터 종류별로 정합니다. Windows Record ID도 장비·채널·로그 초기화 맥락 없이 전역 고유하다고 보지 않습니다. 필드가 없는 이벤트를 정상으로 숨기기보다 품질 점검 대상으로 남깁니다.

## 6단계 — 운영 기준과 탐지 연결하기

상시 스트림과 Hunt/백필을 구분하고 경보의 검색 창·지연 허용·중복 억제를 실제 측정에 맞춥니다. 에이전트 연결·수집 작업 성공·SIEM 유입·경보 생성은 각각 별도 상태로 보여야 합니다. 규칙을 바꾼 뒤 정상·누락·중복 자료로 재확인합니다.

**완료 기준:** source별 기대 이벤트, 도착 특성, 시간 파싱, 데이터 누락 시 알림과 담당자를 정합니다. 이 상태를 확보한 뒤 [탐지 설계](blue-detection.html)와 [GOAD-Light 수집 구성](goad-light-telemetry.html)을 연결합니다.

## 참고자료

- [Splunk — Event indexing delay](https://help.splunk.com/en/splunk-enterprise/administer/troubleshoot/10.4/data-acquisition-problems/event-indexing-delay)
- [Splunk — 시간·인덱스 시간 검색](https://help.splunk.com/en/splunk-enterprise/search/spl-search-reference/10.4/time-format-variables-and-modifiers/time-modifiers)
- [Splunk — 기본 필드](https://help.splunk.com/en?resourceId=Splunk_Knowledge_Usedefaultfields&version=splunk-9_3)
- [Velociraptor — Client Monitoring](https://docs.velociraptor.app/docs/clients/monitoring/)
- [Velociraptor Hunt와 수집 결과](velociraptor.html)

## 관측 지도와 운영 담당 연결하기

source별 기대 목록은 [자산·신원·로그 관측 지도](defensible-visibility.html)의 행위 요구사항과 연결합니다. 정상 시험을 통과한 필수 source 수와 미수집 source를 [SOC 운영 지표](soc-operating-model.html)에 따로 기록합니다. 검색에 나타난 source만 분모로 쓰면 완전히 끊긴 입력을 놓칩니다.
