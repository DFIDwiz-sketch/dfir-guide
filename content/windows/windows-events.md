---
title: "Windows 이벤트 로그 읽기"
description: "이벤트 ID와 채널, 감사 정책 및 필드의 한계를 함께 보는 로그 분석 가이드."
category: "windows"
updated: "2026-10-07"
tags: ["EVTX", "이벤트 ID", "Sysmon"]
order: "5"
level: "입문"
---

## 목표와 준비물

이벤트 번호를 검색하는 데서 한 걸음 더 나아가 **어느 장비에서 누가 어떤 행동을 했는지** 설명합니다. 수집한 `Security.evtx` 분석 사본과 Windows PowerShell이 필요합니다. 라이브 장비를 직접 읽는 방법과 사본을 읽는 방법을 구분합니다.

## 1단계 — 채널과 Provider 확인하기

이벤트 뷰어에서 로그를 열고 일반 설명과 XML 상세 보기를 함께 봅니다. 이벤트 ID, Provider, Channel, Computer, Record ID, 시각을 기록합니다. 같은 ID라도 Provider가 다르면 의미가 달라질 수 있습니다.

| Security 이벤트 | 조사 출발점 |
| --- | --- |
| 4624 / 4625 | 로그온 성공 / 실패 |
| 4688 | 새 프로세스 생성 |
| 4698 / 4702 | 예약 작업 생성 / 변경 |
| 4776 | NTLM 자격 증명 검증 |

Sysmon은 별도 Provider와 채널입니다. Sysmon 1·3·10은 각각 프로세스 생성·네트워크 연결·프로세스 접근을 다루지만 설치와 필터 설정을 확인해야 합니다. 특히 이벤트 3은 기본 설정에서 비활성화돼 있습니다.

## 2단계 — 사본에 시간과 ID 필터 적용하기

아래 시각은 가상 실습 시간입니다. 실제 조사 기간으로 수정합니다. UTC 입력을 분석 PC의 로컬 시각으로 변환해 필터에 전달합니다.

```powershell
$start = ([datetimeoffset]'2026-10-07T00:00:00Z').LocalDateTime
$end = ([datetimeoffset]'2026-10-07T00:15:00Z').LocalDateTime
$events = Get-WinEvent -FilterHashtable @{
  Path = '.\Security.evtx'
  Id = 4624,4625,4688,4698,4702,4776
  StartTime = $start
  EndTime = $end
}
$events | Select-Object TimeCreated, Id, RecordId, MachineName, ProviderName
```

라이브 로그를 조사하도록 승인받은 경우 `Path` 대신 `LogName='Security'`를 사용합니다. 사본을 분석한다고 생각하면서 로컬 PC의 Security를 조회하지 않도록 대상 선택을 확인합니다.

**확인할 결과:** 필요한 시간대의 해당 이벤트만 표시됩니다. 결과 없음 오류가 나면 실제 파일 기간과 감사 설정을 확인합니다. 아무 기록도 없는 파일과 필터에 맞는 기록만 없는 파일은 다릅니다.

## 3단계 — 설명 문자열 대신 XML 필드 읽기

이벤트의 `Message`는 화면 언어와 메시지 리소스에 영향을 받습니다. 이름이 있는 EventData 필드는 다음처럼 확인할 수 있습니다. 모든 이벤트 스키마가 EventData 형식은 아니므로 대상 이벤트 구조를 먼저 봅니다.

```powershell
$events | ForEach-Object {
  $record = $_
  [xml]$xml = $record.ToXml()
  $fields = @{}
  foreach ($node in $xml.Event.EventData.Data) {
    $fields[$node.GetAttribute('Name')] = $node.InnerText
  }
  [pscustomobject]@{
    TimeUtc = $record.TimeCreated.ToUniversalTime().ToString('o')
    Computer = $record.MachineName
    EventId = $record.Id
    RecordId = $record.RecordId
    TargetUser = $fields['TargetUserName']
    SubjectUser = $fields['SubjectUserName']
    LogonType = $fields['LogonType']
    SourceIp = $fields['IpAddress']
    AuthPackage = $fields['AuthenticationPackageName']
  }
} | Format-Table -AutoSize
```

빈 값은 해당 이벤트에 필드가 없거나 기록되지 않았다는 뜻일 수 있습니다. 4776처럼 출발지 IP와 대상 서비스가 직접 제공되지 않는 이벤트를 4624와 같은 구조라고 가정하지 않습니다.

## 4단계 — 로그온 유형과 인증 결과 구분하기

4624의 LogonType 3은 네트워크 로그온, 10은 원격 대화형 로그온을 나타냅니다. 인증 패키지와 출발지·계정·대상·시점을 함께 봅니다. 로그온 성공은 접근 뒤 명령 실행이나 파일 읽기까지 모두 성공했다는 뜻이 아닙니다.

4625는 실패 이벤트이므로 상태·하위 상태 코드와 계정을 비교합니다. 단일 실패는 사용자 실수나 만료된 서비스 비밀값에서도 발생할 수 있습니다. 실패 후 성공이 있다면 같은 계정과 대상인지 확인하되 단순한 시간 순서만으로 동일 세션이라고 단정하지 않습니다.

## 5단계 — 생성·설정·실제 실행을 구분하기

4698에서 작업이 만들어진 사실을 확인한 다음 작업 내용과 4688·Sysmon 1 등 실제 실행 자료를 봅니다. 이벤트 4688의 명령행 수집에는 별도의 정책이 필요합니다. 로그온 ID는 같은 장비와 부팅 맥락 안에서 비교하고, 다른 장비의 같은 값과 연결하지 않습니다.

**남길 결과:** 원문 파일, Record ID, UTC 시각, 계정·장비, 이벤트가 직접 말해 주는 사실, 아직 확인할 수 없는 사실입니다.

## 6단계 — 로그가 없을 때 점검하기

순서는 대상 파일·장비 → 시간 구간·시간대 → 채널 → 감사 정책 → 보존 기간 → 수집·전달 경로입니다. 조사 후 정책을 켜도 과거 기록이 새로 생기지는 않습니다. SIEM에만 없는 경우 원본 EVTX에 기록이 있는지부터 확인합니다.

**완료 기준:** 4624와 4776, 작업 생성과 작업 실행을 구분해 설명하고, 분석 결론에서 원문 Record ID로 돌아갈 수 있습니다. 다음은 [예약 작업 조사](scheduled-tasks.html)입니다.

추가 공식 문서: [Get-WinEvent 필터](https://learn.microsoft.com/en-us/powershell/scripting/samples/creating-get-winevent-queries-with-filterhashtable).

## 참고자료

- [Microsoft — Security 4624](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624)
- [Microsoft — Security 4776](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4776)
- [Microsoft — Security 4688](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4688)
- [Microsoft — Security 4698](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4698)
- [Microsoft — Security 4702](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4702)
- [Microsoft — Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)
