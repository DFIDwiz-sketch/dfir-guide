---
title: "DNS 조사 6단계: 질의에서 자산·웹 연결까지"
description: "리졸버·응답 코드·A/AAAA·HTTPS 레코드와 캐시를 구분하고 Zeek·Splunk·PCAP의 DNS 자료를 연결합니다."
category: "network"
updated: "2026-10-08"
tags: ["DNS", "Zeek", "리졸버", "DoQ"]
order: "22"
level: "입문 · 실무 확장"
---

## 정상 DNS 흐름부터 이해하기

클라이언트는 보통 재귀 리졸버에 질의합니다. 리졸버는 캐시를 사용하거나 권한 서버 등에 질의해 응답합니다. DNS는 UDP/53만 사용하는 서비스가 아닙니다. TCP/53도 쓰며 DoT·DoH·DoQ에서는 수동 센서가 질의 본문을 읽지 못할 수 있습니다.

| 항목 | 의미 | 조사 주의 |
| --- | --- | --- |
| A / AAAA | IPv4 / IPv6 주소 | 둘 중 하나만 검색하면 일부 연결 누락 |
| CNAME | 다른 이름으로 연결 | 최종 주소와 체인·기간 확인 |
| MX / TXT | 메일 서버·텍스트 정보 | TXT 질의 자체가 터널링의 증거는 아님 |
| PTR | 역방향 이름 | 소유자·업무 신원 보증은 아님 |
| SVCB / HTTPS | 서비스 연결 정보 | A/AAAA 외 포트·ALPN·ECH 구성 관련 정보 |
| NOERROR | 정상 반환 코드 | 원하는 답이 없을 수 있어 answer도 확인 |
| NXDOMAIN | 해당 이름이 존재하지 않음 | 오타·검색 접미사·보안 제품도 원인 |
| SERVFAIL | 서버 처리 실패 | 검증·상위 서버·네트워크 상태 등 검토 |

TTL은 응답의 캐시 유효 기간에 관한 값입니다. 도메인이 안전한 기간이나 실제 연결 지속 시간을 뜻하지 않습니다. DNSSEC는 데이터의 출처·무결성을 검증하며 질의를 암호화하거나 도메인 콘텐츠의 안전성을 보장하지 않습니다.

## 1단계 — 관측 지점과 시간 정하기

대상 장비·UTC 기간·DNS 서버·Sensor 위치를 정합니다. 클라이언트 → 내부 리졸버를 보았는지, 리졸버 → 외부 서버를 보았는지 구분합니다. 후자에서는 수많은 사용자 질의가 리졸버 주소 하나로 보일 수 있습니다.

**결과물:** “어떤 장비가 조회했는가”와 “어떤 리졸버가 전달했는가”를 별도 열로 적습니다. DHCP·VPN·자산 기록으로 당시 주소를 확인합니다.

## 2단계 — 원본 질의와 응답 읽기

Zeek dns.log의 시각·uid·주소·query·qtype_name·rcode_name·answers·TTLs를 확인합니다. 필드 생성 여부는 버전·설정·패킷 상태에 따라 달라집니다. 요청과 응답이 불완전하거나 여러 값이면 그 상태를 기록합니다.

[가상 실습 자료](network-capstone.html)의 N006은 192.0.2.10이 리졸버 192.0.2.53에 login.docs.example을 조회하고 198.51.100.40을 응답받는 예입니다. 이 데이터는 학습용 정규화 형식이며 실제 Zeek 원문과 다릅니다.

**기대 결과:** 질의자·리졸버·이름·타입·응답을 한 문장으로 설명합니다. NOERROR만 보고 주소 응답이 있다고 단정하지 않습니다.

## 3단계 — 조건 하나씩 넣어 검색하기

실제 Splunk에서는 인덱스와 sourcetype을 [필드 확인](splunk-basics.html)으로 먼저 찾습니다. JSON 필드가 추출되는 Zeek 데이터의 예는 다음과 같습니다. index와 sourcetype은 환경의 실제 값으로 바꿉니다.

~~~spl
index=lab_logs sourcetype=zeek_dns
| table _time uid id.orig_h id.resp_h query qtype_name rcode_name answers TTLs
~~~

이후 대상 IP와 이름을 하나씩 추가합니다. 점을 포함한 필드 이름을 eval/where에서 사용할 때는 작은따옴표로 감쌉니다.

~~~spl
index=lab_logs sourcetype=zeek_dns
| where 'id.orig_h'="192.0.2.10"
| stats count values(answers) as answers by query qtype_name rcode_name
~~~

예의 IP는 문서용이며 실제 시험 장비 주소로 교체합니다. TSV 파서·CIM 별칭을 사용하는 환경에서는 필드 이름이 다를 수 있습니다.

## 4단계 — 이름과 웹 연결의 시간 관계 확인하기

답으로 나온 주소와 웹 conn/http 로그의 주소·시간을 비교합니다. DNS uid와 HTTP uid는 보통 다릅니다. CNAME·여러 답·IPv6·캐시·프록시·공유 CDN 때문에 이름과 연결이 일대일로 대응하지 않을 수 있습니다.

N006 이후 N007의 외부 HTTP 목적지는 응답 IP와 같습니다. 이름·시간·주소가 일치하는 **연결 후보**로 기록합니다. 이 일치만으로 실행이나 도메인 소유자를 확정하지 않습니다.

**추가 자료:** 프록시 host, 브라우저 이력, 호스트 프로세스, 리졸버 로그. 현재 새로 한 DNS 조회는 과거 답을 재현한다는 보장이 없습니다.

## 5단계 — 암호화 DNS와 비정상 경로 검토하기

| 방식 | 일반적인 전송 | 수동 센서의 한계 |
| --- | --- | --- |
| 일반 DNS | UDP·TCP/53 | 경로·캐시·손실에 따라 누락 |
| DoT | TLS, 보통 TCP/853 | 질의·응답 본문 암호화 |
| DoH | HTTPS | 웹 트래픽과 섞여 포트만으로 식별 불가 |
| DoQ | QUIC, 보통 UDP/853 | TLS 기반 암호화로 본문 제한 |

이 포트 표는 식별의 출발점입니다. 실제 프로토콜·정책·리졸버 설정을 확인합니다. 승인된 리졸버의 감사, 브라우저·OS 정책, 서비스 공급자 설정을 검토하고 암호화라는 이유만으로 차단하지 않습니다.

## 6단계 — 결과가 없을 때와 완료 기준

1. 시간·권한·인덱스와 원본 수집 여부를 확인합니다.
2. 클라이언트와 리졸버 중 어느 주소를 검색해야 하는지 확인합니다.
3. 캐시·hosts 파일·직접 IP 접속·프록시를 검토합니다.
4. DoH·DoT·DoQ와 센서 위치·양방향 수집을 확인합니다.
5. AAAA·CNAME·HTTPS 레코드와 필드 누락을 확인합니다.

**완료 기준:** 질의·응답과 후속 연결, 불완전한 대응, 과거와 현재 조회의 차이를 기록합니다. [DNS 헌팅](dns-abuse-hunting.html), [웹 통신 조사](http-investigation.html)로 이어갑니다.

## 참고자료

- [Zeek — dns.log](https://docs.zeek.org/en/current/logs/dns.html)
- [RFC 1035 — DNS](https://www.rfc-editor.org/rfc/rfc1035)
- [RFC 4033 — DNSSEC](https://www.rfc-editor.org/rfc/rfc4033)
- [RFC 9460 — SVCB·HTTPS](https://www.rfc-editor.org/rfc/rfc9460)
- [RFC 8484 — DoH](https://www.rfc-editor.org/rfc/rfc8484)
- [RFC 7858 — DoT](https://www.rfc-editor.org/rfc/rfc7858)
- [RFC 9250 — DoQ](https://www.rfc-editor.org/rfc/rfc9250)
