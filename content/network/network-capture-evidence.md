---
title: "트래픽 수집과 증거 보존: 흐름·로그·PCAP"
description: "수집 형식 선택부터 캡처 조건·Arkime 내보내기·해시·Wireshark 분석까지 연결하는 6단계."
category: "network"
updated: "2026-10-08"
tags: ["PCAP", "Wireshark", "dumpcap", "증거 보존"]
order: "21"
level: "입문 · 실무 확장"
---

## 자료 선택의 기본

2022년 교재의 흐름 로그·프로토콜 로그·PCAP 구분은 여전히 유용합니다. 다만 “PCAP이 있으면 모든 내용을 알 수 있다”는 가정에는 암호화·손실·잘린 패킷·수집 범위 조건을 붙여야 합니다.

| 자료 | 답하기 좋은 질문 | 답하기 어려운 질문 |
| --- | --- | --- |
| NetFlow/IPFIX·클라우드 Flow Logs | 누가 어디로, 어느 정도 통신했는가 | 본문·실행·사용자의 의도 |
| Zeek 프로토콜 로그 | 관찰 가능한 DNS·HTTP 등의 의미 | 미수집·암호화된 내용 전체 |
| Suricata EVE | 어떤 규칙·프로토콜·흐름이 기록됐는가 | 경보만으로 공격 성공 여부 |
| PCAP/PCAPNG | 실제 관찰 패킷·재전송·평문 요청·응답 | 암호화 본문·관측 밖 행동 |
| 서비스·호스트 감사 | 인증·메일 규칙·프로세스·파일 행위 | 항상 실제 전송 패킷 전체 |

표본 수집과 집계 간격은 작은 흐름을 숨길 수 있습니다. NetFlow/IPFIX의 설정과 sFlow 표본 여부를 확인합니다. 모든 환경의 저장 비율이 같은 것으로 계산하지 않습니다.

## 1단계 — 질문과 보존 범위 정하기

“08:02 전후 호스트 A가 무엇을 요청했는가?”처럼 자산·기간·행동을 정합니다. PCAP, 프로토콜 로그, NAT·DHCP, 호스트 증거가 필요한지 각각 적습니다. UTC와 원래 시간대를 기록하고 전후 여유 구간을 포함합니다.

일정 대역폭을 그대로 저장하는 단순 추정은 평균 bit/s ÷ 8 × 초입니다. 실제 크기는 트래픽, snaplen, 캡처 헤더와 보존 정책에 따라 달라집니다. Arkime 검색 인덱스와 원본 패킷의 보존 기간이 같은지도 확인합니다.

## 2단계 — 캡처 조건 기록하기

인터페이스, 관찰 방향, 캡처 필터, snaplen, 도구 버전, 시작·종료·드롭 통계를 적습니다. 양방향 패킷이 없으면 응답·연결 상태 해석이 제한됩니다. TAP도 병합 포트·센서 처리·디스크 용량에 따라 손실될 수 있습니다.

권한 있는 시험 구간에서 Wireshark 배포에 포함된 dumpcap으로 인터페이스를 확인합니다.

~~~bash
dumpcap -D
~~~

목록에서 실제 캡처 NIC 번호를 확인한 뒤 아래 1을 교체합니다. 분석 PC의 관리 NIC와 혼동하지 않습니다.

~~~bash
dumpcap -i 1 -s 0 -b filesize:100000 -b files:10 -w lab.pcapng
~~~

약 100 MB 단위 파일 10개의 순환 캡처 예입니다. filesize는 kB 단위이며, 순환 시 오래된 파일을 덮어씁니다. 필요한 파일은 종료·회전 상태를 확인한 뒤 별도 보존합니다. Ctrl+C로 시험을 끝내고 종료 통계를 기록합니다. 실제 운영 캡처 설정을 이 예로 일괄 변경하지 않습니다.

## 3단계 — Arkime에서 세션과 패킷 따로 확인하기

시각·주소·포트·프로토콜과 관측 지점으로 세션을 찾습니다. 화면에 세션이 표시돼도 원본 패킷이 보존됐는지는 별도 확인합니다. 해당 세션의 **PCAP 내보내기**를 사용하며 raw payload와 구분합니다.

~~~bash
capinfos case.pcapng
sha256sum case.pcapng
~~~

**기대 결과:** 파일 형식·패킷 수·기간을 읽을 수 있고 SHA-256을 기록합니다. 파일 이름만 .pcap으로 바꿔도 형식이 변환되지 않습니다. 다운로드가 HTML 오류 페이지이거나 페이로드라면 원본 PCAP을 다시 내보냅니다.

## 4단계 — 원본과 분석 사본 나누기

원본 경로·크기·해시·출처·수집자·기간·조건을 적고 분석 사본에서 작업합니다. Zeek 로그를 재생성하면 Zeek 버전·실행 옵션·스크립트를 기록합니다. 재분석한 출력은 운영 당시 원본 로그와 구분합니다.

PCAP으로 악성 파일을 추출해도 그 파일이 실제 호스트에서 실행됐다는 뜻은 아닙니다. 파일 ID·해시·수신 시각을 호스트 증거와 연결합니다. TLS 키 자료를 사용한 복호화는 확보 권한·적용 세션·도구 지원을 기록합니다.

## 5단계 — 표시 필터로 작은 구간 읽기

캡처 필터는 저장할 패킷을 선택하고 Wireshark 표시 필터는 저장된 패킷의 표시를 선택합니다. 문법이 다르므로 서로 바꿔 넣지 않습니다.

~~~text
ip.addr == 192.0.2.10
ipv6.addr == 2001:db8::10
dns
http.request
tcp.stream eq 0
~~~

위 조건은 각각 독립된 표시 필터 예입니다. tcp.stream 번호는 파일마다 달라지므로 관련 패킷의 실제 값을 확인합니다.

~~~bash
tshark -r case.pcapng -Y dns -T fields -e frame.time_epoch -e ip.src -e dns.qry.name -e dns.qry.type
~~~

IPv6 출발지는 위 ip.src 열에 표시되지 않습니다. 필요하면 ipv6.src를 추가합니다. 한 패킷의 여러 값·구분자와 질의/응답 중복을 확인한 뒤 집계합니다. tshark 버전의 필드는 tshark -G fields로 확인할 수 있습니다.

## 6단계 — 한계와 다음 수집 적기

| 증상 | 확인할 순서 |
| --- | --- |
| 파일을 읽지 못함 | 다운로드 성공·실제 형식·PCAP/raw 선택 |
| 요청만 있고 응답 없음 | 양방향 경로·필터·손실·보존 |
| 본문이나 SNI가 안 보임 | TLS·ECH·터널·세션·분석기 지원 |
| 짧은 패킷·잘린 본문 | snaplen·수집 장비 제한 |
| 값은 있는데 다른 도구와 다름 | 기간·방향·집계·재조립·센서·NAT |

**완료 기준:** 자료의 무결성과 수집 조건을 기록하고 패킷으로 확인한 사실, 프로토콜 로그의 요약, 호스트 확인이 필요한 결과를 분리합니다. [네트워크 조사](network-investigation.html), [DNS 조사](dns-investigation.html), [암호화 가시성](encrypted-network-visibility.html)으로 이어갑니다.

## 참고자료

- [Wireshark — dumpcap](https://www.wireshark.org/docs/man-pages/dumpcap.html)
- [Wireshark — tshark](https://www.wireshark.org/docs/man-pages/tshark.html)
- [Wireshark — capinfos](https://www.wireshark.org/docs/man-pages/capinfos.html)
- [Arkime — FAQ](https://arkime.com/faq)
- [Suricata — EVE JSON](https://docs.suricata.io/en/latest/output/eve/eve-json-format.html)
