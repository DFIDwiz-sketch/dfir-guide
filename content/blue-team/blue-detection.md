---
title: "블루팀 탐지와 위협 헌팅"
description: "수집 가능한 데이터에서 가설을 검증하고 경보를 조사 가능한 형태로 만듭니다."
category: "blue-team"
updated: "2026-10-07"
tags: ["블루팀", "탐지", "위협 헌팅"]
order: "13"
level: "입문"
---

## 탐지와 헌팅의 역할

탐지는 정의한 조건으로 반복 관찰하는 작업이며, 위협 헌팅은 가설을 세워 데이터에서 확인하는 조사입니다. 규칙 수보다 실제로 관찰할 수 있는 데이터와 결과를 판단할 맥락이 중요합니다.

## 탐지 설계의 최소 구성

| 구성 | 기록할 내용 |
| --- | --- |
| 가설 | 어떤 행동을 왜 의심하는가 |
| 데이터 | 필요한 로그·필드와 수집 조건 |
| 조건 | 시간, 계정·프로세스·연결의 조합 |
| 정상 사례 | 관리, 백업, 배포와 점검 작업 |
| 조사 방법 | 경보 이후 확인할 원문과 후속 증거 |
| 검증 | 재현 결과, 누락과 오탐의 근거 |

MITRE ATT&CK은 행동을 공통 언어로 설명하는 데 유용합니다. 기술 ID가 연결됐다는 사실만으로 해당 기술을 충분히 탐지한다고 볼 수 없습니다.

## 예시 가설

**예약 작업 변경 뒤 사용자 쓰기 가능 경로의 프로그램이 실행되고 외부 연결이 발생한다.** 작업 변경, 실행과 통신의 세 단계가 수집되는지 먼저 확인합니다. 하나가 누락되면 규칙의 성능과 조사 가능성이 달라집니다.

## 결과가 0건일 때

1. 대상과 시간 범위, 검색 권한을 확인합니다.
2. 인덱스·소스·sourcetype과 필드 이름을 확인합니다.
3. 최소 조건으로 원문부터 찾아봅니다.
4. 수집 지연, 필터와 보존 기간을 확인합니다.
5. 가설을 기각할 수 있는 데이터였는지 판단합니다.

`0건`은 곧 `안전함`이 아닙니다. [Splunk 검색의 시작점](splunk-basics.html)에서 데이터 확인 예시를 볼 수 있습니다.

## 참고자료

- [MITRE ATT&CK](https://attack.mitre.org/)
- [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
- [Microsoft — Audit Other Object Access Events](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/audit-other-object-access-events)
