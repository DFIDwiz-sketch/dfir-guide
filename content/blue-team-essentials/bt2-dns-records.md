---
title: "DNS 이해 상세 2 · A/AAAA·PTR·MX·TXT·CNAME·SRV"
description: "레코드별 질문·반환값을 구별하고 별칭·역방향 이름·메일 경로를 과도하게 해석하지 않습니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "분할 학습", "블루팀 필수지식"]
order: "303.02"
level: "입문 · 상세 해설"
course_day: "2"
course_order: "3"
chapter_title: "Understanding DNS"
textbook_page: "37"
lesson_type: "분할 학습"
chapter_parent: "bt2-understanding-dns"
part_order: "2"
textbook_range: "37–48"
---

## 레코드 타입은 이름에 무엇을 묻는지 결정한다

같은 이름에 A를 묻는 것과 MX를 묻는 것은 다른 질문입니다. 응답을 읽을 때 질의 이름과 타입, 응답 코드, answer·authority·additional 영역과 반환값을 확인합니다. 로그의 answers 배열에는 여러 종류의 값이 섞일 수 있어 모든 원소를 IP로 해석하지 않습니다.

| 타입 | 질문 | 분석 예와 제한 |
| --- | --- | --- |
| A | IPv4 주소가 무엇인가 | 여러 주소·기간별 변경 |
| AAAA | IPv6 주소가 무엇인가 | IPv4 조사만으로 누락 가능 |
| PTR | 이 주소에 설정된 역방향 이름은 | 이름 존재가 소유권·안전성 보증 아님 |
| CNAME | 어떤 이름의 별칭인가 | 별칭을 따라 주소를 얻을 수 있음 |
| MX | 수신 메일을 어느 교환 서버에 보내나 | 낮은 preference 값이 우선, 발신 인증 아님 |
| TXT | 어떤 문자열을 게시했나 | SPF·도메인 검증·일반 데이터 |
| SRV | 특정 서비스의 대상·포트·우선순위는 | AD 등의 정상 서비스 발견 |
| NS / SOA | 담당 서버·zone 관리 정보는 | DNS 운영·위임의 맥락 |

## CNAME과 웹 이동을 구별하기

N06은 files.notice.example의 별칭 edge.notice.example과 주소 203.0.113.20을 함께 제시합니다. DNS 이름 관계이며, 브라우저의 표시 URL이 자동으로 edge.notice.example으로 바뀐다는 뜻이 아닙니다. N05의 Location은 HTTP 응답에서 새 URL로 이동하라는 지시입니다.

공유 인프라와 CDN의 별칭은 정상입니다. 한 별칭이 의심 목적지로 연결되면 전체 체인의 사건 당시 값을 보존하되, 같은 주소를 쓰는 다른 조직까지 같은 행위자로 묶지 않습니다. 이름·주소·시각을 분리해 기록하면 범위를 과도하게 넓히는 실수를 줄일 수 있습니다.

## 역방향 조회의 읽기

IPv4 주소의 PTR 조회는 옥텟을 거꾸로 배치한 in-addr.arpa 이름을 사용합니다. 192.0.2.44는 44.2.0.192.in-addr.arpa에 해당합니다. IPv6는 16진수의 각 nibble을 역순으로 배치한 ip6.arpa를 사용합니다. 숫자 주소를 그대로 일반 도메인처럼 조회하는 것과 다릅니다.

PTR은 해당 역방향 zone 운영자가 게시한 값입니다. 정방향 A·AAAA를 다시 확인해 서로 맞는지 볼 수 있지만, 일치하더라도 특정 사람의 소유나 메일의 정상성을 증명하지 않습니다. 조회 시각이 다르면 매핑이 바뀔 수도 있습니다.

## MX·TXT·SRV를 업무에 연결하기

MX는 수신 경로를 찾는 데 사용합니다. SMTP 발신자의 허용 여부는 SPF·DKIM·DMARC 등 별도 검증입니다. N14의 TXT 값 v=spf1 -all은 이 교육용 도메인에서 SPF로 어떤 송신도 허용하지 않는 정책 예이며, 실제 .example에 질의해 검증하지 않습니다.

TXT가 길거나 Base64처럼 보여도 도메인 검증·키·정상 애플리케이션 정보일 수 있습니다. SRV의 _ldap._tcp 같은 이름도 내부 서비스 발견의 정상 맥락을 갖습니다. 문자열 형태 하나로 터널링을 판정하기보다 자산·서비스·질의 빈도와 흐름을 확인합니다.

## 현재 추가할 레코드

SVCB와 HTTPS는 서비스 접속 매개변수 등을 제공하도록 표준화되어 있습니다. HTTPS 레코드가 곧 악성 웹 연결이나 성공 방문을 의미하지 않습니다. 학습에서는 기존 A/AAAA·CNAME과 구별해 “주소 외의 접속 정보도 DNS에 담길 수 있다”는 의미를 이해합니다.

## 학습 활동

N06의 answers와 answer_types를 대응시키고 IP만 따로 기록합니다. N14의 TXT를 유출 증거로 볼 수 없는 이유를 적습니다. PTR·MX·CNAME 각각에서 “확인 가능한 사실”과 “그 자료만으로 알 수 없는 것”을 한 문장씩 작성합니다.

## 공개 참고자료

- [RFC 1035 — Resource Records](https://www.rfc-editor.org/rfc/rfc1035.html)
- [RFC 2782 — SRV](https://www.rfc-editor.org/rfc/rfc2782.html)
- [RFC 3596 — IPv6 DNS](https://www.rfc-editor.org/rfc/rfc3596.html)
- [RFC 9460 — SVCB/HTTPS](https://www.rfc-editor.org/rfc/rfc9460.html)
