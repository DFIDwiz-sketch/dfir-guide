---
title: "SIEM 탐지 수명주기: 명세·Sigma·검증·배포·폐기"
description: "탐지 질문을 데이터 계약과 검증표로 만들고 스키마·시간·오탐·예외·버전 변경을 운영합니다."
category: "blue-team"
updated: "2026-10-08"
tags: ["SIEM", "Sigma", "탐지 엔지니어링"]
order: "56"
level: "입문 · 실무 확장"
---

## 목표와 준비물

탐지 규칙은 검색식 하나보다 넓은 운영 단위입니다. 목적·필수 데이터·후속 조사·정상 사례·소유자·변경 이력까지 있어야 유지할 수 있습니다. 준비물은 [탐지 명세 템플릿](downloads/blue-team-detection-template.md), 학습 인덱스와 [가상 로그](first-investigation.html)입니다.

SPL은 예시이며 운영 제품에서 실행 검증한 결과가 아닙니다. 입력 자료의 정적 대조와 사이트 검증 결과는 별도로 표시합니다. 실제 적용 전 원문·필드·권한·검색 기간과 지연을 확인하세요.

## 1단계 — 유스케이스의 결정과 조사 질문 정하기

‘PowerShell 탐지’ 대신 ‘작업 생성·변경 정의에 PowerShell이 있는 후보를 찾아 실행 맥락을 조사한다’고 씁니다. 경보 뒤 누가 어떤 원문을 확인하고 어떤 조건에서 대응할지 정합니다. 사용자에게 보여줄 제목이 규칙의 근거보다 강한 결론을 내리지 않게 합니다.

목적·적용 대상·범위 밖 행동·데이터 의존성·필수 필드·정상 설명·후속 수집·심각도 근거·소유자·검토일을 명세에 넣습니다. [기존 탐지 실습](blue-detection.html)을 운영 명세로 발전시키는 과정입니다.

## 2단계 — 데이터 계약과 품질 기준 만들기

| 요구사항 | 확인할 내용 |
| --- | --- |
| 원본 조건 | 감사 정책·채널·이벤트 ID·권한 |
| 필드 | 장비·시각·작업 이름·XML의 실제 출력명 |
| 시간 | 이벤트 시간·인덱스 시간·백필·실행 주기 |
| 식별 | 장비·채널·원본 Record ID와 로그 초기화 조건 |
| 수집 | 상시 또는 Hunt, 마지막 정상 시험·보존 |
| 변경 | 파서·제품·artifact·규칙 버전과 담당 |

4698·4702가 있어도 XML이 없으면 같은 규칙을 적용할 수 없습니다. 대상 호스트 필드를 collector `host`로 잘못 매핑하지 않습니다. [수집 상태](telemetry-health.html)의 기대 source 목록과 연결합니다.

## 3단계 — 검색식의 후보 조건과 한계 확인하기

```spl
index=lab_logs
| spath
| eval event_id=tonumber(coalesce(EventCode,EventID,'System.EventID'))
| where event_id=4698 OR event_id=4702
| eval task_xml=coalesce(TaskContentNew,TaskContent,"")
| where match(task_xml,"(?i)(powershell|pwsh)")
| table timestamp record_id ComputerName event_id TaskName task_xml
| sort 0 timestamp
```

Time Picker는 가상 자료의 2026-10-07 기간으로 설정합니다. 한 번 수집한 12개 자료의 기대 후보는 **E005·E007**입니다. 이 기대값은 원본 자료와 조건을 대조한 것이며 Splunk 운영 실행 결과와 구분합니다.

문자열은 XML 설명이나 경로에도 나타날 수 있습니다. 실제 Actions의 Command·Arguments를 파싱하는 규칙으로 바꾸면 필드·XML 버전·간접 실행·누락 조건도 다시 확인합니다. 더 정교해졌다는 이유만으로 전반적인 탐지율이 향상됐다고 주장하지 않습니다.

## 4단계 — Sigma를 사용할 때 현지 매핑 검증하기

Sigma는 공유 가능한 탐지 표현 형식입니다. `logsource`, 필드·조건과 메타데이터를 먼저 읽습니다. backend와 processing pipeline은 제품의 검색 언어·필드·로그 범위로 변환하는 데 관여하므로 변환 결과를 검토해야 합니다. 파일 변환 성공은 실제 수집·경보 성공을 뜻하지 않습니다.

| 점검 | 통과 근거 |
| --- | --- |
| logsource | 우리 인덱스·채널·데이터 종류와 일치 |
| 필드·타입 | 실제 원문에서 필드 이름·숫자·문자열 비교 |
| 연산 조건 | OR·AND·대소문자·와일드카드가 의도와 일치 |
| pipeline·backend | 사용 버전과 로컬 매핑을 기록 |
| 결과와 조사 | 기대 후보·정상 사례·결과 필드를 확인 |

새 규칙은 [Sigma 공식 문서](https://sigmahq.io/docs/basics/rules.html)와 [processing pipelines](https://sigmahq.io/docs/digging-deeper/pipelines.html)를 확인합니다. 외부 규칙의 라이선스·출처·수정 이력을 보존합니다.

## 5단계 — 기대 일치와 악성 분류를 따로 시험하기

| 시험 | 후보 규칙 기대 | 검증할 제한 |
| --- | --- | --- |
| E005 작업 생성 | 일치 | 실제 작업 실행은 별도 |
| E007 설명 포함 정의 변경 | 일치 | 명령·인자 변경과 구분 |
| E012 작업 삭제 | 불일치 | 삭제는 이 규칙의 대상 밖 |
| XML 없는 생성 기록 | 불일치 또는 품질 경보 | 정상으로 분류하지 않음 |
| 같은 기록 재수집 | 후보 중복 가능 | 중복 키와 재수집 처리 |
| 다른 실행기·간접 실행 | 놓칠 수 있음 | 별도 행동 규칙 필요 |

누락·중복·지연·시간 파싱·정상 작업·예외 만료·연결 끊김을 추가 시험합니다. 일부 입력을 인위적으로 바꾸면 ‘변형 시험 자료’로 표시합니다. 작은 정상 자료만으로 전체 공격 탐지율을 계산하지 않습니다.

## 6단계 — 배포·예외·재검증 관리하기

검색 주기와 관측 창은 측정한 수집 지연과 실행 시간을 고려해 정합니다. 겹친 창에서 동일 경보가 생길 수 있어 적절한 원본 키로 구분합니다. 과거 Hunt/백필은 실시간 경보와 별도 처리합니다.

예외에는 대상·행동·정상 근거·소유자·만료를 붙입니다. 계정 하나를 무기한 제외하면 다른 장비의 악용을 숨길 수 있습니다. 먼저 제한된 대상에서 조사용 경보로 시험하고 변경·되돌리기 기준을 기록합니다.

규칙·파서·감사·제품·artifact가 변경되거나 수집 공백이 확인되면 재검증합니다. 경보를 낸 검색과 실제 배정·인계까지 도착하는 경로도 확인합니다.

## 7단계 — ATT&CK 연결과 폐기 기준 정하기

ATT&CK v18에서는 기존 Data Sources가 deprecated 됐습니다. 새 명세에는 기술·관련 Detection Strategy·Analytic·Data Component의 원문과 확인일, 실제 로그 요구사항을 기록합니다. 모든 기술에 해당 자료가 완비됐다고 가정하지 않습니다. 오래된 매핑은 참고하되 버전 차이를 표시합니다.

탐지 대시보드에는 ‘관측됨·시험 통과·미시험·수집 부재·예외 적용’을 구분합니다. ATT&CK 칸을 색칠한 수가 탐지율은 아닙니다. 기능 중복·데이터 폐기·더 나은 규칙으로 대체할 때는 관련 사건과 변경 근거를 보존한 뒤 비활성·폐기를 관리합니다.

**완료 기준:** 목적·데이터·후속 조사·기대 결과·실제 검증 범위·예외·버전과 재검토 조건을 설명합니다. 다음은 [퍼플팀 검증](purple-validation.html)입니다.

## 참고자료

확인일: 2026-10-08. 명세·시험표·SPL은 자체 학습 예시입니다.

- [ASD — SIEM·SOAR practitioner guidance](https://www.cyber.gov.au/publication/implementing-siem-and-soar-platforms-practitioner-guidance)
- [Sigma — Rules](https://sigmahq.io/docs/basics/rules.html)
- [Sigma — Processing pipelines](https://sigmahq.io/docs/digging-deeper/pipelines.html)
- [MITRE — Data Sources deprecation](https://attack.mitre.org/datasources/)
- [MITRE — Detection Strategies](https://attack.mitre.org/detectionstrategies/)
