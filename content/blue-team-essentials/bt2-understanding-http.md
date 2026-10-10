---
title: "HTTP 이해"
description: "URI·메서드·상태·헤더·본문을 거래별로 읽고 HTTP/2·3와 암호화에 따른 관측 차이를 이해합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "개념", "블루팀 필수지식"]
order: "306"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "6"
chapter_title: "Understanding HTTP"
textbook_page: "88"
lesson_type: "개념"
---

## HTTP 거래를 요청과 응답으로 읽기

웹 서버는 정적 파일뿐 아니라 API·인증·업무 처리 결과도 제공합니다. URI의 경로가 항상 서버 디스크의 실제 폴더라는 뜻은 아닙니다. 라우팅과 프레임워크가 논리적인 자원으로 처리할 수 있습니다. 분석자는 서버 구현을 추측하기보다 요청한 자원, 보낸 데이터와 응답 결과를 확인합니다.

교재의 URI, 메서드, 요청·응답 헤더, 상태 코드, 압축, HTTP/2·3을 두 상세 글로 연결합니다. 먼저 HTTP/1.1 텍스트 예를 읽고 현재의 프레임·스트림·암호화 조건을 추가합니다.

## URL을 분해하기

~~~text
https://portal.study.example:8443/invoices/2026?view=summary#detail
~~~

scheme은 https, host는 portal.study.example, port는 8443, path는 /invoices/2026, query는 view=summary, fragment는 detail입니다. fragment는 일반적인 HTTP 요청 대상으로 서버에 전송되지 않습니다. 호스트 이름은 여러 주소로 해석될 수 있고 한 IP가 여러 웹서비스를 제공할 수 있습니다.

## 메서드와 상태는 각각의 거래에 적용된다

| 항목 | 의미 | 분석에서의 주의 |
| --- | --- | --- |
| GET | 자원 표현 조회 | 조회만으로 사용자 의도·실행 확정 불가 |
| POST | 자원별 의미에 따른 처리 | 로그인·업로드·API 등 정상 용도 |
| HEAD | GET에 대응하는 헤더 조회 | 일반적으로 본문을 보내지 않음 |
| PUT / DELETE | 대체·삭제 등의 요청 의미 | 서버 권한·실제 처리 결과 확인 |
| 2xx | 요청의 성공 계열 응답 | 업무 완료·침해 성공과 구별 |
| 3xx | 이동·캐시 등 추가 처리 | 다음 거래를 실제로 확인 |
| 4xx / 5xx | 요청·서버 오류 계열 | 악성 요청이라는 뜻은 아님 |

특히 202 Accepted는 처리를 받아들였지만 완료되지 않았을 수 있다는 뜻입니다. N15의 POST·202만으로 유출 성공을 확정할 수 없습니다. 어떤 데이터를 보냈고 서버가 무엇을 했는지 추가 확인합니다.

## 헤더를 신뢰 수준과 함께 읽기

Host는 요청 대상 이름, User-Agent는 클라이언트가 제시한 식별, Referer는 제공될 수 있는 이전 페이지 정보입니다. 누락되거나 제한될 수 있고 위조 가능한 필드도 있습니다. X-Forwarded-For 등은 신뢰된 프록시가 어떤 방식으로 추가·검증하는지 확인해야 실제 출발지 판단에 사용할 수 있습니다.

응답 Content-Type은 서버가 선언한 형식이고 Content-Encoding은 gzip 등 콘텐츠 코딩을 나타냅니다. Content-Length를 곧 디코딩 후 파일 크기로 간주하지 않습니다. 본문·압축·전송 처리와 실제 파일 형식을 함께 확인합니다.

## 현대 HTTP와 관측 제한

HTTP/2는 한 연결의 여러 스트림과 바이너리 프레임을 사용하고 HTTP/3는 QUIC 위에서 같은 HTTP 의미를 전달합니다. UDP/443이라고 일반 DNS나 평문 웹으로 분류하지 않습니다. 도구가 해석할 수 있는 버전·복호화 자료와 수집 범위를 확인해야 URL·헤더·본문을 볼 수 있습니다.

## 학습 활동

[자체 HTTP 텍스트](downloads/blue-team-day2-http.txt)에서 T1·T2·T3의 요청과 응답을 연결합니다. 해당 파일은 승인된 TLS 종료 뒤의 내용을 표현한 교육용 텍스트이며 PCAP가 아닙니다. N05·N07·N15와 비교해 관측 가능한 사실을 적습니다.

## 공개 참고자료

- [RFC 3986 — URI](https://www.rfc-editor.org/rfc/rfc3986.html)
- [RFC 9110 — HTTP 의미](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)
