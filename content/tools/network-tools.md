---
title: "Zeek · Suricata · Arkime 역할 비교"
description: "프로토콜 로그, 규칙 기반 경보와 세션·패킷 검색을 함께 사용하는 분석 흐름."
category: "tools"
updated: "2026-10-08"
tags: ["Zeek", "Suricata", "Arkime"]
order: "17"
level: "입문"
---

## 각 도구가 남기는 자료

| 도구 | 주로 하는 일 | 조사에 쓰는 결과 |
| --- | --- | --- |
| Zeek | 트래픽을 프로토콜 맥락으로 분석 | conn·dns·http 등 구조화된 로그 |
| Suricata | 규칙 기반 탐지와 프로토콜 처리 | EVE alert·flow·프로토콜 이벤트 |
| Arkime | 세션 메타데이터 인덱스와 패킷 검색 | 검색 가능한 세션과 보존된 PCAP |

이 도구들은 서로 대체하기보다 다른 형태의 증거를 제공합니다. 실제 출력은 버전과 설정, 규칙 및 센서 위치에 따라 달라집니다.

## 함께 조사하는 흐름

1. Suricata 경보의 시각·주소·포트와 규칙 의미를 확인합니다.
2. Zeek의 연결·프로토콜 로그에서 전후 통신을 조사합니다.
3. Arkime 세션을 찾아 보존된 패킷과 요청·응답을 검토합니다.
4. 호스트 기록에서 해당 계정·프로세스의 행동을 찾습니다.

## 연결 식별자 주의

Suricata `flow_id`는 EVE 이벤트를 관련 흐름으로 묶는 데 쓰입니다. Zeek `uid`는 Zeek 로그의 연결 식별자입니다. 서로 다른 도구의 값이 같을 것으로 기대하지 않습니다. 주소·포트·프로토콜·시간과 센서 맥락을 비교합니다.

## PCAP과 본문의 한계

Arkime은 메타데이터만 보존하거나 선택적으로 패킷을 저장할 수도 있습니다. 검색 결과가 있어도 PCAP이 없을 수 있습니다. TLS를 포함한 암호화된 본문은 관련 복호화 자료 없이 보이지 않을 수 있습니다. 패킷 내보내기에서는 PCAP과 재조립한 원시 페이로드가 같은 형식이 아님을 확인합니다.

## 암호화·센서 위치·수집 건강도

도구가 설치됐다고 모든 통신을 관찰하는 것은 아닙니다. 센서의 TAP/SPAN 위치, 양방향 수집과 손실, 원본 PCAP 보존 및 프로토콜 분석기 설정을 확인합니다. [암호화 통신 가이드](encrypted-network-visibility.html)에서 TLS 1.3·ECH·QUIC·DoH/DoT의 차이를 비교합니다.

공통 흐름 식별을 위해 Community ID를 사용할 수 있지만 지원·활성화·seed와 NAT 전후 관찰 지점이 맞아야 합니다. 값이 같다는 이유만으로 다른 시각·센서의 사건을 자동 합치지 않습니다. [Suricata EVE 설정](https://docs.suricata.io/en/latest/output/eve/eve-json-output.html).

원본 센서 기록부터 Splunk까지 정상 이벤트 한 개를 추적한 뒤 경보를 해석합니다. [수집 상태·지연](telemetry-health.html)은 상시 스트림과 과거 Hunt 자료의 차이를 설명합니다.

## 참고자료

- [Zeek — Common Logs](https://docs.zeek.org/en/current/reference/logs/index.html)
- [Suricata — EVE JSON Format](https://docs.suricata.io/en/latest/output/eve/eve-json-format.html)
- [Arkime 공식 사이트](https://arkime.com/)
