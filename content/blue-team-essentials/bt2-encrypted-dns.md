---
title: "DNS 분석 상세 3 · DoT·DoH·DoQ·DNSSEC"
description: "암호화 경로와 인증의 목적을 구별하고 관리 리졸버·앱 정책·감사 자료로 가시성을 보완합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "분할 학습", "블루팀 필수지식"]
order: "304.03"
level: "입문 · 상세 해설"
course_day: "2"
course_order: "4"
chapter_title: "DNS Analysis and Attacks"
textbook_page: "76"
lesson_type: "분할 학습"
chapter_parent: "bt2-dns-attacks"
part_order: "3"
textbook_range: "76–85"
---

## 보호하는 구간과 속성을 먼저 구별하기

DoT·DoH·DoQ는 클라이언트와 해당 리졸버 사이의 DNS 전송을 암호화하는 방식입니다. 리졸버에서 권한 서버로 이어지는 모든 통신까지 자동으로 암호화되는 것은 아닙니다. DNSSEC는 DNS 데이터의 출처 인증과 무결성 검증을 위한 체계이며 전송 기밀성을 대신하지 않습니다.

| 방식 | 전송의 개념 | 관측·정책 질문 |
| --- | --- | --- |
| 일반 DNS | UDP·TCP, 통상 53 | 승인된 리졸버·질의 로그가 있는가 |
| DoT | TLS 위의 DNS, 통상 TCP/853 | 관리 리졸버인가, 앱 설정은 무엇인가 |
| DoH | HTTPS 위의 DNS | HTTPS만 보고 DNS를 단정하지 않았는가 |
| DoQ | QUIC 위의 DNS, UDP/853 | QUIC 경로·리졸버 설정을 확인했는가 |
| DNSSEC | 서명·검증 체계 | 검증 상태·실패를 올바르게 해석했는가 |

포트는 후보 식별에 도움이 되지만 다른 포트나 프록시를 사용할 수 있습니다. HTTPS/443을 모두 DoH로 분류하면 일반 웹·API·원격 관리까지 섞입니다. 프로토콜 해석이나 승인된 앱·리졸버 감사로 확인합니다.

## DoH의 메시지를 정확히 이해하기

RFC 8484의 DoH는 DNS wire format을 application/dns-message로 전송합니다. GET은 DNS 메시지를 base64url로 표현한 파라미터를 사용할 수 있고 POST는 본문으로 보냅니다. 일부 서비스의 JSON API는 별도 인터페이스이며 표준 DoH가 JSON을 필수로 쓰는 것은 아닙니다.

암호화 때문에 수동 Sensor의 dns.log에 클라이언트 질의가 나오지 않을 수 있습니다. 반대로 승인된 리졸버는 복호화 뒤 질의 내용을 기록할 수 있습니다. 관측을 유지하는 방법을 “TLS를 전부 열어야 한다” 하나로 제한하지 않고 관리 리졸버, 브라우저·OS 정책과 서비스 감사 기능을 검토합니다.

## HTTP/3·ECH와 함께 달라지는 관측

DoH는 HTTPS를 사용하므로 해당 환경의 HTTP·TLS 전송 방식도 영향을 줍니다. QUIC/UDP가 보인다고 DoQ인지 HTTP/3인지 또는 다른 앱인지 자동으로 확정하지 않습니다. N19는 UDP/443 QUIC 메타데이터만 있고 ech=not_assessed입니다. 그 기록으로 DoH 또는 ECH 사용을 덧붙이지 않습니다.

N20은 교육용 TLS 1.3·ECH 관측입니다. 실제 목적 이름인 inner SNI가 제공되지 않아 이름 기반 연결에 한계가 있습니다. 외부 주소만으로 공유 인프라의 특정 서비스를 결정하지 않습니다. 승인된 프록시·앱·서비스 자료에서 이름과 요청을 보완합니다.

## DNSSEC가 보장하지 않는 것

서명 검증이 성공하면 신뢰 체계에 따른 DNS 데이터 검증에 도움이 됩니다. 서명된 도메인의 웹 콘텐츠가 안전하다거나 운영자가 선의라는 뜻은 아닙니다. 악성 운영자도 자신의 zone을 서명할 수 있습니다. 응답 플래그를 읽을 때 검증을 수행한 리졸버와 클라이언트의 신뢰 경로도 확인합니다.

## 운영 개선과 확인 절차

1. 자산별 승인 리졸버와 암호화 DNS 사용 방식을 정합니다.
2. 브라우저·OS·VPN과 관리 앱의 설정을 확인합니다.
3. Sensor, 리졸버 감사와 프록시에서 각자 무엇을 볼 수 있는지 기록합니다.
4. 승인된 시험 질의로 실제 경로와 필드·지연을 확인합니다.
5. 예외 앱·업무 영향을 검토하고 우회 탐지를 유지 관리합니다.

공개 리졸버 주소 목록은 바뀔 수 있어 고정된 2022년 차단 목록만으로 현재 상태를 판단하지 않습니다. 차단 자체의 성공도 로그·시험으로 확인합니다. 이 실습에서는 실제 외부 질의를 발생시키지 않고 가상 자료의 관측 제한을 설명합니다.

## 공개 참고자료

- [RFC 7858 — DoT](https://www.rfc-editor.org/rfc/rfc7858.html)
- [RFC 8484 — DoH](https://www.rfc-editor.org/rfc/rfc8484.html)
- [RFC 9250 — DoQ](https://www.rfc-editor.org/rfc/rfc9250.html)
- [RFC 4033 — DNSSEC](https://www.rfc-editor.org/rfc/rfc4033.html)
