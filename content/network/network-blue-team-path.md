---
title: "블루팀 네트워크 학습 경로: DNS·웹·메일에서 조사까지"
description: "2022년 2일차 교재의 주제를 최신 표준과 비교하고 관측·수집·프로토콜 분석·통합 실습으로 연결합니다."
category: "network"
updated: "2026-10-09"
tags: ["네트워크 블루팀", "DNS", "HTTP", "이메일"]
order: "1"
level: "입문 · 실무 확장"
---

## 학습 범위와 준비

이 과정은 2022년 SEC450.2의 네트워크 구조, 수집 형식, DNS, HTTP/HTTPS, SMTP와 원격 접속 주제를 바탕으로 구성한 독립 학습 가이드입니다. 교재의 슬라이드와 실습 환경을 복제하지 않고 공식 문서·자체 가상 자료로 분석 절차를 보강했습니다. 1일차 [블루팀 운영 과정](blue-team-operations.html)의 관측·경보·사건 기록 다음에 읽습니다.

준비물은 구성도와 메모 도구입니다. [통합 실습](network-capstone.html)의 가상 로그는 도구 없이 읽거나 Python으로 집계할 수 있습니다. 실제 PCAP·Splunk·Zeek·Suricata·Arkime·Velociraptor는 환경이 준비된 뒤 적용합니다. 공식 자료 확인일은 **2026-10-08**입니다.

## 2022년 기본기와 최신 보강의 연결

| 교재의 중심 주제 | 계속 필요한 기본기 | 현재 보강할 내용 | 학습 글 |
| --- | --- | --- | --- |
| 네트워크 구조 | VLAN·라우팅·방화벽·관측 위치 | IPv6·클라우드·프록시·VPN·동일 VLAN 통신의 공백 | [관측 지도](network-architecture-visibility.html) |
| 트래픽 수집 | 흐름·프로토콜 로그·PCAP 선택 | 손실·snaplen·보존·암호화·수집 비용과 증거 조건 | [수집과 증거](network-capture-evidence.html) |
| DNS 이해 | 질의·응답·리졸버·TTL | HTTPS/SVCB 레코드, DoH·DoT·DoQ와 신원 연계 | [DNS 조사](dns-investigation.html) |
| DNS 악용 | 터널링·DGA·피싱 이름의 조사 | 정상 CDN·텔레메트리 비교와 다중 신호 검증 | [DNS 헌팅](dns-abuse-hunting.html) |
| HTTP/HTTPS | 요청·응답·헤더·리다이렉트 | HTTP/2·HTTP/3·ECH, 프록시/WAF·실행 증거 연결 | [웹 통신 조사](http-investigation.html) |
| SMTP·메일 | 경로·SPF·DKIM·DMARC | 새 DMARC 표준, 전달·ARC·토큰 피싱·BEC | [메일 조사](email-investigation.html) |
| 추가 프로토콜 | SMB·RDP·SSH·WinRM·ICMP·FTP | 서명·암호화·게이트웨이·RMM와 호스트 감사 | [원격 접속 조사](remote-protocol-investigation.html) |

이 표는 교재가 모든 최신 기술을 빠뜨렸다는 뜻이 아닙니다. TLS 1.3과 DoH는 2022년에도 존재했고 HTTP/3·DoQ 표준도 2022년에 발표됐습니다. 표준 발표와 조직 내 실제 적용률을 구분하며, 우리 환경의 가시성과 정책을 확인합니다.

## 공식 자료에서 확인한 변경

| 날짜 | 확인한 변화 | 블루팀에 미치는 영향 |
| --- | --- | --- |
| 2022년 | [HTTP/3 RFC 9114](https://www.rfc-editor.org/rfc/rfc9114), [DoQ RFC 9250](https://www.rfc-editor.org/rfc/rfc9250) | TCP/443·UDP/53만으로 웹·DNS 관측을 설명할 수 없음 |
| 2023년 | [SVCB·HTTPS RFC 9460](https://www.rfc-editor.org/rfc/rfc9460) | A/AAAA 외 서비스 연결 정보를 확인 |
| Windows 11 24H2 / Server 2025 | [SMB 서명 기본 요구](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-signing) | 클라이언트·서버 방향과 에디션에 따라 기준이 다름 |
| 2026년 3월 | [ECH RFC 9849](https://www.rfc-editor.org/rfc/rfc9849) | 실제 SNI를 항상 수동 센서에서 읽는다는 가정 수정 |
| 2026년 5월 | [DMARC RFC 9989](https://www.rfc-editor.org/rfc/rfc9989), [집계 보고 RFC 9990](https://www.rfc-editor.org/rfc/rfc9990), [실패 보고 RFC 9991](https://www.rfc-editor.org/rfc/rfc9991) | 예전 RFC 7489를 현행 기준으로 고정하지 않음 |
| 2026년 9월 사례 | [Microsoft EvilTokens 분석](https://www.microsoft.com/en-us/security/blog/2026/09/22/unmasking-eviltokens-getting-to-the-root-of-device-code-phishing/) | 메일·정상 로그인 URL 외 토큰 사용·장치·메일 규칙 조사 |

이는 확인한 표준·제품 변경·사례이며 전체 공격 빈도 순위가 아닙니다. 새 DMARC 규격의 pct 제거와 DNS Tree Walk 등은 메일 제공자 구현에 반영되는 시점이 다를 수 있습니다. 운영 설정은 제품 지원과 실제 결과를 검증합니다.

## 1단계 — 어디를 볼 수 있는지 설명하기

[관측 지도](network-architecture-visibility.html)에서 Core·Sensor·TAP·방화벽·스위치·리졸버를 표시합니다. 외부 웹, 같은 VLAN, VPN, 클라우드 통신 각각이 센서를 통과하는지 정상 시험으로 확인합니다.

**결과물:** 흐름별 관측 위치·원본 보존·미수집 구간 표. “센서 설치 완료” 대신 실제 관찰 이벤트를 근거로 적습니다.

## 2단계 — 조사 질문에 맞는 자료 고르기

[수집과 증거](network-capture-evidence.html)에서 흐름 로그·Zeek·EVE·PCAP의 범위와 한계를 비교합니다. 정상 PCAP의 기간·패킷 수·해시를 기록하고 표시 필터와 캡처 필터를 구분합니다.

**결과물:** 원본 자료와 분석 사본, 수집 조건을 포함한 증거 목록.

## 3단계 — DNS 질의와 웹 연결 묶기

[DNS 조사](dns-investigation.html)에서 클라이언트·리졸버·응답을 구분하고 [DNS 헌팅](dns-abuse-hunting.html)에서 정상 설명을 비교합니다. 이어 [웹 조사](http-investigation.html)로 요청·리다이렉트·응답·파일·실행의 근거를 분리합니다.

**결과물:** DNS와 웹의 uid가 다를 수 있음을 설명하는 타임라인. 응답 IP가 같아도 같은 서비스라는 결론을 자동으로 내리지 않습니다.

## 4단계 — 메일과 원격 접속의 맥락 확인하기

[메일 조사](email-investigation.html)에서 헤더의 신뢰 경계와 인증 결과를 확인한 뒤 로그인·메일 규칙을 추가합니다. [원격 접속 조사](remote-protocol-investigation.html)에서는 포트·성공 인증·실제 행동을 별도 확인합니다.

**결과물:** 사실·가설·추가 수집을 나눈 조사 메모. 정상 도메인이나 서명된 도구도 사용 맥락을 검토합니다.

## 5단계 — 가상 자료로 끝까지 조사하기

[네트워크 통합 실습](network-capstone.html)의 20개 사건 기록을 정리합니다. 정상 요청, 미확인 DNS 패턴, 자료가 없는 암호화 연결, 메일 규칙 변경을 구분하고 조사 범위와 인계 요청을 작성합니다.

**완료 기준:** 관찰된 자료로 증명한 것과 아직 증명하지 못한 것을 다른 분석가에게 설명할 수 있습니다. [조사 양식](downloads/network-investigation-template.md)을 사용하고 운영 과정의 [사건 관리](case-management.html)로 연결합니다.

## 교재의 개념 순서로 읽기

[블루팀 필수지식 · 2일차](category-blue-team-essentials.html#day2)에서는 DNS 이해와 DNS 분석·공격, HTTP 이해와 HTTP(S) 분석·공격을 별도 글로 설명합니다. SMTP 구조와 추가 프로토콜, 자체 실습도 교재 장 제목 순서로 제공합니다.
