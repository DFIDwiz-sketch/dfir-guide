---
title: "실습 2.1: DNS 탐색"
description: "자체 JSONL로 DNS 경로·캐시·별칭·비인가 리졸버·TXT 후보를 찾고 제한과 후속 조사를 작성합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "자체 실습", "블루팀 필수지식"]
order: "305"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "5"
chapter_title: "EXERCISE 2.1: Exploring DNS"
textbook_page: "86"
lesson_type: "자체 실습"
---

## 실습 목표와 자료 범위

교재의 EXERCISE 2.1 Exploring DNS에 대응하는 자체 실습입니다. 원본 VM·Lab Workbook을 재현하지 않습니다. DNS 역할, 레코드, 캐시와 정책 후보를 24건의 가상 자료에서 해석하고 후속 조사까지 작성합니다. 실제 의심 도메인을 조회하거나 터널을 구축하지 않습니다.

- [사례 JSONL](downloads/blue-team-day2-case.jsonl)
- [2일차 조사 워크북](downloads/blue-team-day2-workbook.md)

모든 .example 이름과 문서용 외부 IP는 교육용입니다. source·cache·resolver_policy 등은 설명을 위한 정규화 필드입니다. 실제 제품 원시 로그와 동일한 스키마가 아닙니다.

## 준비와 필드 확인

한 줄에 JSON 한 건인 UTF-8 파일을 엽니다. id·timestamp·record_type·source가 공통 필드이고 DNS 행에는 query·qtype·rcode·answers 등이 있습니다. 파일을 Splunk에 넣는다면 교육용 인덱스를 사용하고 JSON 필드를 추출하며 날짜 범위를 2026-10-10 UTC로 맞춥니다. timestamp가 올바른 이벤트 시각으로 처리되는지도 확인합니다.

## 활동 1 · 질의자와 조회 경로

N03·N04·N09를 나란히 놓고 출발지·관측 출처·시각·cache를 비교합니다. N03의 원래 단말은 10.20.10.24, N04의 출발지는 리졸버 10.20.10.53입니다. N04만으로 단말을 정할 수 없습니다. N09는 캐시 hit이므로 외부 질의가 함께 나타나지 않을 수 있습니다.

## 활동 2 · 별칭과 주소

N06의 answers와 answer_types를 읽어 files.notice.example→edge.notice.example→203.0.113.20의 관계를 작성합니다. HTTP 이동은 N05의 302·Location에서 찾습니다. 두 관계를 분리해 표로 그린 뒤, DNS 조회만으로 파일 실행을 확인할 수 없는 이유를 적습니다.

## 활동 3 · 정책 후보와 터널링 후보

~~~spl
index=YOUR_LAB_INDEX dataset="bt2-case-v2" record_type="dns"
| table id timestamp source src_ip dest_ip transport query qtype rcode cache
| sort timestamp
~~~

DNS는 N03·N04·N06·N09~N14, 총 9건입니다. 단말→미승인 리졸버는 N10이며 TCP입니다. collect.notice.example 아래 고유 질의는 N10~N13 네 건입니다. 같은 경로로 본 N11~N13만 따로 비교하고 N14의 정상 TXT도 대조합니다. 짧은 표본에서 장기 터널링·유출을 확정하지 않습니다.

## SIEM 없이 재현하기

다운로드 파일과 같은 폴더에서 실행합니다. 표준 Python만 사용하며 외부 연결은 발생하지 않습니다.

~~~python
import json
from pathlib import Path
rows = [json.loads(x) for x in Path("blue-team-day2-case.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
dns = [r for r in rows if r["record_type"] == "dns"]
print("DNS:", len(dns))
print("미승인:", [r["id"] for r in dns if r.get("resolver_policy") == "not_approved"])
collect = [r for r in dns if r["query"].endswith(".collect.notice.example")]
print("고유 이름:", len({r["query"] for r in collect}))
~~~

기대 출력은 DNS: 9, 미승인: ['N10'], 고유 이름: 4입니다. 건수가 다르면 파일 버전·필터·중복 입력을 확인합니다. 이 코드는 후보 계산이며 악성 판정기가 아닙니다.

## 결과 작성

“09:03에 WS-024로 연결되는 주소에서 미승인 TCP/53과 세 개의 추가 TXT 후보를 관측했다. DNS 설정·원인 앱과 실제 전달 데이터는 미확인이다. 임대 N01과 수집 제한 N22를 고려했으며 필요 시 Hunt N23 결과를 확인한다.” 이 정도로 관측과 제한을 함께 기록합니다.

워크북에 출처·후보 ID·정상 가능성·다음 수집 항목을 채웁니다. 검색식 결과만 제출하지 않고 왜 해당 자료로 그 결론까지 말할 수 있는지 설명합니다.
