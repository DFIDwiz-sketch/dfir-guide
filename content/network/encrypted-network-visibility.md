---
title: "TLS·QUIC·암호화 DNS에서 보이는 것과 안 보이는 것"
description: "TLS 1.3·ECH·QUIC·DoH/DoT 환경의 관측 범위를 정하고 Zeek·Arkime·호스트 증거로 통신을 설명합니다."
category: "network"
updated: "2026-10-08"
tags: ["TLS · ECH", "QUIC", "DoH · DoT"]
order: "43"
level: "기초 · 실무 확장"
---

## 목표와 준비물

암호화는 정상적인 보호 기능입니다. 암호화됐다는 이유만으로 악성으로 보거나, 내용이 보이지 않는다는 이유로 조사할 수 없다고 단정하지 않습니다. 센서 위치·지원 프로토콜·버전·수집 설정에 따라 **실제 관찰된 필드**를 기준으로 분석합니다.

IETF는 2026년 3월 [RFC 9849](https://www.rfc-editor.org/rfc/rfc9849.html)로 TLS Encrypted Client Hello(ECH)를 표준화했습니다. 표준 발표가 모든 서비스의 즉시 사용을 의미하지는 않습니다. 기존 TLS 가시성 가정을 환경별로 재검증해야 하는 이유로 읽습니다.

## 1단계 — 프로토콜별 가시성 표 만들기

| 통신 | 수동 센서에서 관찰할 수 있는 것 | 쉽게 단정하면 안 되는 것 |
| --- | --- | --- |
| 평문 HTTP | 수집된 헤더·본문·상태 코드 | 요청이 서버 실행·침해에 성공했다는 판단 |
| TLS 1.3 | 주소·포트·시간·크기와 일부 초기 정보 | 서버 인증서·URL·본문이 항상 보인다는 가정 |
| ECH 사용 TLS | 외부 연결과 관찰 가능한 outer 정보 | outer 이름이 실제 서비스 이름이라는 판단 |
| QUIC·HTTP/3 | UDP 흐름과 분석기가 지원하는 메타데이터 | UDP/443이면 반드시 HTTP/3이라는 판단 |
| DoH·DoT | 리졸버 연결 및 일부 메타데이터 | 개별 DNS 질의·응답을 평문으로 읽을 수 있다는 가정 |

TLS 1.3의 인증서 메시지는 암호화됩니다. ECH는 ClientHello의 민감한 정보를 보호하지만 모든 연결 메타데이터를 숨기지는 않습니다. QUIC Initial에서 일부 핸드셰이크를 분석할 수 있는 것과 애플리케이션 본문을 복호화할 수 있는 것은 다릅니다. [QUIC TLS 표준](https://www.rfc-editor.org/rfc/rfc9001.html), [DoH 표준](https://www.rfc-editor.org/rfc/rfc8484.html).

## 2단계 — 센서의 관찰 위치와 손실 확인하기

TAP·SPAN 위치, 양방향 수집, NAT·프록시, 비대칭 라우팅과 패킷 손실을 기록합니다. 인터넷 출구 센서는 내부의 모든 동서 통신을 보지 못합니다. QUIC·TLS 분석기의 버전과 활성 설정도 확인합니다.

Zeek에서 `ssl.log`·`x509.log`가 없거나 필드가 비어 있어도 바로 미수집 사고 또는 공격으로 판단하지 않습니다. TLS 버전·복호화 여부·재개 세션·패킷 손실을 함께 검토합니다. [Zeek 로그 연결](zeek-logs.html)을 먼저 읽습니다.

## 3단계 — 세션을 도구 사이에서 연결하기

Zeek uid, Suricata flow_id, Arkime 세션 ID는 같은 식별자가 아닙니다. 센서·기간·주소·포트·전송 프로토콜을 대조하고 NAT 전후 변환도 확인합니다. Community ID를 사용할 때는 양쪽 활성화·버전·seed·관찰 위치를 확인합니다. 이름이 같아도 시간과 자산 확인이 필요합니다.

Arkime에서 원본 PCAP과 재조립된 payload 내보내기는 서로 다른 형식입니다. 패킷 분석에 사용할 파일인지 확인하고, 세션 메타데이터가 있다고 전체 PCAP 보존을 가정하지 않습니다.

## 4단계 — 메타데이터 가설을 추가 증거로 검증하기

주기적인 연결, 새 목적지, 업무 외 시간과 전송량은 헌팅 단서입니다. 업데이트·백업·동기화·모니터링도 같은 형태를 보일 수 있습니다. 연결 주기나 TLS 지문 하나만으로 C2·유출을 확정하지 않습니다. 지문은 클라이언트 버전·설정·중간 장비에도 영향을 받습니다.

| 부족한 정보 | 보완할 자료 |
| --- | --- |
| 누가 어떤 프로세스로 접속했는가 | EDR·Sysmon·호스트 연결 자료 |
| 어떤 이름을 조회했는가 | 관리 DNS·엔드포인트 DNS 기록 |
| 무슨 리소스를 요청했는가 | 승인 프록시·서버·SaaS 접근 감사 |
| 자료가 실제 나갔는가 | 파일 접근·전송 앱·목적지 서비스의 감사 |

필요 시 Hunt로 과거 연결의 프로세스를 복원할 수 있는지는 호스트에 남은 증거에 달려 있습니다. 현재 socket 목록은 이미 끝난 연결 전체를 보여주지 않습니다.

## 5단계 — 정상 통신으로 비교 실습하기

시험 장비에서 승인된 정상 사이트 한 곳을 방문하고 UTC 시각·프로세스·목적지를 기록합니다. 센서에서 해당 흐름을 찾은 뒤 DNS·서버 이름·인증서·URL·본문 각각을 ‘보임/안 보임/미수집’으로 표시합니다. 브라우저가 실제 사용한 프로토콜도 확인합니다.

QUIC·ECH를 강제로 켜거나 끄지 않아도 첫 비교는 가능합니다. 관찰되지 않은 프로토콜은 ‘시험하지 않음’으로 기록합니다. 업무 통신 복호화를 기본 해법으로 두지 말고 조직 정책·기술 범위·개인정보·성능을 검토합니다.

## 6단계 — 결론의 한계와 방어 기록하기

‘외부 TLS 연결 확인’, ‘호스트 프로세스와 연결 확인’, ‘자료 전송 내용 확인’을 단계별 결론으로 구분합니다. 관리 리졸버·프록시·엔드포인트 관측과 외부 통신 정책을 조합하고, 정책 적용 후 업무 영향을 시험합니다.

**완료 기준:** PCAP으로 확인할 수 있는 범위와 추가로 필요한 자료를 설명한 한 페이지 통신 메모를 작성합니다. 다음은 [수집 상태 점검](telemetry-health.html)입니다.

## 참고자료

- [IETF — RFC 9849 ECH](https://www.rfc-editor.org/rfc/rfc9849.html)
- [IETF — RFC 8446 TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
- [IETF — RFC 9001 QUIC의 TLS 사용](https://www.rfc-editor.org/rfc/rfc9001.html)
- [IETF — RFC 8484 DoH](https://www.rfc-editor.org/rfc/rfc8484.html)
- [IETF — RFC 7858 DoT](https://www.rfc-editor.org/rfc/rfc7858.html)
- [Suricata — EVE 설정·Community ID](https://docs.suricata.io/en/latest/output/eve/eve-json-output.html)

## DNS·웹·메일의 대체 증거 연결하기

암호화 DNS에는 [리졸버·호스트 자료](dns-investigation.html), HTTPS에는 [프록시·WAF·서버·실행 증거](http-investigation.html), 웹메일에는 [원본 메일과 신원·메일 감사](email-investigation.html)를 연결합니다. [원격 접속 가이드](remote-protocol-investigation.html)는 SMB over QUIC와 터널의 가시성 차이를 설명합니다.
