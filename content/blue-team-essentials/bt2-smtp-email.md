---
title: "SMTP와 이메일 이해"
description: "메일 제출·전달·수신, SMTP 명령·봉투/헤더·Received와 SPF·DKIM·DMARC를 이해합니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["2일차", "개념", "블루팀 필수지식"]
order: "309"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "9"
chapter_title: "Understanding SMTP and Email"
textbook_page: "139"
lesson_type: "개념"
---

## 이메일의 세 구간

| 구간 | 역할 | 일반적 자료 |
| --- | --- | --- |
| Submission · 제출 | 사용자가 보낼 메일을 서비스에 제출 | 클라이언트·제출 서버·웹메일 감사 |
| Relay · 전달 | 서버 사이에서 목적지로 전송 | MTA·게이트웨이·메일 추적 |
| Delivery / Access · 배달·접근 | 사서함에 배달하고 사용자가 읽음 | 배달·메일 접근·서비스 감사 |

MUA는 사용자의 메일 클라이언트, MTA는 전달 서버, MDA는 사서함 배달 기능을 설명하는 용어입니다. 실제 제품은 여러 역할을 결합할 수 있습니다. 수신 조직의 MX 조회는 메일 전달 목적지를 찾는 데 사용됩니다.

SMTP 서버 간 전송은 보통 25, 제출은 587 또는 암시적 TLS의 465가 사용됩니다. 메일 읽기는 IMAP·POP3·웹메일 등 다른 방식일 수 있습니다. 포트와 암호화·접속 정책은 실제 환경을 확인합니다.

## SMTP 대화의 의미

EHLO로 서버 기능과 인사를 교환하고 MAIL FROM으로 봉투 발신, RCPT TO로 봉투 수신자를 지정합니다. DATA 구간에는 메일 헤더와 본문이 들어갑니다. 각 서버 응답 코드는 다음 동작의 허용·오류 상태를 설명합니다.

가상 예에서 MAIL FROM은 bounce@sender.example, 헤더 From은 notice@brand.example일 수 있습니다. 이 두 도메인이 다르다는 사실만으로 문법 오류는 아니며 발신 인증·정렬·업무 맥락을 따로 평가합니다.

250 등 수락 응답은 그 단계의 처리를 설명합니다. 최종 사용자 열람·안전한 배달·후속 행동 성공을 모두 증명하지 않습니다. STARTTLS 이후에는 수동 센서에서 헤더·본문이 가려질 수 있습니다.

## 봉투와 헤더 구분하기

| 항목 | 설명 |
| --- | --- |
| MAIL FROM / Return-Path | 봉투 발신·반송 경로와 관련 |
| RCPT TO | 실제 SMTP 전달 수신 대상 |
| From / To | 메시지에 표시되는 작성자·수신자 |
| Reply-To | 회신 대상으로 지정한 값 |
| Received | 각 전달 서버가 추가한 추적 정보 |
| Message-ID | 메시지 식별에 쓰는 값, 서비스 ID와 함께 확인 |

숨은 수신자나 전달 때문에 헤더 To와 실제 RCPT TO가 다를 수 있습니다. Message-ID 자체도 원본 서비스의 고유 추적 ID와 구분합니다.

## Received와 신뢰 경계

새 Received가 상단에 추가됩니다. 신뢰하는 수신 게이트웨이가 기록한 상단 구간을 확인한 뒤 신뢰 경계를 정하고 시간순서 후보를 아래에서 위로 읽습니다. 외부에서 주입된 아래쪽 줄을 무조건 최초 발신 IP로 믿지 않습니다.

Authentication-Results도 누가 생성했는지 확인합니다. 헤더에 pass 문자열이 있다고 검증 성공을 직접 입증한 것은 아닙니다.

## SPF·DKIM·DMARC

| 방식 | 검토하는 것 | 한계 |
| --- | --- | --- |
| SPF | 연결 IP와 봉투 발신 도메인의 허용 | 표시 From·내용 전체 보증 아님 |
| DKIM | 서명 도메인과 지정된 헤더·본문 검증 | 서명 존재와 검증 성공은 다름 |
| DMARC | From 도메인과 정렬된 SPF 또는 DKIM 성공 | 안전한 내용·미침해 계정 보증 아님 |

SPF의 fail·softfail·neutral·none·오류 상태는 의미가 다릅니다. 한 실패를 곧바로 모든 스팸·피싱과 동일 분류하지 않습니다. 전달·변경·메일링리스트가 정상 인증 실패를 만들 수도 있습니다.

**작은 활동:** 원본 .eml에서 From·Return-Path·Received·Authentication-Results를 별도 표에 옮깁니다.

**완료 기준:** 제출·전달·접근, 봉투·표시 발신, 인증·콘텐츠 안전을 구분합니다.

## 최신 보강과 실무 연결

2026년 DMARC RFC 9989와 ARC·SaaS 감사는 [메일 조사](email-investigation.html)에서 추가 확인합니다. 토큰 피싱·BEC는 도메인 인증 통과 후에도 신원·규칙·업무 요청을 조사할 이유입니다.

## 공개 참고자료

- [RFC 5321 — SMTP](https://www.rfc-editor.org/rfc/rfc5321)
- [RFC 5322 — 메시지 형식](https://www.rfc-editor.org/rfc/rfc5322)
- [RFC 6409 — 메일 제출](https://www.rfc-editor.org/rfc/rfc6409)
- [Microsoft — 메일 인증](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-about)
