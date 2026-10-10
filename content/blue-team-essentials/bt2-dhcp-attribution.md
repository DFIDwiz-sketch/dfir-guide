---
title: "추가 프로토콜 상세 1 · DHCP·임대 구간·자산 식별"
description: "이벤트 시각에 해당하는 IP 임대를 찾고 이름·MAC·NAT·VPN의 식별 한계를 확인합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "분할 학습", "블루팀 필수지식"]
order: "310.01"
level: "입문 · 상세 해설"
course_day: "2"
course_order: "10"
chapter_title: "Additional Network Protocols"
textbook_page: "163"
lesson_type: "분할 학습"
chapter_parent: "bt2-additional-protocols"
part_order: "1"
textbook_range: "163–165"
---

## IP는 장치의 영구 식별자가 아니다

동적 주소는 시간이 지나면 다른 장치에 배정될 수 있습니다. DHCP 임대는 주소·장치 식별·시각을 연결하는 유용한 자료지만 실제 사용자와 프로세스를 모두 알려주지 않습니다. 자산 목록, 계정 로그인, 네트워크 접속과 VPN/NAT 자료를 함께 확인합니다.

사건 시각 T가 lease_start ≤ T < lease_end에 들어가는 임대를 찾는 방식이 기본 출발점입니다. 실제 로그의 갱신·반납·만료 의미와 서버 시간도 확인합니다. 중복 임대나 기록 공백이 있으면 자동으로 한 자산을 고르지 않고 제한을 남깁니다.

## DHCP 동작의 읽기

IPv4의 초기 주소 배정은 Discover·Offer·Request·Acknowledgement로 설명할 수 있습니다. 클라이언트가 서버를 찾고 제안된 주소를 요청하며 서버가 임대와 설정을 확인합니다. 실제 목적 주소·브로드캐스트 여부는 상태·relay·플래그 등에 따라 다를 수 있어 교재 그림의 패킷 주소를 모든 배정의 고정값으로 외우지 않습니다.

DHCP는 주소뿐 아니라 DNS 서버·게이트웨이 등 설정도 제공할 수 있습니다. 비정상 서버가 이런 값을 바꾸면 이름 해석·경로가 달라질 수 있으므로 서버 승인 목록과 스위치·NAC 정책, 클라이언트 설정을 확인합니다. 주소를 받았다는 것 자체는 서버의 신뢰를 보증하지 않습니다.

## 공통 사례의 시간 연결

| 기록 | 구간·시각 | 의미 |
| --- | --- | --- |
| N01 | 08:00~12:00 | 10.20.10.24→WS-024 |
| N21 | 09:09 | N01의 구간에 들어가는 SMB 연결 |
| N24 | 12:05~16:05 | 10.20.10.24→WS-118 |

N21을 WS-118에 연결하면 사건 이후 임대를 과거에 적용하는 실수입니다. 12:00~12:05 공백에는 이 자료만으로 소유자를 확인할 수 없습니다. 시간표에서는 미확인 구간을 다른 장치에 억지로 배정하지 않습니다.

## 이름·MAC·OUI의 제한

DHCP hostname은 클라이언트가 제공할 수 있고 변경·위조가 가능합니다. MAC도 위조·랜덤화·가상화될 수 있습니다. OUI는 일반적인 할당 맥락에서는 제조사 단서가 되지만 실제 장치 모델·사용자·승인 여부를 확정하지 않습니다. locally administered 주소에는 같은 제조사 추정 방식을 적용하지 않습니다.

이 자료의 02로 시작하는 MAC은 가상 학습 식별자입니다. 실제 제조사 조회 대상으로 사용하지 않습니다. 이름이 회사 규칙과 다르다는 사실은 후보이며 게스트·신규 장치·이미지 변경 같은 정상 가능성도 확인합니다.

## NAT·VPN·IPv6를 고려하기

인터넷 로그에서 출발지 공인 IP가 같아도 여러 단말의 NAT 통신일 수 있습니다. 변환 주소·포트·시각을 연결하는 로그가 필요합니다. VPN 할당 주소는 VPN 세션·계정·장치 자료와 연결합니다. IPv6에서는 SLAAC·임시 주소·DHCPv6 등 다른 배정 방식이 있어 IPv4 DHCP만 조사하면 자산 연결이 빠질 수 있습니다.

현재 DHCPv6 표준 RFC 9915는 RFC 8415를 대체합니다. DHCPv6의 DUID·IAID와 임대 구간 등 식별 정보를 별도로 확인하고 IPv4 MAC만으로 연결하지 않습니다. SLAAC의 임시 주소와 DHCPv6의 주소 배정도 구별합니다.

DHCP에서 소유 후보를 찾았다고 그 장치의 로그인 사용자까지 확정하지 않습니다. 공유 장치, 원격 접속, 서비스 계정의 행동도 구별합니다. 자산 식별 단계와 사용자·프로세스 판정 단계를 별도 기록합니다.

## Python으로 사건 시각 연결

~~~python
import json
from pathlib import Path
rows = [json.loads(x) for x in Path("blue-team-day2-case.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
event = next(r for r in rows if r["id"] == "N21")
leases = [r for r in rows if r["record_type"] == "dhcp" and r["src_ip"] == event["src_ip"] and r["lease_start"] <= event["timestamp"] < r["lease_end"]]
print([(r["id"], r["asset"]) for r in leases])
~~~

이 파일은 같은 UTC ISO 형식이라 문자열 비교를 사용하는 예입니다. 일반 자료의 시간대·형식이 다르면 datetime으로 정규화합니다. 기대 결과는 [('N01', 'WS-024')]입니다.

## 학습 활동

N21의 자산·사용자·프로세스 중 어떤 것까지 확인했는지 적습니다. 장치 후보는 WS-024이며 사용자·프로세스는 제공되지 않았습니다. 다음 수집 요청에 자산 ID·주소·기간·필요 로그를 명시합니다.

## 공개 참고자료

- [RFC 2131 — DHCP](https://www.rfc-editor.org/rfc/rfc2131.html)
- [RFC 9915 — DHCPv6](https://www.rfc-editor.org/rfc/rfc9915.html)
