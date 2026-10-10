---
title: "SMTP와 이메일 이해"
description: "SMTP 전달·Envelope/Header·Received 신뢰 경계와 SPF·DKIM·현재 DMARC 표준을 연결합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "개념", "블루팀 필수지식"]
order: "309"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "9"
chapter_title: "Understanding SMTP and Email"
textbook_page: "139"
lesson_type: "개념"
---

## 메일 전달과 메일 내용은 서로 다른 층이다

메일은 작성·제출, 서버 간 전달, 사서함 수신·열람의 과정으로 나눌 수 있습니다. 제출에는 SMTP 또는 서비스 API, 서버 간 전달에는 SMTP, 열람에는 IMAP·POP·웹·앱 API 등이 사용될 수 있습니다. 사용자가 웹메일을 쓴다고 해서 단말이 상대 조직의 SMTP 서버에 직접 연결하는 것은 아닙니다.

교재 순서에 따라 전달 구조와 SMTP 대화, 메시지·추적 헤더, 위조 문제와 SPF·DKIM·DMARC를 학습합니다. 두 상세 글에서 헤더의 출처와 인증의 범위를 분리해 설명합니다.

## Envelope와 Header 주소

| 구분 | 예 | 의미 |
| --- | --- | --- |
| SMTP MAIL FROM | bounce@relay.notice.example | 전달 과정의 반환·SPF 관련 주소 |
| SMTP RCPT TO | learner@study.example | 실제 전달 대상, 헤더 To와 다를 수 있음 |
| Header From | Finance Desk <billing@study.example> | 사용자에게 표시되는 작성자 주소 |
| Header Reply-To | help@notice.example | 답장 대상으로 제시된 주소 |
| Return-Path | <bounce@relay.notice.example> | 전달된 메시지의 reverse-path 관련 정보 |

여러 주소가 다른 것은 정상 대량 발송·반송 처리에서도 나타납니다. 차이 자체보다 인증 도메인·정렬·업무 맥락을 확인합니다. 표시 이름 Finance Desk는 인증된 조직 신원을 보장하지 않습니다.

## Received를 위에서 아래로 검증하기

메일 서버는 통상 자신이 받은 정보를 위쪽에 추가하므로 아래에서 위로 읽으면 주장된 시간 경로를 볼 수 있습니다. 그러나 신뢰 여부를 검토할 때는 자신이 관리하는 가장 최근 수신 서버부터 신뢰 경계를 따라 확인합니다. 외부가 미리 넣은 아래쪽 Received와 Authentication-Results는 위조될 수 있습니다.

수신 경계 서버가 관측한 연결 peer IP는 그 서버에 접속한 상대를 알려줍니다. 그 IP가 최초 작성자나 공격자의 장치라는 뜻은 아닙니다. EHLO와 PTR 이름도 서로 의미가 다릅니다. 헤더를 추가한 서버와 대응 message trace·queue ID를 확인합니다.

## 인증을 역할별로 구분하기

SPF는 해당 전달 시점의 IP가 검증 대상 도메인 정책에 맞는지를 확인합니다. DKIM은 서명 도메인과 서명 대상의 검증에 관련됩니다. DMARC는 Header From의 Author Domain과 정렬된 SPF 또는 DKIM의 통과를 연결합니다. 둘 모두 통과해야만 DMARC가 통과하는 것은 아닙니다.

N02는 SPF·DKIM 모두 relay.notice.example로 pass지만 Header From은 study.example입니다. 서로 정렬되지 않아 DMARC fail인 교육용 결과입니다. 인증 결과는 mx.study.example이 제공한 가상 값이며 실습 EML에 실제 DKIM 서명 검증 자료는 없습니다.

## 2022년 설명의 최신 보강

2026년 5월 RFC 9989가 RFC 7489·9091을 대체했습니다. 정책·조직 도메인 탐색과 일부 태그가 바뀌고 보고는 RFC 9990·9991로 나뉘었습니다. 기존 운영 시스템은 구형 표준을 구현할 수 있으므로 버전·업체 지원을 확인합니다. Authentication-Results는 현재 RFC 8601을 참고합니다.

DMARC pass는 내용이 안전하다거나 실제 사람이 승인했다는 뜻이 아닙니다. 정상 도메인의 탈취 계정, 유사 도메인과 표시 이름 사칭은 별도 조사해야 합니다.

## 학습 활동

[교육용 EML](downloads/blue-team-day2-mail.eml)을 원문으로 읽고 신뢰 경계·주소·인증 도메인을 표로 작성합니다. 마지막 메일 실습에서 MIME 첨부를 실행 없이 해석하고 N02와 연결합니다.

## 공개 참고자료

- [RFC 5321 — SMTP](https://www.rfc-editor.org/rfc/rfc5321.html)
- [RFC 8601 — Authentication-Results](https://www.rfc-editor.org/rfc/rfc8601.html)
- [RFC 9989 — DMARC, 2026년 5월](https://www.rfc-editor.org/rfc/rfc9989.html)
