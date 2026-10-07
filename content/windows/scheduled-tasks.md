---
title: "예약 작업의 생성과 변경 조사"
description: "예약 작업 이벤트와 작업 XML을 프로세스 실행 및 계정의 맥락에 연결합니다."
category: "windows"
updated: "2026-10-07"
tags: ["예약 작업", "지속성", "탐지"]
order: "6"
level: "입문"
---

## 조사할 이벤트

예약 작업은 정상 관리 기능인 동시에 지속성이나 실행에 악용될 수 있습니다. **Audit Other Object Access Events**의 감사 설정과 Security 로그 수집을 확인합니다.

| 이벤트 | 행동 |
| --- | --- |
| 4698 | 작업 생성 |
| 4699 | 작업 삭제 |
| 4700 | 작업 활성화 |
| 4701 | 작업 비활성화 |
| 4702 | 작업 업데이트 |

## XML에서 확인할 내용

작업 이름만으로 정상 여부를 판단하지 않습니다. 작업 XML의 **Actions**에서 명령·인자·작업 경로, **Principals**에서 실행 계정과 권한, **Triggers**에서 실행 조건을 살펴봅니다. 변경 이벤트는 이전 정의나 구성 백업과 비교해야 구체적인 차이를 알 수 있습니다.

## 탐지에서 조사로 이어가기

1. 변경한 계정과 로그온 세션, 장비와 시각을 확인합니다.
2. 실행 파일이 사용자 쓰기 가능 경로 또는 임시 경로에 있는지 조사합니다.
3. 4688 또는 Sysmon 1에서 실제 실행과 부모 프로세스를 연결합니다.
4. 승인된 배포·관리 작업과 비교합니다.
5. 실행 뒤 발생한 통신·파일 생성과 계정 접근을 확인합니다.

현재 작업 목록은 현재 상태의 증거입니다. 삭제된 과거 작업이나 이전 XML까지 전부 보여주지는 않습니다. 지속 감시가 필요하면 [Velociraptor 수집과 모니터링](velociraptor.html)에서 수집 방식을 구분합니다.

## 참고자료

- [Microsoft — Audit Other Object Access Events](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/audit-other-object-access-events)
- [Microsoft — Event 4698](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4698)
- [Microsoft — Event 4702](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4702)
