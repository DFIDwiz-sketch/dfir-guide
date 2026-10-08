---
title: "Windows 자격 증명 구조와 보호"
description: "비밀번호·hash·티켓·토큰을 나누고 자기 권한과 Credential Guard 상태를 확인하며 노출 대응 범위를 정하는 6단계."
category: "identity"
updated: "2026-10-08"
tags: ["자격 증명", "Credential Guard", "권한"]
order: "26"
level: "입문"
---

## 목표와 준비물

비밀번호·hash·응답·티켓·토큰을 구분하고 무엇이 노출됐을 때 어떤 보호와 대응이 필요한지 설명합니다. 시험 Windows 장비, 계정 사용 현황과 보호 정책을 확인할 권한이 필요합니다. 실습은 자기 세션과 보호 상태를 조회하는 범위이며 실제 비밀값을 추출하지 않습니다.

## 1단계 — 자료의 종류 나누기

| 자료 | 의미 | 노출·악용을 조사할 관점 |
| --- | --- | --- |
| 비밀번호 | 사용자가 입력하거나 서비스가 사용하는 비밀값 | 재사용 범위와 변경 필요성 |
| NT hash | NTLM 등에 관련된 비밀번호 파생 비밀값 | 새 인증에 악용될 조건과 계정 범위 |
| NTLM 인증 응답 | challenge 등에 대해 계산한 응답 | 캡처·추측·Relay를 NT hash 재사용과 구분 |
| Kerberos 티켓 | 티켓 기반 서비스 인증에 이용 | 대상·유효 기간·세션과 관련 키 |
| Access token | 프로세스·스레드의 보안 문맥 | SID·그룹·권한, 가장과 접근 판단 |
| 앱 저장 자료 | 앱이 별도로 보관하는 비밀값·토큰 등 | 저장 위치·접근 정책·만료·폐기 방식 |

이 자료를 모두 ‘비밀번호’라고 부르면 대응이 틀어집니다. 예를 들어 인증서나 앱 세션이 관련됐다면 Windows 비밀번호를 바꾸는 것만으로 해당 경로가 모두 끝난다고 가정할 수 없습니다.

## 2단계 — 자기 실행 문맥 확인하기

일반 권한의 시험 터미널에서 다음을 실행합니다.

```text
whoami /user
whoami /groups
whoami /priv
```

사용자 SID와 그룹·권한 상태를 적습니다. 승인된 시험 관리자 계정이 있다면 별도로 연 관리자 터미널의 출력과 비교합니다. 같은 계정 이름이어도 UAC와 토큰 상태에 따라 실제 사용할 수 있는 권한이 달라질 수 있습니다.

**확인할 결과:** 그룹에 속함, 특권이 존재함, 특권이 활성화됨, 특정 자원 접근이 허용됨을 구분합니다. 이 출력은 다른 프로세스의 모든 가장 상태나 자격 증명 저장 내용을 보여주지 않습니다.

## 3단계 — 계정이 사용되는 위치 그리기

| 계정 유형 | 확인할 내용 |
| --- | --- |
| 일반 사용자 | 사용하는 장비·서비스와 평소 접근 경로 |
| 관리 계정 | 고권한 로그온을 허용한 장비와 업무 |
| 로컬 관리자 | 여러 장비에서 동일 비밀값을 재사용하는지 |
| 서비스 계정 | 실행 서비스·의존 애플리케이션·권한·교체 절차 |

관리 계정이 일반 사용자 장비에 자주 로그온하면 그 장비의 침해가 높은 권한으로 이어질 수 있습니다. 실제 계정 사용 흐름을 그린 뒤 최소 권한, 관리 장비 분리, 불필요한 로그온 제한의 적용 범위를 정합니다.

## 4단계 — 보호 기능별 역할 확인하기

| 보호 | 줄이려는 위험 | 함께 필요한 확인 |
| --- | --- | --- |
| Windows LAPS | 로컬 관리자 비밀번호의 공유·재사용 | 관리 범위, 읽기 권한과 교체 정책 |
| Credential Guard | 지원되는 일부 비밀값을 VBS로 격리 | 지원 조건, 실제 실행 상태와 호환성 |
| LSASS 보호 | 비인가 프로세스 접근·코드 로딩 위험 완화 | 적용 상태, 예외와 정상 보안 도구 |
| 서비스별 signing·CBT·EPA | 인증 Relay가 성립하는 조건 축소 | 각 서비스와 클라이언트의 실제 요구·협상 |

Credential Guard와 LSASS 보호는 서로 다른 기능입니다. Credential Guard가 켜졌다는 사실만으로 모든 앱의 저장 자격 증명이나 Relay 경로까지 보호됐다고 볼 수 없습니다.

## 5단계 — 설정과 실제 실행 구분하기

지원되는 시험 Windows에서 관리자 권한이 필요한 경우 해당 권한으로 상태를 조회합니다.

```powershell
Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard |
  Select-Object SecurityServicesConfigured, SecurityServicesRunning
```

Microsoft의 해당 클래스 값 정의에서 Credential Guard를 나타내는 `1`이 `SecurityServicesRunning`에 포함되는지 확인합니다. 배열에 다른 기능의 값이 같이 있을 수 있습니다. `Configured`에만 있다는 이유로 실제 실행 중이라고 판단하지 않습니다.

조회가 실패하면 OS·지원 조건·권한과 관리 구성을 확인하고, 오류를 곧바로 보호 비활성 상태로 바꾸어 기록하지 않습니다. 정책 변경 전후에는 필요한 재부팅·호환성 및 정상 업무 시험을 별도로 계획합니다.

## 6단계 — 노출 의심 시 대응 범위 정하기

비밀값 종류, 관련 계정, 실제 사용 장비와 서비스, 노출 추정 시점을 표로 만듭니다. 수집된 LSASS 접근 기록은 프로세스·서명·계정·접근 목적과 후속 인증을 함께 보며 정상 보안 소프트웨어와 구분합니다.

확인된 노출 범위에 맞춰 비밀값 교체·세션 처리·권한 변경 복원·지속성 제거를 연결합니다. 서비스 계정의 교체는 의존 서비스와 정상 복구를 함께 검증합니다. 침해된 장비에서 새 비밀값이 다시 노출되지 않도록 신뢰 회복과 교체 순서도 검토합니다.

## 완료 기준

사례 하나에서 노출될 수 있는 자료의 종류, 재사용 가능한 범위, 예방 기능과 기능의 한계, 사고 시 교체·폐기·복구 대상을 각각 적습니다. 다음은 [Windows 내부 구조](windows-internals.html)와 [NTLM 조사](ntlm-triage.html)입니다.

추가 공식 자료: [Microsoft — Credential Guard 구성과 검증](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-guard/configure), [Microsoft — whoami](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/whoami).

## 온프레미스에서 클라우드로 이어지는 자격 증명

NT hash·Kerberos 티켓·Windows access token과 OAuth access token은 같은 자료가 아닙니다. 브라우저 세션, 앱 동의와 서비스 principal 자격 증명까지 범위를 넓히면 비밀번호 변경만으로 접근이 모두 철회되지 않는 이유를 이해할 수 있습니다.

[클라우드 계정·세션·토큰 조사](cloud-identity-response.html)에서 로그인·앱 권한·실제 서비스 접근과 철회 결과를 비교합니다. 개발·배포 계정은 [공급망 조사](software-supply-chain.html)로 연결합니다.

## 참고자료

- [Microsoft — Access Tokens](https://learn.microsoft.com/en-us/windows/win32/secauthz/access-tokens)
- [Microsoft — Credentials Management](https://learn.microsoft.com/en-us/windows/win32/secauthn/credentials-management)
- [Microsoft — Credential Guard](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-guard/)
- [Microsoft — Windows LAPS](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview)
