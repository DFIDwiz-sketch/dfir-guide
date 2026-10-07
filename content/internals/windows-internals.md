---
title: "Windows 내부 구조: 프로세스와 권한"
description: "정상 자식 프로세스를 관찰하며 파일·프로세스·스레드·메모리·토큰·ACL을 실제 로그에 연결하는 6단계 실습."
category: "internals"
updated: "2026-10-08"
tags: ["Windows Internals", "프로세스", "토큰"]
order: "22"
level: "입문"
---

## 목표와 준비물

프로그램 파일, 실행 중인 프로세스와 스레드, 토큰과 객체 권한을 실제 관찰에 연결합니다. 시험 Windows와 PowerShell을 준비합니다. Process Explorer를 사용한다면 Microsoft Sysinternals의 공식 배포본과 버전을 확인합니다.

## 1단계 — 파일과 프로세스 구분하기

프로그램 파일은 디스크의 코드·데이터이고 프로세스는 실행을 위한 주소 공간과 자원을 가진 인스턴스입니다. 스레드가 프로세스 안에서 실행되므로 같은 파일에서 여러 프로세스가 만들어질 수 있습니다.

PowerShell에서 자기 프로세스를 조회합니다. `$PID`는 현재 PowerShell의 자동 변수이므로 다른 값으로 덮어쓰지 않습니다.

```powershell
Get-CimInstance Win32_Process -Filter "ProcessId=$PID" |
  Select-Object ProcessId, ParentProcessId, Name, ExecutablePath, CommandLine
```

**확인할 결과:** 이름, 실제 파일 경로, 명령행, 부모 PID입니다. 경로가 비어 있다면 권한·보호 상태부터 확인합니다. 이름만으로 어떤 파일이 실행됐는지 확정하지 않습니다.

## 2단계 — 부모·자식과 수명 관찰하기

시험 환경에서 다음 명령으로 별도 명령 프롬프트를 열고 ‘DFIR-LAB’을 표시합니다. 새 창에서 `exit`를 입력하면 종료됩니다.

```powershell
$child = Start-Process "$env:SystemRoot\System32\cmd.exe" -ArgumentList '/k','echo DFIR-LAB' -PassThru
Get-CimInstance Win32_Process -Filter "ProcessId=$($child.Id)" |
  Select-Object ProcessId, ParentProcessId, CreationDate, CommandLine
```

자식의 부모 PID와 현재 `$PID`를 비교합니다. 종료 후 현재 목록에서 사라지는지도 확인합니다. 이는 프로세스의 정상 생성·종료 관찰이며 지속성 설정을 만드는 동작이 아닙니다.

PID는 재사용될 수 있습니다. 과거의 부모 PID를 지금 실행 중인 동일 번호와 연결하면 틀릴 수 있으므로 장비·생성 시각과 당시 이벤트를 함께 사용합니다. 부모 관계도 단독으로 악성 여부를 판정하는 기준은 아닙니다.

## 3단계 — 스레드·모듈과 메모리의 역할 보기

Process Explorer에서 시험 프로세스의 속성을 열어 스레드, 이미지 경로와 로드된 모듈을 관찰합니다. 설치 버전과 프로세스 보호·권한에 따라 보이는 항목은 다를 수 있습니다.

| 개념 | 관찰할 내용 | 해석의 한계 |
| --- | --- | --- |
| 스레드 | 실행 단위와 시작 정보 | 스레드 수만으로 악성 판단 불가 |
| 가상 메모리 | 프로세스별 주소 공간과 영역 | 디스크 파일의 단순 복사본이 아님 |
| DLL | 이용 중인 모듈과 경로 | 정상 모듈이 로드돼도 전체 프로세스의 정상성을 보장하지 않음 |
| 핸들 | 파일·키 등 객체에 대한 참조 | 열려 있다는 사실과 실제 수행한 동작은 다름 |

처음에는 값 하나를 외우기보다 프로세스가 어떤 종류의 자원을 사용하는지 기록합니다. 메모리의 자세한 조사는 [메모리 포렌식](memory-investigation.html)으로 이어갑니다.

## 4단계 — 토큰과 권한 상태 확인하기

```text
whoami /user
whoami /groups
whoami /priv
```

계정 SID, 그룹과 특권 상태를 확인합니다. 프로세스의 기본 토큰과 스레드의 가장 문맥은 구분해야 합니다. 자기 터미널의 출력이 시스템의 모든 프로세스 문맥을 보여주는 것은 아닙니다.

관리자 계정으로 로그인했어도 모든 프로세스가 항상 같은 수준으로 실행되는 것은 아닙니다. UAC, 제한 토큰, 무결성 수준과 활성 특권을 대상 ACL과 함께 생각합니다.

## 5단계 — 객체의 접근 제어와 비교하기

실제로 존재하는 시험 문서 경로로 바꿔 소유자와 접근 제어 목록을 조회합니다.

```powershell
Get-Acl -LiteralPath .\sample.txt | Format-List Owner, AccessToString
```

ACL과 토큰은 서로 다른 자료입니다. 허용·거부 항목, 상속과 해당 사용자의 그룹을 비교합니다. 네트워크 공유를 통해 접근했다면 공유 권한 등 다른 조건도 영향을 줍니다. ACL 한 화면만으로 모든 종류의 유효 접근을 완전히 계산했다고 가정하지 않습니다.

## 6단계 — 이벤트에 다시 연결하기

프로세스 생성 감사와 Sysmon이 준비됐다면 2단계 실행의 4688 또는 Sysmon 1을 찾습니다. 시각·계정·부모·명령행을 비교하고 Sysmon의 ProcessGuid가 있다면 관련 후속 이벤트 연결에 사용합니다.

기록이 없으면 [Windows 이벤트 가이드](windows-events.html)의 정책·채널·보존·전달 순서로 점검합니다. 도구 화면에서 보였다는 사실과 지속적으로 수집됐다는 사실은 다릅니다.

## 완료 기준

시험 실행 하나에 대해 파일 경로, 프로세스·부모 식별자와 생성 시각, 계정·권한 문맥, 사용한 객체와 실제 로그를 적습니다. 프로세스 이름·PID·관리자 그룹 하나만으로 결론 내리지 않는 이유를 설명할 수 있어야 합니다.

추가 공식 자료: [Process Explorer](https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer), [Get-Acl](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/get-acl).

## 참고자료

- [Microsoft — Processes and Threads](https://learn.microsoft.com/en-us/windows/win32/procthread/processes-and-threads)
- [Microsoft — Access Tokens](https://learn.microsoft.com/en-us/windows/win32/secauthz/access-tokens)
- [Microsoft — Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)
