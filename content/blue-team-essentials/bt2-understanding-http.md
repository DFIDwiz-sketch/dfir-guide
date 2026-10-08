---
title: "HTTP 이해"
description: "URI·메서드·요청/응답 헤더·상태 코드·쿠키와 HTTP/2·HTTP/3의 기본."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["2일차", "개념", "블루팀 필수지식"]
order: "306"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "6"
chapter_title: "Understanding HTTP"
textbook_page: "88"
lesson_type: "개념"
---

## 웹 서버와 요청·응답

웹 서버는 요청을 받아 정적 자료를 반환하거나 애플리케이션 처리를 수행합니다. 사용자가 보는 페이지 하나를 위해 HTML·스크립트·이미지·API 요청 등 여러 통신이 발생할 수 있습니다.

HTTP의 의미와 TCP·TLS·QUIC 같은 전송·보안 계층을 나눠 이해합니다. HTTPS는 암호화된 연결 위의 HTTP이며 관측 지점에 따라 요청 본문을 읽지 못할 수 있습니다.

## URI 구성 읽기

가상 URL은 다음과 같습니다.

~~~text
https://portal.study.example:8443/docs/start?lang=ko#intro
~~~

| 부분 | 값 | 의미 |
| --- | --- | --- |
| scheme | https | 연결 방식 |
| host | portal.study.example | 대상 이름 |
| port | 8443 | 명시된 포트 |
| path | /docs/start | 요청 경로 |
| query | lang=ko | 파라미터 |
| fragment | intro | 클라이언트 측 자원 부분 식별 |

일반 브라우저 HTTP 요청 target에는 fragment가 전달되지 않습니다. query는 로그에 남거나 토큰을 포함할 수 있어 보존·공유 범위를 구분합니다.

## 메서드의 의미

GET은 표현 가져오기, HEAD는 GET과 같은 의미의 헤더 확인, POST는 지정된 처리를 위한 데이터 전달, PUT은 대상 자원의 표현 대체, DELETE는 대상 제거 요청, OPTIONS는 지원 기능 확인, CONNECT는 터널 연결에 사용됩니다.

메서드는 의도된 의미입니다. GET 요청이라도 잘못 설계된 앱에서 상태를 바꿀 수 있고 POST라고 반드시 파일 업로드는 아닙니다. 실제 경로·본문·서버 결과를 확인합니다.

## 헤더와 상태 코드

요청의 Host 또는 대응하는 authority는 이름을, User-Agent는 클라이언트가 제공한 표시를, Cookie·Authorization은 세션·인증 자료를 설명합니다. HTTP/1.1의 응답에서는 Content-Type·Content-Length·Location·Set-Cookie 등을 검토합니다.

| 코드 범주 | 기본 의미 | 주의 |
| --- | --- | --- |
| 1xx | 중간 정보 | 최종 응답과 구분 |
| 2xx | 요청에 대한 성공 상태 | 침해·실행·업무 성공의 증거는 별도 |
| 3xx | 이동·캐시 등 추가 처리 | 실제 후속 요청 확인 |
| 4xx | 요청 측 오류 상태 | 원인이 사용자 또는 공격인지 별도 |
| 5xx | 서버 오류 상태 | 취약점 악용 성공과 동일하지 않음 |

쿠키는 세션·설정 등 여러 용도이고 항상 악성 데이터가 아닙니다. 인증·세션 값은 예제에서 LABONLY처럼 비작동 값만 사용합니다.

## HTTP/2와 HTTP/3

HTTP/2는 이진 프레임·다중 스트림·헤더 압축 등으로 전송을 바꿉니다. 요청·응답 의미는 유지되지만 한 연결에 여러 스트림이 있어 연결 하나를 요청 하나로 계산하지 않습니다.

HTTP/3는 QUIC를 사용합니다. HTTP/2·3의 헤더는 HTTP/1.1의 텍스트 줄과 다른 형태로 표현될 수 있습니다. UDP/443만으로 HTTP/3이라고 확정하지 않습니다.

**작은 활동:** 가상 URL을 나누고 302 응답과 실제 후속 요청이 왜 다른 증거인지 적습니다.

**완료 기준:** 이름·경로·파라미터·메서드·헤더·상태·전송 방식을 구분합니다.

## 최신 보강과 실무 연결

HTTP/3도 2022년 교재에서 다뤄진 주제입니다. 현재는 TLS 1.3·ECH와 센서·프록시 위치의 가시성을 추가 검토합니다. 실제 절차는 [웹 통신 조사](http-investigation.html)를 참고합니다.

## 공개 참고자료

- [RFC 9110 — HTTP 의미](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9113 — HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
