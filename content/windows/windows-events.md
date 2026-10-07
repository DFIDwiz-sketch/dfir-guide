---
title: "Windows 이벤트 로그 읽기"
description: "이벤트 ID와 채널, 감사 정책 및 필드의 한계를 함께 보는 로그 분석 가이드."
category: "windows"
updated: "2026-10-07"
tags: ["EVTX", "이벤트 ID", "Sysmon"]
order: "5"
level: "입문"
---

## ID와 채널을 함께 보기

이벤트 번호만 외우기보다 **Provider, Channel, Event ID, 장비, 계정, 시각**을 함께 기록합니다. 같은 번호라도 다른 Provider에서는 의미가 다를 수 있습니다. Windows 버전과 이벤트 스키마에 따라 포함되는 필드도 달라집니다.

## 자주 쓰는 기록

| 채널·이벤트 | 의미 | 분석할 맥락 |
| --- | --- | --- |
| Security 4624 / 4625 | 로그온 성공 / 실패 | LogonType, 인증 패키지, 계정과 출발지 |
| Security 4688 | 프로세스 생성 | 실행 파일, 부모, 명령행 수집 여부 |
| Security 4698 / 4702 | 예약 작업 생성 / 변경 | 작업 XML, 실행 대상과 수행 계정 |
| Security 4776 | NTLM 자격 증명 검증 | 검증한 장비, 계정과 결과 코드 |
| Sysmon 1 / 3 / 10 | 프로세스 생성 / 네트워크 연결 / 프로세스 접근 | 설정된 필터와 실제 수집 범위 |

4624의 LogonType 3은 네트워크 로그온을 나타내지만 Relay나 Pass-the-Hash의 확정 증거는 아닙니다. 4776의 검증 장비와 실제 접근 대상은 구분해야 합니다. NTLM의 해석은 [전체 가이드](ntlm.html)를 참고하세요.

## 기록이 없을 때 확인할 것

- 해당 감사 정책이 켜져 있는가?
- 로그가 덮어써졌거나 전달되지 않았는가?
- 사용자의 검색 권한, 대상 장비와 시간대가 맞는가?
- 수집 파이프라인이 XML·JSON 필드를 다르게 변환했는가?

Sysmon 네트워크 연결 이벤트 3은 기본으로 비활성화돼 있습니다. 도구 설치 여부만으로 네트워크 기록이 남는다고 기대할 수 없습니다.

## 수집한 EVTX 확인 예시

```powershell
Get-WinEvent -Path .\Security.evtx |
  Where-Object { $_.Id -in 4624,4625,4688,4698,4702,4776 } |
  Select-Object TimeCreated, Id, ProviderName, Message
```

위 예시는 분석 사본을 읽습니다. 대용량 EVTX에서는 먼저 시간·이벤트 필터를 적용하거나 전문 파서를 사용합니다.

## 참고자료

- [Microsoft — Security 4624](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624)
- [Microsoft — Security 4776](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4776)
- [Microsoft — Security 4688](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4688)
- [Microsoft — Security 4698](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4698)
- [Microsoft — Security 4702](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4702)
- [Microsoft — Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)
