---
title: "Splunk 검색의 시작점"
description: "인덱스 찾기부터 JSON 필드 확인, 조건 추가, 집계와 0건 검색 문제 해결까지 따라 하는 SPL 6단계."
category: "blue-team"
updated: "2026-10-07"
tags: ["Splunk", "SPL", "데이터 확인"]
order: "14"
level: "입문"
---

## 목표와 실습 조건

검색 결과가 사라지는 이유를 추적하며 **데이터 위치 → 원문 → 필드 → 조건 → 집계** 순서로 검색을 만듭니다. 검색 권한이 있는 Splunk와 실제 인덱스 이름이 필요합니다. 예시의 `lab_logs`는 환경에 맞춰 바꿉니다. 설치나 라이선스 변경은 이 실습의 범위에 포함하지 않습니다.

처음이라면 [가상 로그 실습](first-investigation.html)의 JSONL 자료를 별도 학습 인덱스에 가져와 사용할 수 있습니다. 해당 자료의 사용자 정의 필드와 실제 수집 필드를 구분합니다.

## 1단계 — 시간을 고르고 데이터 위치 확인하기

Time Picker에서 조사 시간을 먼저 선택합니다. 가상 자료는 **2026-10-07 00:00~00:15 UTC**입니다. 화면이 다른 시간대를 쓰면 그에 맞춰 절대 시간 범위를 선택합니다. 실제 운영 데이터는 우선 짧은 범위에서 검색합니다.

```spl
| tstats count where index=* by index sourcetype
| sort - count
```

`index=*`는 검색 권한이 있는 일반 인덱스의 시작점이며 모든 내부 인덱스와 접근 불가 자료를 보여주지는 않습니다. 이 검색은 색인된 메타데이터를 활용합니다. 이벤트 본문 필드를 분석하려면 다음 단계의 일반 검색으로 이동합니다.

**확인할 결과:** 인덱스 이름, sourcetype, 건수입니다. 결과가 없다면 권한과 시간 범위부터 확인합니다. 인덱스 이름을 확정한 후에는 `index=*`를 계속 쓰지 않습니다.

## 2단계 — 집계하기 전에 원문 20개 읽기

```spl
index=lab_logs
| head 20
| table _time host source sourcetype _raw
```

`host`가 원래 이벤트 발생 장비인지 수집 서버인지 확인합니다. Hunt 결과에서는 실제 장비 이름이 `ComputerName`이나 다른 필드에 있을 수 있습니다. `sourcetype`이 JSON 한 종류라면 원문의 이벤트 종류·Artifact 이름·채널 등으로 자료를 구분합니다.

**확인할 결과:** 한 이벤트가 한 줄로 들어왔는지, 시간 파싱이 맞는지, 원문이 잘리지 않았는지입니다. 표본 20개의 분포가 전체 데이터 분포와 같다고 가정하지 않습니다.

## 3단계 — 실제 필드 이름 찾기

```spl
index=lab_logs
| head 1000
| spath
| fieldsummary
```

`spath`는 JSON 구조를 읽어 필드를 추출하는 데 사용합니다. 이미 자동 추출됐다면 생략할 수 있습니다. 잘못된 JSON, 긴 원문의 추출 범위 제한, 중첩 경로 차이가 있으면 원하는 필드가 나오지 않을 수 있습니다.

Windows 이벤트 번호가 실제로 `EventCode`, `EventID`, `System.EventID` 중 어디에 있는지 원문과 비교합니다. 아래는 그 세 형태를 시험적으로 맞추는 예시이며 모든 파서에 통하는 보편 변환은 아닙니다.

```spl
index=lab_logs
| spath
| eval event_id=coalesce(EventCode, EventID, 'System.EventID')
| table _time event_id ComputerName host _raw
| head 30
```

## 4단계 — 조건 하나씩 추가하기

먼저 이벤트 번호를 제한하고 결과가 유지되는지 봅니다. 다음에 장비 또는 계정을 추가합니다.

```spl
index=lab_logs
| spath
| eval event_id=coalesce(EventCode, EventID, 'System.EventID')
| where event_id=4624 OR event_id=4625
| table _time ComputerName event_id TargetUserName LogonType AuthenticationPackageName IpAddress
| sort 0 _time
```

가상 자료의 필드명에 맞춘 예시입니다. 실제 환경에서는 존재를 확인한 필드로 바꿉니다. `TargetUserName`은 인증 대상 계정이고 `SubjectUserName`은 이벤트의 행위 주체를 가리킬 수 있으므로 무조건 하나의 사용자 열로 합치지 않습니다.

**확인할 결과:** 성공과 실패의 시점·대상·계정입니다. 빈 IP나 사용자 값은 즉시 악성 징후로 보지 말고 해당 이벤트 형식과 수집 변환부터 확인합니다.

## 5단계 — 누락 필드를 확인한 뒤 집계하기

```spl
index=lab_logs
| spath
| eval event_id=coalesce(EventCode, EventID, 'System.EventID')
| where event_id=4624 OR event_id=4625
| eval account=coalesce(TargetUserName,"(필드 없음)")
| stats count by event_id account
| sort - count
```

`stats ... by`에 필드가 없는 이벤트는 기대한 그룹에 나타나지 않을 수 있습니다. 여기서는 누락 계정을 명시적으로 표시해 숨겨진 누락을 줄입니다. 서로 다른 의미의 계정 필드를 섞지 않는 것이 중요합니다. 집계와 함께 원래 이벤트를 찾아갈 수 있는 검색도 저장합니다.

## 6단계 — 유입 지연을 구분해서 보기

```spl
index=lab_logs
| eval observed_lag_sec=_indextime-_time
| table _time _indextime observed_lag_sec source sourcetype
| head 30
```

차이가 크다고 곧바로 전송 장애로 판단하지 않습니다. 과거 로그의 재수집, 잘못된 시간 파싱, 장비 시계 오차도 원인이 됩니다. 음수도 숨기지 않고 조사합니다. 유입 지연은 자료별로 측정하며 고정된 ‘5분 지연’을 전체 환경에 적용하지 않습니다.

## 결과가 0개일 때

| 멈춘 위치 | 먼저 확인할 것 |
| --- | --- |
| 인덱스만 검색해도 0개 | 권한, 실제 인덱스, Time Picker, 유입 상태 |
| 장비를 넣자 0개 | 원래 장비명과 수집 서버의 host 혼동 |
| 이벤트 번호를 넣자 0개 | 번호 필드명, 중첩 구조, 문자열 형태 |
| stats 이후 사라짐 | 그룹 필드의 누락 여부 |
| Hunt 직후 검색해도 없음 | 수집 완료 → 내보내기 → 전달 → 색인을 순서대로 확인 |

## 완료 기준과 다음 단계

인덱스·sourcetype·시간 범위·필드 매핑을 적고, 조건 추가 전후의 건수와 근거 이벤트 3개를 남깁니다. 그 뒤 [Windows 이벤트](windows-events.html) 또는 [NTLM 조사](ntlm-triage.html)로 이동합니다.

추가 공식 문서: [tstats](https://help.splunk.com/en/splunk-enterprise/spl-search-reference/10.0/search-commands/tstats), [spath](https://help.splunk.com/en/splunk-enterprise/spl-search-reference/10.0/search-commands/spath).

## 참고자료

- [Splunk — stats](https://help.splunk.com/en/splunk-cloud-platform/spl-search-reference/9.3.2408/search-commands/stats)
- [Splunk — fieldsummary](https://help.splunk.com/en/splunk-cloud-platform/search/search-reference/10.3.2512/search-commands/fieldsummary)

## 검색 결과를 운영 기록으로 연결하기

후보를 찾았다면 [경보 분류](alert-triage.html)에서 원문·시간·장비·계정을 재확인하고 [사건 관리](case-management.html)에 기간·검색식·근거 ID와 제한을 남깁니다. 검색을 반복 경보로 만들려면 [탐지 명세](siem-use-case-lifecycle.html)의 필드·지연·정상 사례를 먼저 검증합니다.
