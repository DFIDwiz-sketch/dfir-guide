---
title: "블루팀 통합 실습: 경보에서 사건·헌팅·탐지 개선까지"
description: "가상 로그 12개로 후보 분류·근거 기록·추가 수집·규칙 명세·자동화 실패 시험·인계를 완성합니다."
category: "blue-team"
updated: "2026-10-08"
tags: ["통합 실습", "가상 로그", "블루팀"]
order: "59"
level: "입문 · 실무 확장"
---

## 목표와 준비물

이 실습은 [첫 조사 자료](first-investigation.html)를 재사용해 운영 흐름을 완성합니다. 자료는 **합성 로그 12개**이며 실제 공격·PCAP·완전한 Windows 사건 자료가 아닙니다. 악성 파일이나 공격 도구를 실행할 필요가 없습니다.

준비물은 [JSONL 다운로드](downloads/first-investigation.jsonl), 원문 확인 도구, [사건 양식](downloads/blue-team-case-template.md), [탐지 양식](downloads/blue-team-detection-template.md), [정보 카드](downloads/blue-team-intelligence-template.md), [자동화 양식](downloads/blue-team-automation-template.md)입니다. 이전 과정의 해시·자료 검증 절차를 따릅니다. Splunk 없이도 완성할 수 있습니다.

## 1단계 — 운영 범위와 사건 시작하기

범위는 가상 LAB-FS01의 예약 작업 생성·변경 검토입니다. 네트워크·DC 기록은 관련 맥락으로 사용합니다. `LAB-CASE-001`을 만들고 분류·호스트·네트워크·책임자 역할을 정합니다. 혼자라면 역할별 수행 내용을 기록합니다.

**기록:** ‘PowerShell을 포함한 작업 정의가 발견돼 정상 관리 또는 미승인 실행 여부를 조사한다.’ 아직 공격자 지속성이라고 확정하지 않습니다. 실제 사용자·운영 장비를 격리한 것처럼 쓰지 않습니다.

## 2단계 — 12개 자료와 필드 확인하기

원문 종류·기록 ID·시각과 호스트를 확인합니다. 자료를 한 번만 가져왔다면 Windows 기록 8개, 연결 기록 2개, DNS 1개, HTTP 1개입니다. 현재 과정에 실제 Suricata 경보나 Task Scheduler Operational 기록은 없습니다.

아래는 파일을 읽기만 하는 Python 예제입니다. `python3`가 없으면 텍스트 편집기로 같은 항목을 확인합니다. JSONL 다운로드 파일이 있는 디렉터리에서 실행합니다.

```python
import json
from collections import Counter
from pathlib import Path

rows = [json.loads(line) for line in
        Path("first-investigation.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()]
assert len(rows) == 12
assert all(row.get("synthetic") is True for row in rows)
assert len({row["record_id"] for row in rows}) == len(rows)
print(dict(Counter(row["event_type"] for row in rows)))
host_rows = [row for row in rows if row.get("ComputerName") == "LAB-FS01"]
print("LAB-FS01:", [row["record_id"] for row in host_rows])
candidates = [row["record_id"] for row in rows
              if row.get("EventCode") in (4698, 4702)
              and any(term in row.get("TaskContent", "").lower()
                      for term in ("powershell", "pwsh"))]
print("task candidates:", candidates)
```

**기대되는 결과:** 종류별 `dns: 1`, `conn: 2`, `windows_event: 8`, `http: 1`; LAB-FS01은 E004·E005·E006·E007·E011·E012; 작업 후보는 E005·E007입니다. 출력 dict의 표시 순서보다 키별 값과 기록 목록을 비교합니다.

## 3단계 — 사실과 연결 한계 기록하기

| 자료 | 확인 가능한 사실 | 아직 확인할 수 없는 것 |
| --- | --- | --- |
| E003 | DC의 lab-operator 검증 성공 기록 | 실제 파일 접근·권한 행사 |
| E004 | LAB-FS01의 NTLM 네트워크 로그온 | Relay·Pass-the-Hash 사용 여부 |
| E005·E007 | 동일 이름 작업 생성·변경, 명령·인자는 같고 설명 추가 | 실제 실행·악성 목적·승인 |
| E006 | 해당 호스트의 PowerShell 프로세스 생성 기록 | 그 작업에서 실행됐다는 직접 연결 |
| E008 | 가상 서버 IP의 외부 TLS 연결과 바이트 수 | 프로세스·C2·유출 내용 |
| E010·E011 | 다른 계정의 인증 실패 기록 | 같은 공격·브루트포스 확정 |
| E012 | 작업 삭제 기록 | 모든 지속성 제거·침해 종료 |

E004·E005·E006·E007에서 같은 장비의 Logon ID를 확인해 세션 맥락을 기록합니다. 작업과 프로세스의 직접 연결은 별도 근거가 필요합니다. 표에 없는 자료를 생성된 사실처럼 덧붙이지 않습니다.

## 4단계 — 후보 상태와 추가 수집 정하기

현재 결론은 ‘작업 생성·변경 후보 확인, 실제 실행 원인과 승인·통신 연결은 추가 확인’입니다. 실제 악성 사건이라고 단정할 자료가 충분하지 않습니다. 학습용 가상 자료라는 점도 사건 기록에 표시합니다.

| 추가 질문 | 요청할 자료 | 자료가 없을 때 기록 |
| --- | --- | --- |
| 실행이 작업에 연결되는가 | Task Scheduler·부모·EDR 실행 맥락 | 연결 확인 불가 |
| 정상 승인과 일치하는가 | 교육·관리 요청과 작업 변경 기록 | 승인 미확인 |
| TLS를 누가 만들었는가 | 호스트 연결·프로세스·프록시 | 프로세스·내용 미확인 |
| 계정이 다른 곳에도 쓰였는가 | 관련 장비·DC·서비스 로그 | 조사 대상 밖·보존 제한 |

추가 수집은 계획입니다. 실제 존재하지 않는 자료의 수집 성공을 기록하지 않습니다. Hunt만 쓰는 환경에서 오래전 단명 프로세스를 얻을 수 있는지도 확인합니다.

## 5단계 — 탐지 명세와 정상 사례 작성하기

[탐지 수명주기](siem-use-case-lifecycle.html)에 따라 필수 필드·후보 조건·기대 목록·정상 가능성·XML 누락·중복·지연·대상 밖 실행을 적습니다. E005·E007을 잡는 것은 조건 일치이며 악성 두 건이라는 뜻이 아닙니다.

선택 확장으로 분석 사본에 동일 기록 한 개를 추가하거나 XML을 제거해 봅니다. 변형 자료임을 표시하고 원본과 해시를 혼동하지 않습니다. 중복과 자료 부족을 정상·악성 판정에서 분리하는지 확인합니다.

## 6단계 — 정보 카드와 자동화 실패 시험하기

공개 공식 위협 보고서에서 행동 하나를 골라 정보 카드에 출처·관찰 기간·공유 조건·우리 환경의 관련성·추가 로그를 적습니다. 보고서의 공격자 귀속을 이 가상 사례에 붙이지 않습니다.

자동화는 ‘사건 원문 목록과 자산 정보를 읽어 메모 초안 작성’으로 제한한 mock 계획을 만듭니다. API 실패·대상 ID 불명확·중복·자료 없음에 대한 출력을 적습니다. 선택적으로 AI 요약을 비교할 경우 E006·E008의 연결 한계를 유지하는지 확인합니다. 실제 계정 조치나 외부 파일 업로드는 수행하지 않습니다.

## 7단계 — 인계와 운영 개선 과제 완성하기

```text
LAB-CASE-001 / 가상 자료 / 다음 담당:
확인: E005 생성, E007 변경; 같은 작업 정의의 설명 추가.
맥락: E004 로그온과 E005~E007의 호스트·세션 단서.
제한: E006의 작업 실행 연결, E008의 프로세스·내용은 미확인.
다음 수집: 실행 맥락·승인·연결 자료와 보존 여부 확인.
판단: 후보 확인; 악성·유출·공격자 귀속은 확정하지 않음.
개선: 필수 로그·XML 누락·중복·백필 처리 검증.
```

**완료 기준:** 사건 기록, 관측 공백 표, 탐지 명세, 정보 카드, 자동화 실패표와 인계문을 완성합니다. 근거 없이 추가한 공격 연결이 없고, 아직 수행하지 않은 조치는 계획으로 표시돼야 합니다.

## 후속 실습

이 과정 뒤 [GOAD-Light 조사](goad-light-investigation.html)로 실제 허용된 랩의 호스트·네트워크 자료를 확인합니다. 클라우드 토큰과 CI/CD는 별도 환경과 로그가 필요합니다. [블루팀 운영 경로](blue-team-operations.html)로 돌아가 현재 공백을 다음 학습 과제로 정합니다.
