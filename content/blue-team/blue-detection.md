---
title: "블루팀 탐지와 위협 헌팅"
description: "가상 예약 작업 로그로 필드 품질·후보 검색·정상 사례·미탐·지연·중복을 확인하는 탐지 설계 7단계."
category: "blue-team"
updated: "2026-10-08"
tags: ["블루팀", "탐지", "위협 헌팅"]
order: "13"
level: "입문"
---

## 목표와 준비물

탐지는 정의한 조건을 반복 확인하는 작업이고, 위협 헌팅은 가설을 데이터로 검증하는 조사입니다. 이 실습에서는 [가상 로그 12개](first-investigation.html)에서 **PowerShell을 포함한 예약 작업 생성·변경 후보**를 찾고 그 결과를 조사 가능한 형태로 만듭니다.

Splunk를 사용할 경우 학습용 인덱스와 필드 확인을 먼저 마칩니다. 아래 `lab_logs`는 실제 인덱스로 바꾸고, 가상 자료의 기간을 Time Picker에서 선택합니다. 실시간 경보 시험은 별도의 현재 시각 실습 자료로 해야 합니다.

## 1단계 — 탐지 목표와 한계 쓰기

목표를 “PowerShell 명령이 포함된 작업 생성·변경을 찾아 조사한다”로 정합니다. 이것은 악성 판정이 아니라 검토 후보 수집입니다. 정상 관리에서도 PowerShell 예약 작업을 사용합니다.

필요한 데이터는 생성·변경 이벤트, 장비, 계정, 작업 이름과 XML입니다. 명령 실행과 외부 통신까지 확인하려면 별도의 프로세스·네트워크 자료가 필요합니다. ATT&CK T1053.005 매핑만으로 모든 예약 작업 악용을 탐지한다고 볼 수 없습니다.

## 2단계 — 필드 누락부터 측정하기

```spl
index=lab_logs
| spath
| eval event_id=tonumber(coalesce(EventCode,EventID,'System.EventID'))
| where event_id=4698 OR event_id=4702
| eval xml_state=if(len(coalesce(TaskContentNew,TaskContent,""))=0,"missing","present")
| stats count by xml_state
```

환경에 따라 4702의 새 작업 XML 필드가 `TaskContentNew` 등으로 표시될 수 있습니다. 원문과 파서의 출력명을 비교합니다. 가상 자료는 두 이벤트 모두 `TaskContent`를 사용하며, 한 번만 가져왔다면 `present` 2건을 기대합니다.

**확인할 결과:** 필요한 이벤트가 몇 개이고 그중 필드가 있는 비율이 얼마인지입니다. XML이 누락된 이벤트는 정상으로 통과시킬 근거가 아니라 별도의 데이터 품질 문제입니다.

## 3단계 — 설명 가능한 후보 검색 만들기

```spl
index=lab_logs
| spath
| eval event_id=tonumber(coalesce(EventCode,EventID,'System.EventID'))
| where event_id=4698 OR event_id=4702
| eval task_xml=coalesce(TaskContentNew,TaskContent,"")
| where match(task_xml,"(?i)(powershell|pwsh)")
| table _time record_id ComputerName event_id SubjectUserName TaskName task_xml
| sort 0 _time
```

**가상 자료의 기대 결과:** E005와 E007입니다. 두 기록이 검색되는 것은 규칙이 해당 문자열을 포함한 정의를 찾았다는 뜻입니다. 악성 작업 2개나 공격 성공 2회를 의미하지 않습니다. E007은 실행 명령이 아닌 설명 항목이 바뀐 사례입니다.

이 간단한 문자열 조건은 XML의 다른 부분에 등장한 단어도 일치시킬 수 있고, 다른 실행 파일·간접 실행·필드 누락을 놓칠 수 있습니다. 운영 규칙으로 발전시키려면 Actions의 실제 명령과 인자를 파싱하고 데이터 범위와 우회 가능한 표현을 검토합니다.

## 4단계 — 정상 사례와 미탐 조건 비교하기

| 시험 입력 | 이 후보 규칙의 예상 결과 | 조사할 내용 |
| --- | --- | --- |
| PowerShell을 쓰는 정상 관리 작업 | 후보로 표시 | 승인·실행 경로·계정 역할 |
| 설명만 바뀐 동일 작업 | 문자열이 있으면 표시 | 이전·이후 정의의 실제 차이 |
| 다른 프로그램을 실행하는 작업 | 조건에 따라 표시되지 않음 | 이 규칙의 범위 밖인지 |
| XML이 누락된 이벤트 | 후보에서 빠질 수 있음 | 수집·파서 문제로 별도 관리 |
| 동일 기록의 중복 수집 | 여러 번 표시될 수 있음 | 원래 기록 식별자로 중복 구분 |

예상한 일치와 악성 여부를 별도 열에 기록합니다. 정상 자료만으로 만든 검증 결과로 실제 공격 전반의 탐지율을 수치화하지 않습니다.

## 5단계 — 경보 이후의 조사 연결하기

경보에 규칙 ID·버전, 대상 기간, 장비·계정, 작업 이름, 근거 이벤트 식별자와 원문 검색 링크를 포함합니다. 원문 → 작업 XML → 실제 실행 → 통신 → 변경 승인 순서로 조사할 수 있어야 합니다.

같은 계정과 시각만으로 다른 장비의 활동을 합치지 않습니다. 프로세스 생성 시각·Logon ID·ProcessGuid 등 수집된 연결점을 사용하고 한계도 적습니다. 상세 절차는 [예약 작업 조사](scheduled-tasks.html)를 따릅니다.

## 6단계 — 실행 주기와 지연·중복 설계하기

자동 경보를 만들 때 실제 유입 지연과 검색 실행 시간을 측정합니다. 검색 창이 겹치면 누락을 줄일 수 있지만 중복 경보가 늘 수 있습니다. 장비·채널·원문 Record ID 등 안정적인 조합으로 중복을 구분합니다. 가상 `record_id`를 실제 모든 로그에 존재하는 필드로 가정하지 않습니다.

제한 시간 동안 경보를 억제하는 throttling은 중복 제거와 다른 기능입니다. 계정 이름만으로 넓게 억제하면 다른 장비의 새 행위까지 숨길 수 있으므로 억제 기준과 범위를 시험합니다. Hunt로 들어온 과거 자료는 ‘지금 발생한 공격’과 구분할 정책이 필요합니다.

## 7단계 — 개선 후 같은 자료로 다시 확인하기

조건을 바꾸기 전후의 후보 기록 목록과 누락 이유를 비교합니다. 새 필드를 요구하면 필요한 원문이 실제 계속 들어오는지도 확인합니다. 운영 단계에서는 유입 중단·파서 변화·원본 감사 비활성도 별도 감시 대상으로 둡니다.

**완료 기준:** 규칙의 목적, 데이터·필드, 기대 일치, 정상 사례, 놓치는 조건, 조사 절차와 변경 이력을 설명할 수 있습니다. 다음은 [퍼플팀 검증](purple-validation.html)입니다.

추가 공식 자료: [ATT&CK Scheduled Task](https://attack.mitre.org/techniques/T1053/005/), [Splunk Alert throttling](https://help.splunk.com/en/splunk-enterprise/alert-and-respond/alerting-manual/10.0/manage-alert-trigger-conditions-and-throttling/throttle-alerts).

## 운영 전 수집 상태와 현대 환경 연결하기

규칙의 성공 조건에 [source별 수집 상태·지연](telemetry-health.html)을 포함합니다. 특히 필요 시 Hunt로 들어오는 과거 자료는 실시간 스트림과 같은 시간 창으로 처리하면 누락되거나 현재 공격처럼 보일 수 있습니다.

Windows 규칙을 확장할 때는 [클라우드 계정·앱 권한](cloud-identity-response.html), [ClickFix·RMM](clickfix-rmm-investigation.html), [암호화 통신 가시성](encrypted-network-visibility.html)의 데이터 요구사항을 먼저 확인합니다. 동일 ATT&CK 이름을 사용하는 규칙도 데이터와 적용 범위는 다를 수 있습니다.

## 참고자료

- [MITRE ATT&CK](https://attack.mitre.org/)
- [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
- [Microsoft — Audit Other Object Access Events](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/audit-other-object-access-events)
