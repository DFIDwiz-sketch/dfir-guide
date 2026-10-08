---
title: "실습 2.3: SMTP와 이메일 분석"
description: "가상 메일의 신뢰 경계·발신·인증 평가를 읽고 로그인·규칙·미확인 관계를 기록합니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["2일차", "자체 실습", "블루팀 필수지식"]
order: "312"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "12"
chapter_title: "EXERCISE 2.3: SMTP and Email Analysis"
textbook_page: "179"
lesson_type: "자체 실습"
---

## 실습 목표와 자료

[비작동 메일 .eml](downloads/network-day2-mail.eml), [가상 기록 JSONL](downloads/network-day2-events.jsonl), [조사 양식](downloads/network-investigation-template.md)을 사용합니다.

메일은 실제 발송되지 않았고 검증 가능한 DKIM 서명이 없습니다. Authentication-Results의 pass는 가상 게이트웨이 평가 기록이며 직접 서명 검증 결과가 아닙니다. 원본 교재 메일과 실습 패킷을 재현한 자료가 아닙니다.

## 1단계 — 메시지 식별과 발신 읽기

Message-ID는 lab-05@vendor.example, From·Return-Path·Reply-To는 billing@vendor.example입니다. To, Date, Subject와 함께 표로 정리합니다. 같은 발신 문자열이 있다고 개인 신원과 콘텐츠가 안전하다고 판단하지 않습니다.

## 2단계 — 신뢰 경계 표시하기

상단 Received에서 lab-gateway.example이 기록한 전달 정보를 읽습니다. Authentication-Results의 authserv-id도 lab-gateway.example인 항목을 구분합니다.

아래에 있는 untrusted-external.example의 평가와 claimed-origin.example의 추적 줄은 신뢰 범위 밖입니다. 203.0.113.99를 최초 발신자로 확정하지 않습니다. 실제 조사라면 조직의 게이트웨이 구성·메일 추적으로 신뢰 범위를 확인해야 합니다.

## 3단계 — 인증 평가 해석하기

가상 게이트웨이는 SPF·DKIM·DMARC를 pass로 기록했습니다. SPF의 smtp.mailfrom, DKIM의 header.d, DMARC의 header.from을 구분합니다. DMARC는 정렬된 SPF 또는 DKIM 성공 조건을 사용하며 둘 모두를 필수로 요구하지 않습니다.

이 파일에는 DNS·공개키·실제 서명이 없어 검증을 재수행할 수 없습니다. 기록된 평가와 직접 검증한 사실을 분리합니다.

## 4단계 — 후속 신원·메일 자료 연결하기

| 기록 | 확인한 것 | 추가 질문 |
| --- | --- | --- |
| N005 | 계정의 메일 수신과 평가 | 업무 요청·메일 원본·추적 |
| N009 | device-code 로그인 성공 | 실제 앱·세션·사용자 승인 |
| N010 | 외부 전달 규칙 생성 | 승인·생성 세션·전달된 자료 |

같은 계정·근접 시각은 관련 조사 후보입니다. 메일이 로그인 원인이었거나 토큰이 탈취됐다는 결론은 아직 없습니다. 전달 규칙이 실제 어떤 메시지를 보냈는지도 별도 서비스 감사가 필요합니다.

## 5단계 — 인계문 쓰기

“원본 헤더의 신뢰 경계와 인증 평가를 확인했으며, 로그인·규칙의 업무 승인과 관계는 미확인”이라고 기록합니다. 사용자 확인, 세션·앱 감사, 규칙·메일 접근 범위를 담당에게 요청합니다.

**완료 기준:** 원본 식별표, 신뢰 경계 표시, 인증 평가표, 후속 자료·정상 설명·미확인 항목을 연결합니다.

**막힐 때:** 화면 캡처 대신 .eml 원문 → 헤더 줄 접힘 → 신뢰 시스템 → 서비스 ID·시각 → 감사 보존·권한 순서로 확인합니다.

## 최신 보강과 실무 연결

현재 DMARC·ARC·토큰 피싱·BEC 조사와 조치는 [메일 조사](email-investigation.html), [클라우드 계정·토큰 대응](cloud-identity-response.html)으로 연결합니다. 비밀번호 변경·규칙 삭제만으로 모든 세션·앱 권한이 해소됐다고 가정하지 않습니다.

## 공개 참고자료

- [RFC 5321 — SMTP](https://www.rfc-editor.org/rfc/rfc5321)
- [RFC 8601 — 인증 결과 헤더](https://www.rfc-editor.org/rfc/rfc8601)
- [RFC 9989 — DMARC](https://www.rfc-editor.org/rfc/rfc9989)
