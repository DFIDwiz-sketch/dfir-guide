---
title: "HTTP 분석 상세 1 · URL·User-Agent·반복 통신"
description: "URL 평판과 헤더 단서를 실제 거래·정상 앱·관측 맥락에 연결해 후보를 좁힙니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "분할 학습", "블루팀 필수지식"]
order: "307.01"
level: "입문 · 상세 해설"
course_day: "2"
course_order: "7"
chapter_title: "HTTP(S) Analysis and Attacks"
textbook_page: "108"
lesson_type: "분할 학습"
chapter_parent: "bt2-http-attacks"
part_order: "1"
textbook_range: "108–116"
---

## 도메인 평판과 URL 평판

잘 알려진 클라우드 서비스에도 개별 사용자 파일, 탈취된 계정과 악성 경로가 있을 수 있습니다. 도메인 전체의 평판이 좋다고 개별 URL·객체가 안전하다고 보지 않습니다. 반대로 공유 서비스에서 악성 URL 한 건을 보았다고 전체 도메인에 같은 판정을 적용하지 않습니다.

원문 URL, scheme·host·port·path·query, 사건 시각, 요청 주체와 응답을 보존합니다. 외부 조회는 제공할 값과 필요 정보를 정한 뒤 사용합니다. URL의 세션 토큰·내부 문서 키·개인 정보는 평판 조회를 통해 유출될 수 있어 조직의 공유 기준을 확인합니다.

## 자동 분석을 어떻게 해석할 것인가

화면 캡처는 사칭 화면을 이해하는 데 도움이 되지만 명령 제어 서버의 빈 페이지는 별 의미가 없을 수 있습니다. 샌드박스는 자신이 수행한 입력·환경·시간에서 관측한 동작입니다. 실제 피해자의 조건과 다르거나 회피·로그인·시간 조건으로 재현되지 않을 수 있습니다. 아무 일도 관측되지 않은 결과를 무조건 정상으로 보지 않습니다.

분석 자료에서는 “서비스에서 분류했다”, “샌드박스에서 관측했다”, “우리 자산에서 관측했다”를 출처와 함께 구분합니다. 사람이 수동 분석했다고 언제나 더 정확하다는 전제도 두지 않습니다. 도구와 분석자의 판단 모두 근거·범위·재현 조건을 갖춰야 합니다.

## User-Agent와 Referer

User-Agent는 환경에서 드문 프로그램·오래된 버전·일관되지 않은 표시를 찾는 데 도움이 됩니다. 그러나 클라이언트가 제시하는 값이므로 위조할 수 있고 정상 앱도 브라우저처럼 표시합니다. 업데이트 정책·자동화 앱 목록과 비교해 후보로 사용합니다.

Referer가 없으면 직접 방문, 앱 요청, 브라우저 정책이나 개인정보 보호 동작일 수 있습니다. 쿠키가 없다는 사실도 비로그인 요청·처음 방문·정상 API 등으로 설명될 수 있습니다. 헤더 하나의 누락은 독립적인 공격 증명이 아닙니다.

## 반복성에서 정상 기준선까지

| 후보 관측 | 정상 대안 | 확인할 다음 자료 |
| --- | --- | --- |
| 같은 간격의 GET | 상태 점검·업데이트 | 앱·업무 승인·작업 주기 |
| 일정한 POST | 텔레메트리·API | 본문 의미·수신 서비스 |
| 드문 User-Agent | 관리 스크립트 | 실행 주체·담당자 |
| 외부 새 경로 | 신규 업무 기능 | 변경 기록·서비스 계약 |
| 야간 지속 연결 | 백업·배치 | 작업 스케줄·자료 종류 |

N16~N18은 health.study.example에 60초 간격으로 GET /ready를 보냅니다. context=approved_monitor가 있어 정상 대조 사례로 쓰입니다. 세 건의 정확한 간격은 주기성의 관측이며 모든 장기 동작을 대표하지 않습니다. 실무에서는 후보 기간을 넓히고 승인 정보의 근거를 확인합니다.

## Splunk로 시간표 만들기

~~~spl
index=YOUR_LAB_INDEX dataset="bt2-case-v2" record_type="http"
| table id timestamp src_ip host method uri status request_body_bytes response_body_bytes context
| sort timestamp
~~~

이 자료의 HTTP 거래는 6건입니다. 서버 응답 본문 크기를 업로드량으로 해석하지 않습니다. request_body_bytes는 본문 길이이며 TCP·TLS 헤더 등 전체 네트워크 바이트량이 아닙니다.

## 학습 활동

N15와 N16~N18 각각에 의심 단서·정상 가능성·미확인·추가 자료를 작성합니다. N15의 본문은 제공되지 않아 실제 내용을 알 수 없습니다. N16~N18의 정상 맥락이 있더라도 그 모니터 전체가 항상 안전하다는 포괄 판정으로 넓히지는 않습니다.

## 공개 참고자료

- [MITRE ATT&CK — Web Protocols](https://attack.mitre.org/techniques/T1071/001/)
- [MDN — User-Agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent)
- [MDN — Referer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referer)
