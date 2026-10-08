---
title: "네트워크 포렌식 조사 흐름"
description: "통신 메타데이터에서 패킷·호스트 증거로 이어지는 조사 순서와 가시성의 한계."
category: "network"
updated: "2026-10-08"
tags: ["PCAP", "네트워크", "조사 흐름"]
order: "10"
level: "입문"
---

## 목표와 준비물

연결 기록 하나에서 요청·응답과 호스트의 실제 행동까지 따라갑니다. PCAP 또는 Zeek·Suricata·Arkime 자료, 시간대 정보와 센서 위치가 필요합니다. 데이터가 없다면 [첫 조사 실습](first-investigation.html)의 가상 네트워크 요약으로 출발할 수 있습니다. 가상 JSONL은 실제 PCAP이 아닙니다.

## 1단계 — 관찰 가능한 구간 그리기

센서가 인터넷 경계, DMZ, 내부 구간 중 어디를 보는지 적습니다. TAP·SPAN 양방향 수집 여부, 패킷 손실, 저장 기간, NAT·프록시의 위치를 확인합니다.

**확인할 결과:** 볼 수 있는 통신과 볼 수 없는 통신을 설명할 수 있어야 합니다. 경계 센서에 내부 장비 간 SMB가 없다고 내부 SMB 사용 자체가 없었다고 판단하면 안 됩니다.

## 2단계 — 연결을 특정하기

| 기준 | 기록할 값 |
| --- | --- |
| 시간 | 시작·종료와 시간대, 허용한 시계 오차 |
| 출발지·목적지 | 양쪽 IP 주소 |
| 포트·전송 계층 | 양쪽 포트, TCP 또는 UDP |
| 프로토콜 | HTTP·DNS·SMB 등 실제 파서 결과 |
| 출처별 식별자 | Zeek uid, Suricata flow_id, Arkime 세션 ID 등 |

Zeek의 originator·responder는 연결에서의 방향 역할을 나타내며 언제나 내부·외부 또는 피해자·공격자를 뜻하지는 않습니다. 포트 443도 그 자체로 모든 트래픽이 정상 HTTPS라는 보장은 아닙니다.

## 3단계 — Zeek에서 연결의 맥락 읽기

`conn.log`의 `id.orig_h`, `id.resp_h`, 양쪽 포트, `proto`, `service`, `duration`, 바이트 수와 연결 상태를 확인합니다. 같은 Zeek 관찰 맥락에서 `uid`를 이용해 관련 프로토콜 로그를 찾아봅니다. 별도 DNS 질의와 나중의 HTTP 연결은 보통 서로 다른 연결이므로 uid 하나로 바로 묶지 않습니다.

DNS는 질의·응답 이름·주소·시각을, HTTP는 host·URI·method·status와 방향을 봅니다. Suricata의 `flow_id`는 Zeek `uid`와 다른 체계입니다. 도구를 넘나들 때 시간과 주소·포트·프로토콜 및 센서 위치를 대조합니다.

**해석 예시:** DNS 이름 해석 뒤 해당 주소와 연결된 것은 연관 후보입니다. 같은 IP를 공유하는 서비스나 캐시·프록시가 있을 수 있어 실제 요청도 확인합니다.

## 4단계 — Arkime에서 원본 패킷 확인하기

1. 조사 기간과 대상 주소로 세션을 찾습니다. 필드 이름은 설치된 Arkime의 검색 필드 안내에서 확인합니다.
2. 요청과 응답의 방향, 포트, 프로토콜과 바이트 수를 비교합니다.
3. 패킷이 보존돼 있다면 해당 세션을 **PCAP 내보내기**로 저장합니다.
4. 파일 크기와 해시를 기록하고 분석 사본을 Wireshark에서 엽니다.

다운로드 메뉴의 원시 본문·한쪽 방향 데이터와 전체 패킷 캡처는 구분해야 합니다. 파일 이름에 `.pcap`을 붙여도 임의 바이트가 PCAP으로 변환되지는 않습니다. Wireshark 배포판에 포함된 `capinfos`가 있다면 형식을 확인합니다.

```bash
capinfos session.pcap
```

정상적인 캡처라면 파일 형식·패킷 수·기간 등을 확인할 수 있습니다. 실패하면 PCAP 대신 HTML 로그인 화면이나 payload를 저장했는지, 파일이 비었는지, 다운로드가 중단됐는지 확인합니다. Arkime에서 메타데이터가 보여도 원본 PCAP은 보존 기간 때문에 이미 삭제됐을 수 있습니다.

## 5단계 — Wireshark에서 필요한 교환만 보기

다음은 **디스플레이 필터**이며 캡처 필터와 문법이 다릅니다. 주소는 문서용 예시입니다.

```text
ip.addr == 192.0.2.10 && ip.addr == 192.0.2.20
```

```text
http.request
```

```text
dns
```

TCP 연결 하나를 선택했다면 `Follow TCP Stream`과 관련 패킷을 함께 살펴봅니다. 암호화된 TLS·QUIC 연결에서는 수동 PCAP만으로 애플리케이션 본문을 읽을 수 없을 수 있습니다. HTTP 파서가 내용을 식별하지 못한 경우 필터 결과가 없다고 요청 자체가 없었다고 단정하지 않습니다.

## 6단계 — 요청과 실제 실행을 연결하기

업로드 요청이 보이면 서버 응답과 애플리케이션 로그, 실제 파일의 저장 여부를 확인합니다. 그다음 웹 서비스의 자식 프로세스나 후속 통신을 조사합니다. HTTP 200은 서버의 응답 상태이며 코드 실행의 직접 증거가 아닙니다.

외부 전송량이 크다면 정상 백업·업데이트·프록시 트래픽과 비교합니다. 바이트 수만으로 어떤 파일이 유출됐는지 확정하지 않습니다. DNS도 이름 해석과 행위 연결에 필요하므로 초기 조사에서 일괄 제외하지 않습니다.

## 7단계 — 범위를 넓히고 기록하기

확인된 도메인·계정·파일 해시·주소와 연관된 다른 장비를 찾습니다. 공유 IP와 공용 서비스를 무조건 공격 지표로 확대하지 않습니다.

**완료 기준:** 연결 한 개에 대해 센서 위치, 시간·5-tuple, 요청·응답, 관련 호스트 증거와 미확인 영역을 설명하는 조사 메모를 완성합니다.

추가 공식 문서: [Zeek conn.log](https://docs.zeek.org/en/current/reference/logs/conn.html), [Zeek http.log](https://docs.zeek.org/en/current/reference/logs/http.html), [Arkime FAQ](https://arkime.com/faq), [capinfos](https://www.wireshark.org/docs/man-pages/capinfos.html).

## 참고자료

- [Zeek — Common Logs](https://docs.zeek.org/en/current/reference/logs/index.html)
- [Suricata — EVE JSON Format](https://docs.suricata.io/en/latest/output/eve/eve-json-format.html)
- [Arkime 공식 사이트](https://arkime.com/)

## DNS·웹·메일로 조사 확장하기

[네트워크 블루팀 학습 경로](network-blue-team-path.html)에서 관측 지도와 수집 형식을 먼저 확인합니다. 이후 [DNS 조사](dns-investigation.html) → [웹 조사](http-investigation.html) → [메일 조사](email-investigation.html) → [원격 접속 조사](remote-protocol-investigation.html)를 진행하고 [가상 기록 20개](network-capstone.html)로 근거와 한계를 정리합니다.
