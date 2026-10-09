---
title: "위협 이해 상세 · 역사 사례와 방어 우선순위"
description: "Mirai·Colonial Pipeline·Conti·SolarWinds를 현재의 관측·통제·대응 질문으로 비교합니다."
category: "blue-team-essentials"
updated: "2026-10-09"
tags: ["1일차", "분할 학습", "블루팀 필수지식"]
order: "212.01"
level: "입문 · 상세 해설"
course_day: "1"
course_order: "12"
chapter_title: "Know Your Enemy"
textbook_page: "161"
lesson_type: "분할 학습"
chapter_parent: "bt1-know-enemy"
part_order: "1"
textbook_range: "161–167"
---

## 역사 사례를 현재의 도구 구매 목록으로 바꾸지 않기

교재의 사례는 당시 피해를 그대로 재현하거나 공격 절차를 따라 하려는 자료가 아닙니다. 어떤 접근 경로·기능·업무 의존성 때문에 피해가 커졌는지 보고, 우리 환경의 관측과 대응 질문으로 바꿔야 합니다. 사건의 공개 사실과 방어를 위한 추론을 구별합니다.

## Mirai · 관리 경로와 자산 책임

Mirai 사례는 IoT 장치와 약한 기본 인증·노출된 관리 서비스의 위험을 생각하게 합니다. 방어에서는 장치 목록, 소유자, 관리 경로, 인증 변경, 지원 상태를 먼저 확인합니다. 단말 보안 에이전트를 설치할 수 없는 장치도 있을 수 있으므로 네트워크 흐름·접근 제한과 운영 책임이 중요합니다.

“IoT가 있다”보다 “어느 장치의 관리 인터페이스가 어디에 노출되고 누가 바꿀 수 있는가?”가 유용한 질문입니다. 네트워크 관측으로 연결 대상과 비정상 트래픽을 볼 수 있지만 장치 내부 상태를 모두 알 수 있는 것은 아닙니다. 관측 공백과 가능한 통제를 함께 적습니다.

## Colonial Pipeline · 사건 범위와 업무 중단을 구별하기

사건은 2021년 5월입니다. 교재의 연도와 다르면 이 날짜로 수정해 읽습니다. 미 법무부 발표는 2021년 5월 7일경 랜섬웨어 관련 통보와 DarkSide 갈취·몸값 문제를 설명합니다. 공개 사실을 넘어 OT 전체가 암호화됐다고 가정하지 않습니다.

방어에서 얻는 교훈은 기술적 침해 범위와 업무 의사결정의 범위가 다를 수 있다는 점입니다. 안전·서비스 의존성·복구 확신 때문에 업무가 중단될 수도 있습니다. 조직은 계정·원격 접근·망 분리·복구 수단뿐 아니라 누가 중단과 재개를 결정할지도 준비해야 합니다.

## Conti · 정상 기능과 계정의 악용

Cisco Talos의 공개 분석은 유출된 자료를 통해 범죄 조직의 운영 관행을 설명합니다. 이 학습은 유출 지침이나 공격 명령을 재게시하지 않습니다. 방어에서는 계정·관리 도구·권한·원격 실행·데이터 이동을 맥락으로 해석하는 데 초점을 둡니다.

정상 관리 기능 이름만으로 차단 여부를 결정하지 않습니다. 승인된 관리자·작업·대상·시각과 실제 행동을 비교합니다. 파일 이름이나 도구 이름만 찾는 탐지는 이름 변경과 정상 기능 오용을 놓칠 수 있습니다. 프로세스·인증·관리 변경·네트워크 자료를 함께 연결합니다.

## SolarWinds · 신뢰한 경로와 클라우드 계정

2020년 SolarWinds 관련 침해는 신뢰된 소프트웨어 공급 경로의 위험과 침해 후 계정·클라우드 조사의 중요성을 생각하게 합니다. CISA는 해당 공급 경로와 AD·Microsoft 365 관련 조사·복구 자료를 발표했습니다. 설치 여부나 노출 가능성과 실제 침해 확인을 구별해야 합니다.

방어에서는 업데이트·배포·서비스 계정의 권한, 소프트웨어 무결성 검증, 계정·신뢰·관리 설정 변화와 클라우드 감사가 연결됩니다. 악성 파일 제거만으로 모든 지속 접근이 사라졌다고 결론 내리지 않습니다. 실제 환경의 범위에 맞춰 계정·신뢰·세션과 다른 접근 경로를 확인해야 합니다.

## 네 사례의 방어 질문 비교

| 사례 | 관측 질문 | 통제·준비 | 대응의 남은 질문 |
| --- | --- | --- | --- |
| Mirai | 장치가 어디에 연결하고 관리 경로는 어디에 노출되는가? | 자산·소유자·인증·노출 최소화 | 같은 종류의 다른 장치는? |
| Colonial | 계정·IT 영향과 업무 의존성은 무엇인가? | 원격 접근·분리·복구·중단 권한 | 재개 조건과 복구 검증은? |
| Conti | 누가 어떤 관리 기능을 어떤 대상에 사용했는가? | 최소 권한·작업 승인·로그 | 다른 계정·데이터 이동은? |
| SolarWinds | 공급 경로·서비스 계정·신뢰 변경은 무엇인가? | 배포 검증·권한·클라우드 감사 | 다른 지속 접근·신뢰 영향은? |

표는 사례에서 도출한 학습용 방어 질문입니다. 실제 사건의 모든 세부 사실이나 특정 제품의 완전한 방어를 뜻하지 않습니다.

## 현재 위협 이름을 사용할 때

Microsoft의 기존 이름을 현재 체계와 비교할 때 공식 명명 문서의 설명을 읽습니다. 다른 업체 별칭은 범위가 겹쳐도 동일하다고 단정하지 않습니다. 분석 기록에는 이름의 출처·발행 시점·근거를 남깁니다. 귀속 확신과 우리 조직에서 관측한 행동은 별도의 항목으로 유지합니다.

학습 활동으로 자기 조직과 가장 관련된 사례 하나를 골라 관측 질문 두 개, 예방·준비 하나, 대응 확인 하나를 적으세요. 공통 계정 사례에서는 사용자·세션·메일 감사가 핵심이며, 유명 그룹 이름은 현재 근거가 없습니다.

## 공개 참고자료

- [USENIX — Understanding the Mirai Botnet, 원 연구](https://www.usenix.org/conference/usenixsecurity17/technical-sessions/presentation/antonakakis)
- [미 법무부 — Colonial Pipeline 발표](https://www.justice.gov/archives/opa/pr/department-justice-seizes-23-million-cryptocurrency-paid-ransomware-extortionists-darkside)
- [Cisco Talos — Conti 공개 분석](https://blog.talosintelligence.com/conti-leak-translation/)
- [CISA — SolarWinds 관련 권고](https://www.cisa.gov/news-events/cybersecurity-advisories/aa20-352a)
- [CISA — SolarWinds·AD·M365 복구](https://www.cisa.gov/news-events/news/remediating-networks-affected-solarwinds-and-active-directorym365-compromise)
- [Microsoft — 현재 명명 체계](https://learn.microsoft.com/en-us/defender-xdr/microsoft-threat-actor-naming)
