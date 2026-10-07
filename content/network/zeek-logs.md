---
title: "Zeek 주요 로그 연결하기"
description: "conn.log에서 DNS·HTTP·TLS 로그로 이동해 통신의 맥락을 확인합니다."
category: "network"
updated: "2026-10-07"
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

## 참고자료

- [Zeek — conn.log](https://docs.zeek.org/en/current/logs/conn.html)
- [Zeek — dns.log](https://docs.zeek.org/en/current/logs/dns.html)
- [Zeek — http.log](https://docs.zeek.org/en/current/logs/http.html)
- [Zeek — Common Logs](https://docs.zeek.org/en/current/reference/logs/index.html)
