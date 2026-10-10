---
title: "트래픽 수집 상세 1 · Flow·메타데이터·PCAP 연결"
description: "조사 질문에 맞는 자료를 선택하고 센서·시간·식별자·보관 범위를 비교합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "분할 학습", "블루팀 필수지식"]
order: "302.01"
level: "입문 · 상세 해설"
course_day: "2"
course_order: "2"
chapter_title: "Traffic Capture and Analysis"
textbook_page: "19"
lesson_type: "분할 학습"
chapter_parent: "bt2-traffic-capture"
part_order: "1"
textbook_range: "19–25"
---

## 넓게 찾은 뒤 필요한 연결로 좁히기

조사 첫 질문이 “이 단말이 어느 외부 상대와 오래 통신했는가”라면 Flow가 효율적입니다. “무슨 이름을 조회했는가”는 DNS 기록, “어떤 파일 경로를 요청했는가”는 HTTP 기록이나 승인된 프록시 자료가 적합합니다. “응답 본문에 어떤 내용이 있었는가”는 해당 내용이 보관된 자료가 필요합니다. PCAP가 있어도 암호화된 본문은 바로 읽히지 않습니다.

Flow를 NetFlow/IPFIX로 받는 경우 원래 내보내기 레코드를 수집기가 해석합니다. sFlow처럼 표본화된 방식에서는 모든 패킷이나 모든 연결이 기록되었다고 가정하지 않습니다. 숫자를 비교할 때 수집 방식, 표본화, 단위, 방향과 시간 창을 확인합니다.

## 연결 필드를 읽는 순서

| 필드 묶음 | 확인할 질문 | 주의 |
| --- | --- | --- |
| 시작·종료·기간 | 언제 어떤 길이로 이어졌는가 | Flow 종료·색인 시각과 구별 |
| 출발·도착 주소 | 어느 관측 위치의 주소인가 | NAT·프록시·VPN 변환 |
| 출발·도착 포트 | 서비스 후보가 무엇인가 | 포트만으로 앱 확정 불가 |
| 전송 프로토콜 | TCP·UDP·ICMP 중 무엇인가 | UDP에는 TCP 세션 의미를 그대로 적용하지 않음 |
| 바이트·패킷 | 어느 방향으로 얼마나 보였는가 | 헤더 포함 여부·샘플링·손실 |
| 센서·연결 ID | 어떤 자료와 연결할 수 있는가 | 제품·재시작·범위별 ID 의미 |

Zeek의 orig와 resp는 관측된 연결의 originator와 responder를 뜻합니다. 항상 “직원”과 “인터넷 서버”를 뜻하는 것은 아닙니다. Suricata에서는 EVE의 flow_id로 같은 도구의 관련 레코드를 연결할 수 있지만 Zeek uid와 직접 같다고 조인하지 않습니다.

## 경보→거래→원문으로 내려가기

N08은 교육용 Suricata 형식의 목적지 후보 경보입니다. N07의 HTTP 거래와 시각·주소가 가깝지만 실제 규칙 근거나 수집 경로를 검토해야 합니다. 이 자료에서는 연관 관측을 연습할 수 있을 뿐 실제 엔진이 같은 경보를 냈다는 뜻이 아닙니다.

N07에는 다운로드 응답 상태, MIME 선언, 본문 크기와 해시가 있습니다. 그 정보는 전송 사실과 객체 연결에 도움이 됩니다. 악성 여부, 단말 저장, 실행 여부는 별도 판단입니다. N23의 Hunt 요청에는 아직 결과가 없으므로 실행을 주장할 수 없습니다.

## Splunk에서 자료 종류부터 확인하기

다음 예는 JSON 필드가 추출된 자체 자료를 대상으로 합니다. YOUR_LAB_INDEX를 실제 교육용 인덱스로 바꾸고, 날짜 범위를 2026-10-10 UTC 전체로 지정합니다. timestamp를 이벤트 시각으로 해석하도록 입력을 구성하거나 시각을 별도 확인합니다.

~~~spl
index=YOUR_LAB_INDEX dataset="bt2-case-v2"
| stats count values(source) AS sources by record_type
~~~

자료 종류별 건수는 워크북에 있습니다. 어떤 종류가 없을 때는 탐지 실패보다 먼저 자료 입력, 날짜 범위와 필드 추출을 확인합니다. 실제 EVE·Zeek 자료를 넣으면 event_type·uid·id.orig_h 등 필드가 다르므로 이 예를 그대로 복사하지 않습니다.

## 조사 범위의 한계 적기

N19의 UDP/443 흐름과 N20의 TLS 메타데이터에는 URL·본문이 없습니다. 다른 로그를 확보하기 전에는 웹 방문·DoH·자료 유출을 확정할 수 없습니다. 수집 제한을 기록하는 것은 조사 결과의 일부입니다. “해당 기간 이 센서에서 본 것”과 “조직 전체에서 일어난 것”을 구분해 보고합니다.

## 공개 참고자료

- [Zeek — conn.log](https://docs.zeek.org/en/current/reference/logs/conn.html)
- [Suricata — EVE 레코드와 연결](https://docs.suricata.io/en/suricata-8.0.0/output/eve/eve-json-format.html)
