---
title: "메일 이해 상세 1 · SMTP 대화·Received·신뢰 경계"
description: "전달 주소·표시 주소·추적 헤더를 구별하고 관리 수신 서버부터 메시지 경로를 검증합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "분할 학습", "블루팀 필수지식"]
order: "309.01"
level: "입문 · 상세 해설"
course_day: "2"
course_order: "9"
chapter_title: "Understanding SMTP and Email"
textbook_page: "140"
lesson_type: "분할 학습"
chapter_parent: "bt2-smtp-email"
part_order: "1"
textbook_range: "140–151"
---

## 제출·중계·열람의 역할

MUA는 작성·열람에 쓰는 클라이언트 역할, MTA는 전달 서버 역할, MDA는 사서함 전달 역할입니다. 하나의 서비스가 여러 역할을 수행할 수 있습니다. 제출은 일반적으로 인증된 서비스 경로를 사용하지만 서버 간 메일 전달은 다른 신뢰·검증 문제를 가집니다. SMTP AUTH가 있다고 모든 외부 메일의 표시 From까지 인증된 것은 아닙니다.

서버 간 SMTP는 통상 TCP/25, 제출은 587 또는 implicit TLS 465 등 구성을 사용할 수 있습니다. 실제 포트·TLS·인증은 서비스 설정을 확인합니다. STARTTLS로 암호화가 시작되면 수동 캡처에서 뒤의 대화·본문이 보이지 않을 수 있습니다.

SMTP의 TLS는 해당 서버 사이 구간을 보호하는 것이며 메시지가 모든 중계·사서함·수신자에 걸쳐 끝까지 암호화되었다는 뜻은 아닙니다. 연결 TLS, 발신 도메인 인증, 메시지 내용 암호화는 별개입니다. 사서함 또는 서비스 감사에서 얻은 메시지 원문을 패킷 복호화로 얻었다고 보고하지 않습니다.

## SMTP 대화의 층

~~~text
EHLO relay.notice.example
MAIL FROM:<bounce@relay.notice.example>
RCPT TO:<learner@study.example>
DATA
From: Finance Desk <billing@study.example>
To: learner@study.example
Subject: Training invoice review

[message body]
.
~~~

교육용 대화이며 실제 서버에 전송하지 않습니다. EHLO는 송신자가 제시한 식별입니다. MAIL FROM과 RCPT TO는 전달 Envelope, DATA 안의 From·To·Subject는 메시지 필드입니다. Bcc, 목록·전달 서비스 등에서는 RCPT TO와 Header To가 다를 수 있습니다. 주소의 local part와 헤더 값까지 모두 대소문자를 무시해도 된다는 일반 규칙을 적용하지 않습니다.

SMTP의 2xx·4xx·5xx는 해당 명령에 대한 결과를 뜻합니다. DATA 수락은 다음 서버·사서함 전달이나 사용자의 열람까지 보장하지 않습니다. queue ID와 메시지 추적, 반송·격리 결과를 확인합니다.

## Received 한 줄의 구성

| 요소 | 확인할 내용 | 제한 |
| --- | --- | --- |
| from 이름 | 송신 측 주장·해석된 이름 | EHLO 자체는 자기 주장 |
| 연결 IP | 수신 서버가 관측한 상대 | 중계·게이트웨이일 수 있음 |
| by 이름 | 이 헤더를 작성한 수신 서버 | 신뢰·관리 범위 확인 |
| with | SMTP·TLS·인증 등의 표기 | 제품별 형식과 실제 감사 확인 |
| id | queue·추적 연결 후보 | 범위·서버별 의미 확인 |
| 날짜·시간대 | 해당 서버의 처리 시각 | 원문 Date와 별개, 시계 오차 |

“Received는 아래에서 위로 읽는다”는 시간 경로를 읽는 방법이지 모든 줄을 신뢰하라는 뜻은 아닙니다. 신뢰는 관리되는 위쪽 서버에서 아래 경계로 확인합니다. 공격자가 외부 제출 전에 가짜 줄을 넣을 수 있습니다.

## 교육용 메시지의 신뢰 경계

이 사례의 관리 서버는 mailbox.study.example과 gateway.study.example이며 인증 결과 식별자는 mx.study.example입니다. gateway가 받은 peer 192.0.2.44와 queue Q100은 신뢰된 운영 기록으로 대조할 대상입니다. 그 아래 ceo-laptop.study.example에서 왔다고 주장하는 줄과 mail.study.example의 dmarc=pass는 외부 입력으로 취급합니다. 이름이 내부처럼 보여도 스스로 신뢰를 얻지 않습니다.

Authentication-Results의 위치·authserv-id만 보고 안전하다고 판단하지 않습니다. 조직의 수신 경로, 헤더 제거·보존 정책과 신뢰된 인증 결과를 확인합니다. 내부를 사칭한 결과가 남는지도 운영 점검 대상입니다.

## MIME와 첨부의 층

메시지 본문은 multipart boundary로 여러 부분을 담을 수 있습니다. 각 부분의 Content-Type·Content-Disposition·Content-Transfer-Encoding을 읽고 실제 첨부를 확인합니다. 파일 이름과 MIME 선언만으로 형식·안전성을 정하지 않습니다. Base64 첨부는 디코딩하되 실행하지 않고 해시·바이트 형식을 조사합니다.

## 학습 활동

EML에서 세 Received 줄과 두 Authentication-Results를 추출합니다. 관리 경계 안에서 확인할 수 있는 연결 사실과 외부가 주장한 정보를 다른 열에 둡니다. Header Date·Received 시각을 UTC로 비교하고, 가장 아래 줄이 최초 작성자를 증명하지 못하는 이유를 씁니다.

## 공개 참고자료

- [RFC 5321 — SMTP](https://www.rfc-editor.org/rfc/rfc5321.html)
- [RFC 5322 — Internet Message Format](https://www.rfc-editor.org/rfc/rfc5322.html)
- [RFC 8601 — 인증 결과 신뢰](https://www.rfc-editor.org/rfc/rfc8601.html)
- [RFC 2045 — MIME](https://www.rfc-editor.org/rfc/rfc2045.html)
