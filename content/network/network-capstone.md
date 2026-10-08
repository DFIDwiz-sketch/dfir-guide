---
title: "네트워크 통합 실습: 가상 기록 20개로 DNS·웹·메일 조사하기"
description: "도구 없이 시작해 Python·Splunk로 확장하고 근거·가설·관측 공백·인계 기록을 완성합니다."
category: "network"
updated: "2026-10-08"
tags: ["통합 실습", "가상 로그", "Splunk", "Python"]
order: "27"
level: "입문 · 실무 확장"
---

## 목표와 자료

DNS → HTTP 리다이렉트 → 메일 로그인·규칙, 그리고 암호화 연결·RDP를 하나의 조사 기록으로 정리합니다. **전부 자체 생성한 가상 자료**이며 실제 공격 실행·패킷 캡처·메일 발송은 포함하지 않습니다. 사건의 인과관계를 일부러 비워 두었으므로 로그에 없는 내용을 추측으로 완성하지 않습니다.

- [가상 사건 기록 JSONL 20개](downloads/network-day2-events.jsonl)
- [비작동 메일 헤더 예](downloads/network-day2-mail.eml)
- [네트워크 조사 양식](downloads/network-investigation-template.md)

주소는 문서용, 도메인은 .example을 사용합니다. JSONL은 학습용 공통 스키마이며 Zeek·Suricata·Microsoft의 원본 로그를 그대로 재현한 형식이 아닙니다. 모든 event_ts는 UTC입니다. uid 등 도구 맥락 필드는 비교 학습용입니다.

## 1단계 — 출처와 범위 적기

다운로드한 파일을 원본과 분석 사본으로 나누고 출처·해시·자료 버전을 적습니다. 사건 ID를 LAB-NET-02로 정하고 질문을 “analyst 계정과 192.0.2.10의 관련 행동 중 무엇을 입증할 수 있는가?”로 적습니다.

~~~bash
sha256sum network-day2-events.jsonl network-day2-mail.eml
~~~

교육 자료의 해시와 실제 사건 증거의 해시는 구분합니다. 파일 크기와 유효 JSON 여부를 확인합니다. 이 자료에는 PCAP이 없으므로 패킷 재조립·TLS 복호화 성공을 결과로 쓰지 않습니다.

## 2단계 — 도구 없이 타임라인 만들기

| ID | 핵심 관찰 | 첫 질문 |
| --- | --- | --- |
| N001–N002 | .11의 업데이트 이름 조회·HTTP 200 | 정상 업무 설명은 확인됐는가 |
| N003–N004 | .50 → .70 SSH·ops 인증 | 변경 티켓과 담당 검증 |
| N005 | analyst 수신 메일, 인증 평가 pass | 신뢰 경계·원본·업무 요청 |
| N006–N008 | .10 DNS·302·프록시 HTTPS 200 | 같은 요청 흐름인지 추가 확인 |
| N009–N010 | device-code 로그인·외부 전달 규칙 | 사용자의 승인·앱·세션 연결 |
| N011–N013 | .10의 세 TXT 질의 | 정상 프로그램·추가 기간 |
| N014·N019·N020 | UDP/443·NAT 대응·PCAP 만료 | 프로토콜·내용·보존 공백 |
| N015 | .11의 긴 텔레메트리 이름 | 긴 이름만으로 악성 분류 가능한가 |
| N016–N018 | RDP 포트·대상 로그인·프로세스 | 로그온 ID·부모가 충분한가 |

**기대 결과:** event_ts로 정렬하면 N019는 N014와 같은 시각입니다. 파일의 행 순서나 ID 순서가 발생 순서와 항상 같지는 않습니다.

## 3단계 — Python으로 20개와 종류 확인하기

Python 3, 표준 라이브러리만 사용합니다. 코드를 다운로드 파일과 같은 디렉터리의 inspect_network.py로 저장하고 python inspect_network.py로 실행합니다.

~~~python
import json
from collections import Counter
from pathlib import Path

path = Path("network-day2-events.jsonl")
rows = []
for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
    try:
        row = json.loads(line)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"line {line_number}: invalid JSON: {exc}")
    if not isinstance(row, dict) or not {"event_id", "event_ts", "source_type"} <= row.keys():
        raise SystemExit(f"line {line_number}: required fields missing")
    rows.append(row)

ids = [r["event_id"] for r in rows]
if len(ids) != len(set(ids)):
    raise SystemExit("duplicate event_id")
print("total", len(rows))
print(dict(sorted(Counter(r["source_type"] for r in rows).items())))
for r in sorted(rows, key=lambda r: (r["event_ts"], r["event_id"])):
    print(r["event_ts"], r["event_id"], r["source_type"])
~~~

**확인할 출력:** total 20. dns 6, conn 3, http 2, host_auth 2이고 나머지 host_process·mail·mail_rule·nat·proxy·signin·telemetry는 각각 1개입니다. 오류가 나면 파일 경로·완전한 다운로드·JSONL 줄 형식을 확인합니다. 오류 행을 삭제하고 정상 결과처럼 보고하지 않습니다.

## 4단계 — Splunk에서 조건을 순차 적용하기

선택 단계입니다. 시험 인덱스 lab_logs에 JSONL을 한 번 수집합니다. sourcetype은 _json으로 선택하고 JSON 검색 필드 추출을 확인합니다. 아래 예에서 인덱스는 실제 값으로 바꾸고 시간 선택은 처음에 **All time**으로 둡니다. 자동 설정된 _time을 검증하기 전까지 발생 시각은 event_ts로 비교합니다.

~~~spl
index=lab_logs sourcetype=_json source="*network-day2-events.jsonl"
| spath
| where dataset="network-day2-v1"
| stats count dc(event_id) as unique_ids by source_type
~~~

**기대 결과:** 11가지 종류, 합계 20, 고유 ID 20입니다. 중복 수집이면 count와 고유 ID를 비교하고 이유를 기록합니다. dedup으로 중복을 숨긴 뒤 수집 성공을 보고하지 않습니다.

~~~spl
index=lab_logs sourcetype=_json source="*network-day2-events.jsonl"
| spath
| where dataset="network-day2-v1" AND src_ip="192.0.2.10"
| sort 0 event_ts event_id
| table event_ts event_id source_type src_ip dst_ip query host status
~~~

**기대 결과:** N006·N007·N008·N011·N012·N013·N014·N016·N017의 9개입니다. N019는 internal_ip 필드여서 이 조건에 잡히지 않습니다. 계정·host_ip·internal_ip를 별도 확인해 범위를 확장합니다. 출발 주소 하나로 모든 관련 자료를 찾았다고 보고하지 않습니다.

## 5단계 — 네 가지 가설 검증하기

| 가설 | 현재 자료로 확인한 것 | 추가로 필요한 것 |
| --- | --- | --- |
| 메일이 토큰 탈취로 이어짐 | 동일 계정 메일·로그인·규칙이 시간상 근접 | 사용자의 동작·앱·세션·토큰 관련 서비스 감사 |
| TXT 질의가 DNS 유출임 | .10에서 세 TXT 질의 | 프로세스·인코딩 의미·파일·추가 기간·정상 대조 |
| UDP/443이 HTTP/3 C2임 | 흐름·바이트·NAT 대응 | 프로토콜 식별·종단 자료·정상 업무·내용 |
| RDP 세션에서 cmd 실행 | 대상 로그인·별도 프로세스 생성 | 로그온 ID·부모·명령행·세션 연계 |

메일 인증 평가 pass는 콘텐츠 안전의 증거가 아닙니다. .11의 긴 이름 N015도 악성의 증거가 아닙니다. N014의 UDP/443만으로 QUIC·HTTP/3·C2를 확정하지 않습니다. N018은 로그온 ID가 unknown이므로 N017의 실행으로 확정하지 않습니다.

## 6단계 — 키트의 추가 수집 계획 작성하기

Sensor/Splunk에서 기간·자산·원문 필드를 다시 확인합니다. Arkime에서 관련 PCAP 보존을 조회하되 N020은 N014의 패킷이 만료됐다는 가상 자료입니다. 만료된 패킷을 다시 확보했다고 적지 않습니다. NAT N019는 같은 시각의 포트·목적·전송 프로토콜로 연결합니다.

Velociraptor Hunt는 .10과 .30의 남은 과거 EVTX·브라우저·프로세스·설정 증거를 대상으로 계획합니다. host_process의 수집 모드는 on_demand_hunt이며 상시 수집으로 바꾸어 해석하지 않습니다. analyst와 analyst@company.example이 같은 사람·계정인지 디렉터리 대응 자료를 요청합니다.

**결과물:** 수집 항목·대상·기간·담당·완료 기준·불가능한 항목. [메일 조사](email-investigation.html), [DNS 헌팅](dns-abuse-hunting.html), [원격 접속 조사](remote-protocol-investigation.html)를 적용합니다.

## 7단계 — 인계문과 완료 기준

> .10에서 DNS 조회·HTTP 302·프록시 요청 및 후속 TXT 질의를 관찰했습니다. analyst@company.example의 device-code 로그인과 외부 전달 규칙은 업무 승인 확인이 필요합니다. 원인 관계와 토큰 탈취·DNS 유출은 미확인입니다. UDP/443은 프로토콜 미식별이며 관련 PCAP이 만료돼 내용 확인이 제한됩니다. .30의 원격 로그인과 프로세스 기록은 추가 세션 연계가 필요합니다.

이 문장은 가상 자료의 예이며 실제 사고 판단이 아닙니다. 완료 시 증거 ID, 정상 설명, 미확인 관계, 수집 공백과 다음 담당을 함께 전달합니다. 자동 격리·삭제를 수행하는 실습이 아닙니다.

**0개 검색 점검:** All time → 인덱스·권한 → 실제 source/sourcetype → 원문 → JSON 추출 → dataset → 필드 조건 순서로 확인합니다. Python 출력과 Splunk 건수를 대조합니다. [사건 기록](case-management.html)과 [블루팀 통합 실습](blue-team-capstone.html)으로 운영 흐름을 마무리합니다.
