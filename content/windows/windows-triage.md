---
title: "Windows 호스트 초기 조사"
description: "로그온, 프로세스, 실행 흔적과 지속성 설정을 연결하는 호스트 조사 시작점."
category: "windows"
updated: "2026-10-07"
tags: ["Windows", "호스트 포렌식", "초기 조사"]
order: "4"
level: "입문"
---

## 수집할 범위 정하기

장비 이름, 운영체제·버전, 사용자, 사건 시점과 현재 동작 상태를 기록합니다. 살아 있는 장비에서의 수집은 상태를 변경할 수 있으므로 수행한 작업을 기록하고, 재부팅 전에 휘발성 자료의 필요성을 판단합니다.

## 조사할 증거

| 조사 목적 | 자료 | 함께 확인할 내용 |
| --- | --- | --- |
| 누가 접근했는가 | Security의 로그온·인증 이벤트 | 계정, LogonType, 출발지와 시간 |
| 어떤 프로그램이 실행됐는가 | 4688, Sysmon 1, Prefetch | 경로, 부모 프로세스와 명령행 |
| 무엇이 변경됐는가 | 파일·레지스트리·설정 자료 | 변경 시점과 실제 생성 행위 |
| 다시 실행되는가 | 서비스, 예약 작업과 자동 실행 설정 | 실행 파일, 인자, 계정과 트리거 |
| 어디와 통신했는가 | EDR·Sysmon·네트워크 로그 | 목적지, 프로세스와 통신 시점 |

이 표는 조사 설계용 지도입니다. 자료가 모두 기본으로 기록되는 것은 아닙니다. 4688의 명령행에는 별도 정책이 필요하며 Sysmon도 설치와 설정이 필요합니다. Prefetch의 보존·생성 조건을 확인하고 단일 아티팩트의 부재로 미실행을 단정하지 않습니다.

## 분석 순서

1. 경보 또는 의심 파일의 원문과 출처를 확인합니다.
2. 실행 기록에서 부모·자식 프로세스와 계정을 찾습니다.
3. 같은 시간대의 로그온과 파일 생성·통신을 대조합니다.
4. 지속성 설정과 다른 장비로 이어진 인증을 확인합니다.
5. 확인한 행동을 타임라인에 넣고 남은 불확실성을 기록합니다.

## 피해야 할 해석

관리 도구 이름, 인코딩된 명령, 외부 연결 하나만으로 악성 여부를 확정하지 않습니다. 정상 관리 작업의 출발지와 승인 기록, 프로그램 서명, 경로와 후속 행동을 비교합니다.

## 참고자료

- [Microsoft — Security 4688](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4688)
- [Microsoft Sysinternals — Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)
- [Velociraptor — Windows.Forensics.Prefetch](https://docs.velociraptor.app/artifact_references/pages/windows.forensics.prefetch/)
