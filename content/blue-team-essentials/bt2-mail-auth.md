---
title: "메일 이해 상세 2 · SPF·DKIM·DMARC 정렬과 최신 개정"
description: "각 인증이 검증하는 대상을 구별하고 From 정렬·정책·보고의 한계를 해석합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "분할 학습", "블루팀 필수지식"]
order: "309.02"
level: "입문 · 상세 해설"
course_day: "2"
course_order: "9"
chapter_title: "Understanding SMTP and Email"
textbook_page: "152"
lesson_type: "분할 학습"
chapter_parent: "bt2-smtp-email"
part_order: "2"
textbook_range: "152–160"
---

## “인증 통과”가 무엇을 통과했는지 묻기

SPF, DKIM, DMARC는 서로 다른 질문에 답합니다. SPF pass는 표시 From의 개인을 확인한 결과가 아니고 DKIM pass도 본문이 선의라는 판정은 아닙니다. 결과 이름과 검증 대상 도메인을 같이 읽어야 의미가 있습니다.

| 방식 | 주된 검증 대상 | 필요한 필드 |
| --- | --- | --- |
| SPF | 연결 IP와 MAIL FROM·HELO 도메인 정책 | peer IP·smtp.mailfrom 등 |
| DKIM | 서명 도메인·선택된 헤더와 본문 | 검증 결과·header.d·selector |
| DMARC | Author Domain과 통과한 SPF/DKIM의 정렬 | header.from·정렬 모드·정책 |

## SPF의 범위와 전달 문제

SPF 정책은 DNS에서 조회한 메커니즘·수식어를 평가합니다. pass, fail, softfail, neutral, none, temperror, permerror는 같은 의미가 아닙니다. 평가 오류를 악성 판정 또는 통과로 바꾸지 않습니다. Envelope 주소가 따로 있다는 점이 중요합니다.

메일 전달 서비스에서 연결 IP가 바뀌면 원 발신 도메인의 SPF가 실패할 수 있습니다. 반대로 공격자가 자신의 도메인으로 SPF를 올바르게 구성한 뒤 다른 Header From을 표시할 수도 있습니다. SPF가 본문 변조를 검증하거나 모든 사칭을 막는 것은 아닙니다.

## DKIM의 범위

검증자는 서명 도메인 d=와 selector를 이용해 공개키를 조회하고 서명·정규화 규칙에 따라 검증합니다. 서명 대상에 포함된 헤더와 본문 범위를 확인해야 합니다. 표시 이름이나 서명에 포함되지 않은 필드를 별도의 신원 보증으로 취급하지 않습니다.

중간 서비스가 본문·제목 등을 변경하면 검증 결과에 영향이 생길 수 있습니다. 정상 DKIM pass라도 탈취된 계정·악성 링크·유사 도메인 사용을 막지 않습니다. 학습 EML에는 실제 DKIM-Signature가 없고 공급된 결과만 있어 암호 검증을 수행한 것으로 보고하지 않습니다.

## DMARC의 정렬

Header From의 도메인인 Author Domain과 정렬된 SPF 또는 DKIM 중 하나 이상이 통과하면 DMARC 통과 조건을 충족할 수 있습니다. strict 정렬은 같은 도메인, relaxed는 규정된 조직 도메인 관계를 사용합니다. 전체 이메일 주소의 local part까지 일치시키는 규칙이 아닙니다.

N02에서 Author Domain은 study.example, SPF·DKIM 도메인은 relay.notice.example입니다. 서로 다른 조직 도메인으로 가정된 교육용 자료이므로 정렬되지 않습니다. SPF·DKIM pass 두 개가 있어도 제공된 DMARC 결과는 fail입니다. 단순히 pass 단어의 개수로 판단하지 않습니다.

## 2026년 표준 변경과 구현 확인

2026년 5월 RFC 9989는 기존 RFC 7489·9091을 대체했습니다. 조직 도메인·정책 탐색에는 DNS Tree Walk가 정의되었고 pct 태그가 제거되어 t 태그가 도입되었습니다. 보고는 RFC 9990의 집계 보고와 RFC 9991의 실패 보고로 분리되었습니다.

발행일이 곧 모든 서비스의 적용일은 아닙니다. 기존 구현·레코드와 새 표준 지원을 제품 문서·변경 기록에서 확인합니다. 오래된 Public Suffix List 기반 설명 또는 pct 예를 현재의 유일한 동작으로 제시하지 않습니다. 실제 정책 변경은 정상 발송 경로·전달·목록 서비스 영향을 검토하며 진행합니다.

## 정책과 안전성은 다른 판단

p=none은 모니터링 목적이며 그 값만으로 사칭 메일을 차단하지 않습니다. quarantine·reject도 도메인 소유자가 요청한 처리 정책이고 최종 수신 처리는 수신 서비스 정책을 확인해야 합니다. 결과·정책·실제 격리/전달을 따로 기록합니다. 보고 자료에는 메일 주소·IP 등이 포함될 수 있어 수신·보관·공유 범위를 정합니다.

DMARC는 정확한 도메인 사용의 검증에 도움이 되지만 표시 이름 사칭·유사 도메인·정상 계정 오용과 콘텐츠 악성을 모두 해결하지 않습니다. 링크·첨부·계정 활동과 사용자 요청을 별도로 확인합니다.

## 학습 활동

N02에 대해 SPF 도메인, DKIM 도메인, Author Domain, 정렬, 결과, 실제 전달 상태를 여섯 열로 기록합니다. action=delivered_with_warning이므로 DMARC fail을 “서버가 자동 차단했다”로 바꾸지 않습니다. EML의 외부 pass 주장과 신뢰된 fail 결과를 구별합니다.

## 공개 참고자료

- [RFC 7208 — SPF](https://www.rfc-editor.org/rfc/rfc7208.html)
- [RFC 6376 — DKIM](https://www.rfc-editor.org/rfc/rfc6376.html)
- [RFC 9989 — DMARC](https://www.rfc-editor.org/rfc/rfc9989.html)
- [RFC 9990 — Aggregate Reporting](https://www.rfc-editor.org/rfc/rfc9990.html)
- [RFC 9991 — Failure Reporting](https://www.rfc-editor.org/rfc/rfc9991.html)
