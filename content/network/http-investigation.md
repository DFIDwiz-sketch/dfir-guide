---
title: "웹 통신 조사 7단계: 요청·리다이렉트·파일·실행"
description: "HTTP·HTTPS 자료와 프록시·WAF·호스트 흔적을 비교하고 HTTP/3·ECH가 바꾸는 가시성을 설명합니다."
category: "network"
updated: "2026-10-08"
tags: ["HTTP", "HTTPS", "리다이렉트", "HTTP/3"]
order: "24"
level: "입문 · 실무 확장"
---

## 요청과 결과를 나누는 기본기

HTTP는 요청과 응답을 제공하지만 연결 성공·HTTP 200·파일 수신·실행·침해는 서로 다른 결론입니다. 2022년의 HTTP 메서드·헤더·상태 코드 분석에 HTTP/2·HTTP/3·ECH, SaaS 인증과 호스트 후속 행위를 연결합니다.

| 관찰 | 확인한 것 | 아직 필요한 것 |
| --- | --- | --- |
| 연결·TLS 성공 | 관찰 지점에서 연결/핸드셰이크 | 사용자·요청 내용·업무 결과 |
| GET /download, HTTP 200 | 요청과 응답 상태 | 완전한 파일 수신·저장·실행 |
| 302와 Location | 서버의 이동 지시 | 실제 후속 요청 |
| POST와 큰 업로드 | 보낸 방향·크기·관찰 가능한 내용 | 기밀 자료·성공적 저장·유출 여부 |
| WAF 경보 | 탐지 조건에 맞는 요청 | 백엔드 도달·취약점 악용 성공 |

URI 확장자·User-Agent·MIME은 조작되거나 일반 프로그램과 겹칠 수 있습니다. 인증서가 유효해도 서비스 콘텐츠가 안전하다는 보증은 아닙니다.

## 1단계 — 관측 위치와 프로토콜 확인하기

Sensor가 클라이언트·프록시·서버 중 어느 연결을 보는지 확인합니다. HTTP/1.1 평문, TLS 위 HTTP/2, QUIC 위 HTTP/3의 가시성이 다릅니다. HTTPS가 항상 http.log에 URL을 남기지는 않습니다. UDP/443만으로 HTTP/3을 확정하지 않습니다.

TLS 1.3에서는 인증서도 암호화되는 핸드셰이크 구간에 있습니다. ECH 사용 시 실제 서버 이름과 내부 ALPN이 가려질 수 있습니다. [암호화 가시성](encrypted-network-visibility.html)에서 가정과 대체 증거를 확인합니다.

## 2단계 — 요청·응답의 필수 정보 읽기

시각, 출발/목적, host, URI, 메서드, 상태 코드, body 길이와 센서 ID를 확인합니다. Zeek에서는 uid와 trans_depth 등 연결 안의 요청 관계를 검토합니다. 같은 연결에 여러 요청이 있고 HTTP/2·3에는 다중 스트림이 있으므로 한 연결을 한 요청으로 계산하지 않습니다.

Zeek http.log, 프록시 로그, 웹 서버/WAF 감사는 같은 형식이 아닙니다. 원문 스키마와 보존 설정을 먼저 확인합니다. 프록시가 사용자를 인증했는지, host와 URL을 어느 구간에서 얻었는지 기록합니다.

## 3단계 — 시간·자산·요청 ID로 연결하기

먼저 좁은 시간의 실제 원문을 읽고 필드를 확인합니다. Zeek JSON 추출 환경의 예이며 index·sourcetype은 실제 값으로 바꿉니다.

~~~spl
index=lab_logs sourcetype=zeek_http
| table _time uid trans_depth id.orig_h id.resp_h method host uri status_code request_body_len response_body_len
~~~

점이 있는 필드의 where 조건은 'id.orig_h'처럼 작은따옴표로 감쌉니다. NAT·프록시 전후의 주소·포트·ID 대응을 추가합니다. 웹 서버 request ID가 있다는 이유로 다른 도구의 uid와 동일하다고 가정하지 않습니다.

## 4단계 — 리다이렉트 체인 실제 요청으로 확인하기

각 단계의 원래 URL·상태·Location·후속 요청 시각·관측 출처를 기록합니다. Location이 상대 경로이면 원래 URL 기준으로 해석합니다. Zeek 기본 로그에 Location이 반드시 있다고 가정하지 말고 원본 패킷·프록시·서버 로그 또는 확장 설정을 확인합니다.

[통합 실습](network-capstone.html)의 N007은 302 이동 지시, N008은 다른 로그 출처인 프록시의 후속 HTTPS 요청입니다. 같은 자산·시각의 연결 후보로 기록하며 동일 브라우저 탭에서 발생한 것인지는 추가 자료가 필요합니다.

의심 URL을 업무 브라우저에서 직접 열어 재현하지 않습니다. 보존된 자료나 허용된 격리 환경을 사용합니다. URL의 토큰·세션 값은 원본에는 보존하고 공유 메모에서는 마스킹합니다.

## 5단계 — 수신·저장·실행을 분리하기

관찰 가능한 파일 전송이면 Zeek files.log의 fuid·연결 UID·MIME·크기와 확보한 해시를 검토합니다. 부분 수신·압축·잘린 패킷은 완전한 파일과 구분합니다. Arkime의 raw payload와 PCAP 내보내기를 혼동하지 않습니다.

호스트의 다운로드 파일, 브라우저 이력, 프로세스 생성, 실행 흔적과 연결합니다. 현재 파일 존재만으로 과거 실행을 증명하지 않습니다. 키트에서는 필요한 장비·기간의 Velociraptor Hunt와 Hayabusa EVTX 분석을 추가합니다.

## 6단계 — 공격 가설을 백엔드·신원 자료로 검증하기

| 조사 가설 | 추가 자료 |
| --- | --- |
| 웹 취약점 악용 | WAF·웹/앱 감사·서버 프로세스·파일 변경 |
| 피싱·토큰 탈취 | 메일·브라우저·IdP 로그인·토큰 관련 감사·앱 권한 |
| ClickFix·RMM 실행 | 사용자 동작·명령·설치·프로세스·후속 연결 |
| 업로드 유출 | 파일 접근·요청 내용·서비스 저장 감사·수신 범위 |
| 비콘·C2 | 정상 주기 비교·프로세스·여러 기간·관련 행동 |

HTTP 200인 오류 페이지도 존재합니다. 정상 인증 사이트로 접속했다는 사실만으로 인증 요청이 안전했다고 단정하지 않습니다. [ClickFix·RMM 조사](clickfix-rmm-investigation.html), [클라우드 계정·토큰](cloud-identity-response.html)을 연결합니다.

## 7단계 — 빈 결과와 완료 기준

http.log가 없으면 먼저 평문이 실제 있었는지, 암호화·프로토콜 지원·센서 경로·손실·필드 추출을 확인합니다. proxy/WAF에만 본문 정보가 있거나 앱 감사만 가능한 경우 그 출처를 정확히 적습니다. 패킷 복호화 자료가 없다면 메타데이터만으로 결론 범위를 제한합니다.

**완료 기준:** DNS·요청·응답·리다이렉트·파일·실행 중 관찰한 단계를 표시하고 누락 자료와 수집 계획을 남깁니다. [증거 양식](downloads/network-investigation-template.md), [통합 실습](network-capstone.html)으로 정리합니다.

## 참고자료

- [Zeek — http.log](https://docs.zeek.org/en/current/logs/http.html)
- [Zeek — files.log](https://docs.zeek.org/en/current/logs/files.html)
- [RFC 9110 — HTTP 의미](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9113 — HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [RFC 9849 — ECH](https://www.rfc-editor.org/rfc/rfc9849)
