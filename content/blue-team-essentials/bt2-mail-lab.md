---
title: "실습 2.3: SMTP와 이메일 분석"
description: "가상 EML의 신뢰 경계·From 정렬·MIME 첨부를 분석하고 같은 객체의 해시와 사건 흐름을 검증합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "자체 실습", "블루팀 필수지식"]
order: "312"
level: "입문 · 교재 중심"
course_day: "2"
course_order: "12"
chapter_title: "EXERCISE 2.3: SMTP and Email Analysis"
textbook_page: "179"
lesson_type: "자체 실습"
---

## 실습 목표와 제공 자료

EXERCISE 2.3 SMTP and Email Analysis에 대응하는 자체 실습입니다. 가상 메일의 전달·신뢰·인증 정렬과 MIME 첨부를 원문 중심으로 분석합니다. 외부 전송·실제 도메인 조회·첨부 실행은 필요하지 않습니다.

- [교육용 EML](downloads/blue-team-day2-mail.eml)
- [사례 JSONL](downloads/blue-team-day2-case.jsonl)
- [조사 워크북](downloads/blue-team-day2-workbook.md)

EML의 인증 결과는 분석을 위해 공급된 가상 값입니다. 실제 DKIM 서명은 제공되지 않으므로 암호 검증 성공을 주장하지 않습니다. 첨부는 무해한 텍스트이며 HTTP 응답 N07과 같은 바이트를 사용합니다.

## 활동 1 · 헤더의 출처

관리 경계는 mailbox.study.example·gateway.study.example, 신뢰된 인증 결과 식별자는 mx.study.example입니다. 세 Received를 읽되 관리 수신 서버부터 신뢰를 검토합니다. gateway 아래 ceo-laptop에서 시작했다는 줄과 외부의 dmarc=pass는 주장으로 분리합니다.

queue Q100, Message-ID와 peer 192.0.2.44를 N02와 비교합니다. peer는 경계에 연결한 중계 상대이며 최초 작성자를 증명하지 않습니다. Date는 작성자가 제시한 메시지 시각, Received는 각 서버의 처리 시각입니다.

## 활동 2 · 인증 정렬 표

| 항목 | 값 | 해석 |
| --- | --- | --- |
| Header From | billing@study.example | Author Domain=study.example |
| MAIL FROM / Return-Path | bounce@relay.notice.example | SPF 도메인=relay.notice.example |
| 신뢰된 SPF | pass | 그 도메인의 정책 검증 결과 |
| 신뢰된 DKIM | pass, relay.notice.example | 공급된 서명 도메인 결과 |
| 정렬 | 불일치 | Author Domain과 다름 |
| 신뢰된 DMARC | fail | pass 두 개로 뒤집지 않음 |
| 처리 | delivered_with_warning | fail이 곧 차단은 아님 |

Reply-To는 help@notice.example입니다. 정상 반송·답장 서비스도 주소가 다를 수 있으므로 업무 맥락을 확인하지만, 사칭 후보의 추가 단서로 기록할 수 있습니다. 표시 이름을 조직 신원으로 믿지 않습니다.

## 활동 3 · MIME 첨부를 실행 없이 읽기

EML의 multipart boundary, text/plain 부분, attachment 선언과 base64를 확인합니다. 첨부 이름·MIME·해시·바이트 수를 기록합니다. 아래 코드는 첨부를 디코딩해 크기와 해시만 비교하며 파일을 실행하거나 외부 연결하지 않습니다.

~~~python
import json, hashlib
from pathlib import Path
from email import policy
from email.parser import BytesParser
mail = BytesParser(policy=policy.default).parsebytes(Path("blue-team-day2-mail.eml").read_bytes())
rows = [json.loads(x) for x in Path("blue-team-day2-case.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
download = next(r for r in rows if r["id"] == "N07")
print("Received:", len(mail.get_all("Received", [])))
print("Authentication-Results:", len(mail.get_all("Authentication-Results", [])))
for item in mail.iter_attachments():
    data = item.get_payload(decode=True)
    digest = hashlib.sha256(data).hexdigest()
    print(item.get_filename(), len(data), digest == download["file_sha256"])
~~~

기대 출력은 Received: 3, Authentication-Results: 2, training-note.txt 36 True입니다. 같은 해시는 동일한 바이트 객체의 단서입니다. 메일에서 웹으로 실제 전달되었다거나 사용자가 첨부를 실행했다는 인과관계는 이 결과만으로 확인되지 않습니다.

## 활동 4 · 전체 사건으로 연결하기

메일→DNS→웹의 가까운 시각은 관련 후보를 제공합니다. 메일 링크와 N05의 경로가 같지만 사용자 클릭은 제공 자료에 없습니다. 리졸버의 사전 조회, 검사 서비스와 다른 정상 활동 가능성을 검토합니다. 필요 시 클릭 감사·프록시 계정·브라우저·계정 로그를 요청합니다.

워크북에 관측·해석·미확인을 분리하고 N23의 단말 Hunt 결과 대기 상태를 남깁니다. 마지막 사건 요약에는 “신뢰된 인증 결과는 From 정렬 실패이며 경고 전달되었다. 후속 웹 거래와 DNS 후보가 관측되었으나 실행·유출·최초 작성자는 미확인”처럼 증거 범위를 적습니다.
