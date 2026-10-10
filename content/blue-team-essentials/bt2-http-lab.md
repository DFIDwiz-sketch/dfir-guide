---
title: "실습 2.2: HTTP와 HTTPS 분석"
description: "자체 HTTP 거래와 JSONL로 이동·객체·POST·정상 주기성·QUIC/ECH의 제한을 분석합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "자체 실습", "블루팀 필수지식"]
order: "308"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "8"
chapter_title: "EXERCISE 2.2: HTTP and HTTPS Analysis"
textbook_page: "137"
lesson_type: "자체 실습"
---

## 실습 목표와 자료

EXERCISE 2.2 HTTP and HTTPS Analysis에 대응하는 자체 활동입니다. 요청·응답, 이동, 다운로드·업로드 후보와 암호화의 제한을 분석합니다. 제공 텍스트는 PCAP가 아니며 실제 사이트를 방문하지 않습니다.

- [사례 JSONL 24건](downloads/blue-team-day2-case.jsonl)
- [HTTP/1.1 교육용 거래](downloads/blue-team-day2-http.txt)
- [조사 워크북](downloads/blue-team-day2-workbook.md)

텍스트는 승인된 TLS 종료 뒤의 내용을 표현합니다. T3는 4096바이트 요청 본문을 의도적으로 생략했으며 202 응답만 제공합니다. 없는 내용을 복원하거나 전송된 파일 이름을 만들어 넣지 않습니다.

## 활동 1 · 세 거래를 연결하기

| 거래 | 해당 이벤트 | 확인할 사실 | 아직 모르는 것 |
| --- | --- | --- | --- |
| T1 | N05 | GET·302·새 Location | 실제 사용자 의도 |
| T2 | N07 | GET·200·text/plain·36바이트 | 단말 저장·실행 |
| T3 | N15 | POST·4096바이트 본문·202 | 본문 내용·후속 처리 |

T1의 이동 지시가 T2와 이어지는 것을 시각·단말·URL로 비교합니다. DNS 별칭은 N06의 별도 관계입니다. “302가 있었다”와 “다음 요청도 관측했다”를 분리해 적습니다.

## 활동 2 · 반복 호출의 정상 대조

N16~N18의 호스트·경로·시각·context를 봅니다. 60초 간격의 승인된 모니터 요청입니다. 동일 간격은 후보 분석에 쓸 수 있지만 침해 증거가 아닙니다. N15의 POST도 본문 목적과 업무 승인을 확인하기 전에는 유출로 확정하지 않습니다.

~~~spl
index=YOUR_LAB_INDEX dataset="bt2-case-v2" record_type="http"
| table id timestamp src_ip host uri method status request_body_bytes response_body_bytes context
| sort timestamp
~~~

YOUR_LAB_INDEX를 바꾸고 JSON 필드와 2026-10-10 UTC 범위를 맞춥니다. 기대 결과는 N05·N07·N15~N18의 6건입니다. 경보 N08은 record_type=alert이므로 이 검색에는 포함되지 않습니다.

## 활동 3 · 암호화 자료의 제한

N19에는 QUIC 흐름, N20에는 TLS 1.3·ECH 메타데이터가 있습니다. 제공 정보에는 URL·본문이 없습니다. N19의 ECH는 not_assessed이고 N20의 실제 이름은 unavailable입니다. 각각에 대해 말할 수 있는 사실과 필요한 후속 자료를 씁니다.

N22의 센서 드롭·업링크 범위를 보고 “전체 전송이 없었다”라는 결론을 낼 수 있는지도 검토합니다. 빈 필드, 미수집, 복호화 불가, 실제 값 없음은 서로 다를 수 있습니다.

## Python으로 거래·간격 확인

~~~python
import json
from datetime import datetime
from pathlib import Path
rows = [json.loads(x) for x in Path("blue-team-day2-case.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
http = [r for r in rows if r["record_type"] == "http"]
print("HTTP:", len(http))
print("POST:", [(r["id"], r["status"], r["request_body_bytes"]) for r in http if r["method"] == "POST"])
monitor = sorted((r for r in http if r.get("context") == "approved_monitor"), key=lambda r: r["timestamp"])
t = [datetime.fromisoformat(r["timestamp"].replace("Z", "+00:00")) for r in monitor]
print("간격 초:", [(b-a).total_seconds() for a,b in zip(t,t[1:])])
~~~

기대 출력은 HTTP: 6, POST: [('N15', 202, 4096)], 간격 초: [60.0, 60.0]입니다. 이 계산은 거래 수와 두 간격을 확인하며 실제 운영 탐지 규칙의 검증을 대신하지 않습니다.

## 결과 기록

워크북에 “다운로드 응답 관측, 실행 미확인”, “업로드 후보의 수락 응답, 실제 내용·완료 미확인”, “승인 모니터의 반복 요청”, “암호화 연결의 세부 자원 미확인”을 각각 씁니다. 필요 시 N23의 Hunt 결과와 서비스 감사를 요청하되 아직 없는 결과를 사건 결론으로 사용하지 않습니다.
