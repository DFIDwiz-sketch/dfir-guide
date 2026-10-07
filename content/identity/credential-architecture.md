---
title: "Windows 자격 증명 구조와 보호"
description: "비밀번호·hash·인증 응답·티켓·토큰의 의미를 분리하고 노출 경로를 줄입니다."
category: "identity"
updated: "2026-10-07"
tags: ["자격 증명", "Credential Guard", "권한"]
order: "26"
level: "입문"
---

## 서로 다른 자료를 구분하기

| 자료 | 의미 | 조사 관점 |
| --- | --- | --- |
| 비밀번호·NT hash | 인증 비밀값과 그 파생값 | 노출·재사용의 범위 |
| NTLM response | challenge에 계산한 인증 응답 | 캡처와 실시간 Relay |
| Kerberos 티켓 | 티켓 기반 인증에 쓰이는 자료 | 티켓·서비스 인증의 맥락 |
| Access token | 프로세스·스레드의 보안 문맥 | SID·그룹·권한과 자원 접근 |
| 저장된 앱 자격 증명 | 앱이 보관·사용하는 인증 자료 | 저장 방식과 접근 권한 |

토큰은 비밀번호의 다른 이름이 아닙니다. 인증에 이용한 비밀값과 인증 후 권한을 적용하는 문맥을 구분합니다.

## 보호의 층위

고권한 계정의 일반 장비 로그온을 줄이고 관리 계정·장비를 분리합니다. 로컬 관리자 비밀번호 재사용은 Windows LAPS로 줄이고 지원되는 환경에서 Credential Guard와 LSASS 보호를 검토합니다.

Credential Guard는 VBS를 이용해 일부 자격 증명을 격리합니다. 모든 계정 저장소나 이미 유출된 비밀값까지 보호하는 기능은 아니며 OS·역할과 앱의 지원 조건을 확인해야 합니다. Relay 방어에는 대상 서비스의 signing·CBT·EPA가 별도로 필요합니다.

## 조사할 질문

어떤 비밀값이나 티켓이 노출됐는지, 어느 계정·장비·서비스에서 다시 사용할 수 있는지 확인합니다. 비밀번호 변경 뒤에도 기존 세션·지속성·인증서 또는 변경된 권한이 남는지 조사합니다.

## 참고자료

- [Microsoft — Access Tokens](https://learn.microsoft.com/en-us/windows/win32/secauthz/access-tokens)
- [Microsoft — Credentials Management](https://learn.microsoft.com/en-us/windows/win32/secauthn/credentials-management)
- [Microsoft — Credential Guard](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-guard/)
- [Microsoft — Windows LAPS](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview)
