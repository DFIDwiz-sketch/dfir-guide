---
title: "Lazarus · APT38 공개 자료 읽기"
description: "공식 귀속과 공개된 행동을 구분해 북한 연계 위협 자료를 학습·탐지에 활용합니다."
category: "threat-intelligence"
updated: "2026-10-07"
tags: ["Lazarus", "APT38", "공개 출처"]
order: "31"
level: "입문"
---

## 공개 출처에서 확인하는 범위

MITRE ATT&CK은 **Lazarus Group G0032**를 북한 정찰총국에 귀속된 국가 지원 그룹으로 설명합니다. **APT38 G0082**는 금융기관 등의 자금 탈취를 중심으로 보고된 북한 연계 그룹으로 정리합니다. 분류 이름과 범위는 자료마다 다르므로 원문을 함께 기록합니다.

FBI는 2025년 2월 26일 공지에서 2월 21일경 Bybit의 약 **15억 달러 상당 가상자산 탈취**를 북한에 귀속하고 해당 활동을 **TraderTraitor**로 지칭했습니다. 이 공지의 귀속 사실과 다른 보고서의 기술적 분석은 별개 근거로 다룹니다.

## 자료를 섞지 않기

| 자료 | 활용할 내용 | 피해야 할 해석 |
| --- | --- | --- |
| ATT&CK 그룹 페이지 | 공개 보고서에 연결된 행동과 기술 | 모든 기술이 한 사건에 쓰였다는 가정 |
| FBI·정부 공지 | 해당 기관이 밝힌 귀속·사건 사실 | 공지에 없는 전체 공격 경로의 확정 |
| 기술 분석 보고서 | 샘플·로그·코드 등 공개된 근거 | 근거 수준 없이 다른 사건에 일반화 |

Lazarus, APT38, TraderTraitor라는 이름을 아무 조건 없이 동일한 활동으로 합치지 않습니다. 특정 사건의 공식 발표와 각 공급자의 분류를 구분합니다.

## 방어 학습으로 연결하기

공개된 행동에서 인증·프로세스·지속성·통신 증거를 조사할 가설을 만듭니다. 각 기술의 원리, 필요한 수집 자료, 정상 행위와 구별하는 조건, 대응을 정리합니다. 네트워크의 흐름뿐 아니라 개발·공급망·계정과 사람의 접근 경로도 함께 고려합니다.

## 확인 기준

이 글은 2026년 10월 7일에 확인한 공개 원문을 바탕으로 한 입문 노트입니다. 실시간 사건 목록이나 공격자 귀속 서비스가 아닙니다. 최신 주장은 해당 사건의 최신 원문과 발표 날짜를 확인하세요.

## 참고자료

- [MITRE — Lazarus Group G0032](https://attack.mitre.org/groups/G0032/)
- [MITRE — APT38 G0082](https://attack.mitre.org/groups/G0082/)
- [FBI IC3 — North Korea Responsible for $1.5 Billion Bybit Hack](https://www.ic3.gov/psa/2025/psa250226)
- [CISA — TraderTraitor AA22-108A](https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-108a)
