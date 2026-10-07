---
title: "Velociraptor 수집과 모니터링"
description: "단일 수집, Hunt와 Client Monitoring을 목적과 데이터 흐름에 맞춰 구분합니다."
category: "tools"
updated: "2026-10-07"
tags: ["Velociraptor", "Hunt", "모니터링"]
order: "18"
level: "입문"
---

## 수집 방식 구분하기

| 방식 | 목적 | 운영 관점 |
| --- | --- | --- |
| 단일 Collection | 특정 클라이언트에서 자료 수집 | 사건 범위를 좁혀 확인 |
| Hunt | 조건에 맞는 여러 클라이언트에 수집 예약 | 호스트별 결과·실패 확인 |
| Client Monitoring | 클라이언트 이벤트 쿼리의 지속 관찰 | 이벤트 전송·보존·부하 관리 |

Hunt는 일반적으로 각 대상 클라이언트에서 한 번 수집을 수행하는 방식이며, 지속 감시와 같은 개념이 아닙니다. Client Monitoring의 이벤트도 즉시 SIEM에 모두 도착한다고 가정할 수 없습니다.

## 작은 범위에서 시험하기

1. 시험 클라이언트와 라벨을 식별합니다.
2. Artifact의 지원 OS, 권한과 매개변수를 확인합니다.
3. 한 대에서 실제 결과와 수집 오류를 확인합니다.
4. 서버에서 결과를 찾고 보존·내보내기 경로를 확인합니다.
5. SIEM에 전달한다면 시각, 장비 식별과 필드가 유지되는지 확인합니다.
6. 성능과 개인정보 범위를 검토한 뒤 대상 수를 확대합니다.

## 예약 작업 지속 감시 예시

Windows Security 4698~4702를 관찰하려면 먼저 해당 감사 정책과 로그 생성부터 확인합니다. 설치한 버전에서 사용 가능한 이벤트 Artifact를 선택하고 라벨 등으로 대상을 제한합니다. 서버 수신, SIEM 전달, 검색·알림까지 각각 시험합니다.

Artifact 이름이나 UI 위치는 버전마다 달라질 수 있습니다. 문서의 특정 이름이 현재 설치에 있다고 가정하지 말고 Artifact 정의와 실제 출력으로 확인합니다.

## 참고자료

- [Velociraptor — Hunting](https://docs.velociraptor.app/docs/hunting/)
- [Velociraptor — Client Monitoring](https://docs.velociraptor.app/docs/clients/monitoring/)
- [Velociraptor — Client Labels](https://docs.velociraptor.app/docs/clients/labels/)
- [Microsoft — Audit Other Object Access Events](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/audit-other-object-access-events)
