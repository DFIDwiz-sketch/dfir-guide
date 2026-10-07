---
title: "첫 조사 실습: 로그 12개로 타임라인 만들기"
description: "별도 공격 랩 없이 가상 로그로 자료 확인, 인증·작업·통신 연결과 조사 메모를 완성하는 단계별 실습."
category: "learning"
updated: "2026-10-07"
tags: ["단계별 실습", "가상 로그", "타임라인"]
order: "1"
level: "입문"
---

## 실습 목표와 자료의 성격

**파일 서버의 예약 작업 변경을 시작점으로 인증·실행·통신을 연결하는 실습**입니다. 필요한 것은 텍스트 편집기 또는 Python 3뿐입니다. Splunk가 있다면 같은 자료로 검색도 연습할 수 있습니다. 실습 시간은 자신의 속도에 맞춰 나눠 진행합니다.

자료는 사이트 학습용으로 만든 **완전한 가상 데이터 12개**입니다. 실제 사건, EVTX 또는 Zeek·Suricata의 원본 형식이 아닙니다. 네트워크 자료는 간략화한 요약이고 Windows 필드도 학습용으로 일부만 포함합니다. IP는 문서용 대역, 도메인은 `.test`를 사용합니다. 이 주소에 접속하거나 스캔할 필요가 없습니다.

## 1단계 — 자료 내려받고 목록 확인하기

- [가상 로그 12개 — first-investigation.jsonl](downloads/first-investigation.jsonl)
- [Python 요약 스크립트 — first-investigation.py](downloads/first-investigation.py)
- [자료 SHA-256 — first-investigation.sha256](downloads/first-investigation.sha256)

세 파일을 같은 폴더에 저장합니다. JSONL은 한 줄에 JSON 객체 한 개가 있는 형식입니다. 편집기에서 열고 `record_id`, `timestamp`, `event_type`을 찾습니다. 모든 `synthetic` 값은 `true`입니다. 원본을 수정하지 말고 별도 분석 메모를 만듭니다.

Windows에서는 `Get-FileHash -Algorithm SHA256 .\first-investigation.jsonl`, Linux에서는 `sha256sum first-investigation.jsonl`로 해시를 비교할 수 있습니다. 줄바꿈·문자 인코딩을 바꿔 저장하면 해시가 달라질 수 있습니다.

**확인할 결과:** 기록 12개, ID `E001`~`E012`, 시간 범위 2026-10-07 00:04:50~00:10:00 UTC입니다. 같은 자료의 건수와 시간 범위가 다르면 다른 파일을 열었거나 수집·입력 과정에 변화가 있었는지 확인합니다.

## 2단계 — 도구 없이 먼저 세 줄 읽기

편집기에서 `E003`, `E004`, `E005`를 찾습니다.

| 기록 | 직접 관찰할 내용 |
| --- | --- |
| E003 | LAB-DC01에서 lab-operator의 4776 검증 성공 |
| E004 | LAB-FS01에서 lab-operator의 NTLM 네트워크 로그온 성공 |
| E005 | LAB-FS01에서 같은 주체 로그온 ID로 작업 생성 |

장비와 계정, `TargetLogonId` 또는 `SubjectLogonId`가 어느 필드에 있는지 확인합니다. DC 검증과 파일 서버의 실제 접근은 서로 다른 관찰 지점입니다.

**남길 결과:** “NTLM으로 인증한 계정과 작업을 생성한 주체의 연결이 관찰된다”는 메모입니다. 아직 정상 관리인지 계정 악용인지 판단할 자료는 충분하지 않습니다.

## 3단계 — Python으로 건수와 시간순 확인하기

Python 3이 설치된 Windows에서는 파일이 있는 폴더에서 다음을 실행합니다.

```powershell
py first-investigation.py first-investigation.jsonl
```

Linux·macOS에서는 다음을 사용합니다.

```bash
python3 first-investigation.py first-investigation.jsonl
```

이 스크립트는 동봉된 가상 자료를 읽어 요약만 출력합니다. 필요한 패키지를 따로 설치하지 않습니다. 입력 파일이 없거나 형식·시간대·ID에 문제가 있으면 오류로 종료합니다.

**확인할 결과:** `Records: 12`, `windows_event: 8`, `conn: 2`, `dns: 1`, `http: 1`입니다. Windows ID 4776은 2개이고, 4624·4625·4688·4698·4699·4702는 각각 1개입니다.

Python이 없다면 이 단계를 건너뛰고 편집기에서 같은 값을 세어도 됩니다. 명령을 실행할 수 있다는 것보다 기록의 의미를 설명하는 것이 실습 목표입니다.

## 4단계 — Splunk가 있다면 같은 자료 검색하기

데이터 업로드 권한이 있다면 학습 전용 인덱스에 JSONL을 한 번만 가져옵니다. 기존 수집 설정과 혼동되지 않는 source·sourcetype을 사용합니다. 미리보기에서 **한 줄당 한 이벤트**인지, `timestamp`의 `Z`를 UTC로 해석하는지 확인합니다. 필요하면 관리자에게 학습용 입력을 요청합니다.

아래 `lab_logs`는 예시 이름입니다. Time Picker를 2026-10-07 00:00~00:15 UTC에 해당하는 표시 시간대로 설정합니다. `_time`이 업로드 시각으로 잘못 들어갔다면 시간 추출부터 바로잡습니다.

```spl
index=lab_logs
| spath
| where synthetic="true"
| stats count by event_type
```

같은 인덱스에 다른 가상 자료가 있다면 실제 업로드 파일의 `source`도 제한합니다. boolean의 추출 표현이 다른 파이프라인에서는 원문을 보고 조건을 맞춥니다. 이어서 시간순으로 봅니다.

```spl
index=lab_logs
| spath
| where synthetic="true"
| table timestamp record_id event_type ComputerName EventCode TargetUserName SubjectUserName src_ip dst_ip TaskName
| sort 0 timestamp
```

이 파일의 시각은 동일한 UTC 형식이므로 문자열 정렬도 시간순과 같습니다. 시간대·정밀도가 섞인 실제 자료에는 그대로 일반화하지 않습니다. 상세 검색 점검은 [Splunk 6단계](splunk-basics.html)를 참고합니다.

## 5단계 — 인증, 작업, 실행과 통신 나누기

| 기록 | 관찰 | 해석할 때 남길 한계 |
| --- | --- | --- |
| E001~E002 | 이름 해석과 파일 서버 방향 SMB 연결 | 사용자·프로세스를 네트워크 요약만으로 확정하지 않음 |
| E003~E004 | 검증 성공과 대상의 NTLM 로그온 | Relay·Pass-the-Hash 여부는 미확인 |
| E005~E007 | 작업 생성, PowerShell 생성, 작업 변경 | 생성된 프로세스가 작업에서 시작됐다는 추가 연결점 필요 |
| E008 | 파일 서버에서 TLS로 분류된 연결 | 전송 내용·프로세스·유출 여부 미확인 |
| E009 | 별도 클라이언트의 HTTP 200 응답 | 다른 장비의 작업 실행과 바로 연결하지 않음 |
| E010~E011 | 다른 계정의 검증·로그온 실패 | 앞선 성공과 다른 계정·출발지 |
| E012 | 작업 삭제 | 흔적 삭제 목적이라고 자동 판정하지 않음 |

E005와 E007의 `TaskContent`를 비교하면 설명 항목이 추가돼 있고 명령은 같습니다. **변경 이벤트가 있다는 사실과 실행 명령이 바뀌었다는 사실은 다릅니다.**

## 6단계 — 두 가지 설명과 추가 자료 적기

첫 설명은 승인된 관리자가 관찰용 작업을 만들고 변경·삭제한 정상 관리 활동입니다. 다른 설명은 계정 악용 뒤 설정 변경이 발생한 상황입니다. 현재 시각을 출력하는 명령이 무해하더라도 실제 사용자의 승인 여부는 별도 확인해야 합니다.

두 설명을 구분하려면 관리 승인 기록, 계정의 평소 출발지, 관련 호스트의 프로세스 맥락과 실제 작업 실행 기록을 추가로 확보합니다. E008의 TLS 연결이 관련됐는지도 네트워크 요약만으로는 확인할 수 없습니다.

## 7단계 — 한 페이지 조사 메모 완성하기

아래 형식으로 작성합니다. 결론을 공격 확정으로 맞출 필요는 없습니다.

```text
조사 목표: LAB-FS01의 작업 변경 주체와 후속 행동 확인
자료: 가상 기록 12개, UTC, 원본 해시 별도 기록
확인한 사실: 기록 ID와 함께 작성
가능한 설명: 정상 관리 / 계정 악용 등 근거와 함께 작성
미확인 항목: 실제 작업 실행 연계, 승인 여부, TLS 연결 목적
다음 수집: 담당 장비·로그·필드와 필요한 기간
대응 판단: 추가 근거에 따라 어떤 조치를 검토할지 작성
```

**완료 기준:** 12개 기록을 시간순으로 설명하고, 인증 검증과 서비스 접근을 구분하며, 자료가 직접 말하지 않는 공격 방식·유출 여부를 미확인으로 남길 수 있습니다.

## 다음 학습 순서

[증거 보존](evidence-timeline.html) → [Splunk 검색](splunk-basics.html) → [Windows 이벤트](windows-events.html) → [호스트 초기 조사](windows-triage.html) → [네트워크 조사](network-investigation.html) → [NTLM 플레이북](ntlm-triage.html) 순서로 진행합니다. 전체 경로와 Linux·프로그래밍·APT 분석 과정은 [학습 로드맵](learning-roadmap.html)에 정리했습니다.

## 참고자료

이 실습 자료와 스크립트는 사이트에서 직접 작성한 학습용 예제입니다. 이벤트 의미는 [Windows 이벤트 가이드](windows-events.html)와 [NTLM 가이드](ntlm.html)의 Microsoft 원문 링크를 참고합니다.
