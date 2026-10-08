---
title: "Zeek 주요 로그 연결하기"
description: "conn.log에서 DNS·HTTP·TLS 로그로 이동해 통신의 맥락을 확인합니다."
category: "network"
updated: "2026-10-08"
tags: ["Zeek", "프로토콜 로그", "uid"]
order: "11"
level: "입문"
---

## conn.log에서 시작하기

`conn.log`는 관찰한 연결을 요약합니다. `id.orig_h`·`id.orig_p`는 연결의 originator, `id.resp_h`·`id.resp_p`는 responder의 주소와 포트입니다. 내부·외부 또는 공격자·피해자와 항상 같은 의미는 아닙니다.

## 자주 확인하는 로그

| 로그 | 주요 내용 | 분석 맥락 |
| --- | --- | --- |
| conn.log | 주소, 포트, 지속 시간, 바이트와 연결 상태 | 누구와 어떤 연결이 있었는가 |
| dns.log | 질의, 응답, 반환 코드 | 통신과 이름 해석의 관계 |
| http.log | 요청 메서드, host, URI와 상태 코드 | 관찰 가능한 HTTP의 요청·응답 |
| ssl.log / x509.log | TLS 연결 및 인증서 자료 | 관찰 가능한 핸드셰이크·인증서 |

모든 로그가 항상 생성되는 것은 아닙니다. 수집 설정, 프로토콜 식별, 암호화, 손실과 보존 조건을 확인합니다.

## uid로 연결하기

같은 Zeek 수집 맥락에서 `uid`는 연결 관련 로그를 연계하는 데 유용합니다. HTTP 한 연결 안에 여러 요청이 있을 수 있으므로 요청 시각과 트랜잭션 정보도 확인합니다. 파일 로그는 관련 연결 UID와 파일 식별 정보를 함께 사용합니다.

## 조사 메모의 예

> 특정 호스트의 DNS 질의 후 해당 응답 주소로 HTTP 연결이 관찰됐습니다. 요청 경로와 응답을 확인했으나 서버 측 실행 여부는 호스트 증거가 필요합니다.

메타데이터가 설명하는 행동과 아직 확인하지 못한 결과를 구분합니다. `service` 필드나 포트 번호 하나만으로 모든 애플리케이션의 실제 동작을 확정하지 않습니다.

## 필드가 없을 때 확인할 순서

1. PCAP에 해당 구간과 양방향 패킷이 있는지 확인합니다.
2. Zeek 버전·분석기·필터·센서 위치를 확인합니다.
3. 해당 프로토콜이 실제 사용됐는지 확인합니다. 포트만으로 결정하지 않습니다.
4. 암호화·세션 재개·ECH·패킷 손실 때문에 그 필드가 보이지 않는지 검토합니다.
5. 원본 Zeek 출력과 Splunk 파서 결과를 비교합니다.

TLS 1.3에서는 수동 센서가 인증서를 항상 읽을 수 없으며, ECH 사용 시 실제 서버 이름도 가려질 수 있습니다. `ssl.log`의 이름 필드가 없다는 이유만으로 악성으로 분류하지 않습니다. 자세한 조건은 [TLS·QUIC·암호화 DNS](encrypted-network-visibility.html)를 참고합니다.

## 정상 연결 하나로 검증하기

시험 장비에서 정상 웹 접속 시각을 기록합니다. 먼저 conn 로그를 찾고, 같은 uid의 프로토콜 로그와 해당 시각의 DNS 응답을 비교합니다. DNS 연결의 uid와 웹 연결의 uid가 같을 것으로 기대하지 않습니다. 주소·응답·시각을 연결하되 캐시·공유 IP·리졸버 위치 때문에 대응이 불완전할 수 있습니다.

**완료 기준:** 관찰한 요청·이름·연결과 미관찰 항목을 구분한 메모를 남깁니다. 관련 [수집 지연 점검](telemetry-health.html)도 함께 수행합니다.

## 참고자료

- [Zeek — conn.log](https://docs.zeek.org/en/current/logs/conn.html)
- [Zeek — dns.log](https://docs.zeek.org/en/current/logs/dns.html)
- [Zeek — http.log](https://docs.zeek.org/en/current/logs/http.html)
- [Zeek — Common Logs](https://docs.zeek.org/en/current/reference/logs/index.html)

## 프로토콜별 조사 이어가기

[DNS 질의·응답 조사](dns-investigation.html)와 [DNS 악용 헌팅](dns-abuse-hunting.html), [웹 요청·리다이렉트](http-investigation.html), [메일 헤더와 SaaS 감사](email-investigation.html)를 연결합니다. 로그 재생성·캡처 조건은 [수집과 증거](network-capture-evidence.html), 가상 스키마 실습은 [네트워크 통합 실습](network-capstone.html)에서 다룹니다.
