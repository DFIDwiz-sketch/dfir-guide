---
title: "Active Directory 인증 조사 시작하기"
description: "클라이언트·대상 서버·DC의 역할과 계정의 실제 권한을 구분합니다."
category: "identity"
updated: "2026-10-07"
tags: ["Active Directory", "인증", "계정"]
order: "12"
level: "입문"
---

## 인증과 접근 권한 구분하기

인증은 계정의 신원을 검증하며, 실제 자원 접근은 대상 서비스의 권한으로 결정됩니다. 도메인 관리자 그룹 여부만으로 모든 사건의 범위가 정해지지 않습니다. 객체 ACL, 위임·서비스 계정과 실제 대상 권한을 함께 확인합니다.

## 세 가지 위치의 증거

| 위치 | 조사할 내용 |
| --- | --- |
| 원래 클라이언트 | 사용자·프로세스, 이름 해석과 대상 연결 |
| 실제 대상 서버 | 인증된 계정, 실제 접속 출발지와 사용한 서비스 |
| Domain Controller | 도메인 인증 검증과 관련 계정·객체 변경 |

NTLM Relay에서는 실제 대상이 본 출발지 장비와 인증된 계정의 원래 장비가 다를 수 있습니다. DC의 인증 기록을 실제 서비스 접근 로그와 연결해야 합니다.

## 계정과 프로토콜 식별

사용자 계정, 서비스 계정과 컴퓨터 계정을 구분합니다. 앱에 `Negotiate`가 표시됐다는 사실만으로 Kerberos 사용을 확정하지 않습니다. 실제 인증 패키지와 성공 기록을 확인합니다.

## 범위 확인

- 같은 계정이 다른 서버에도 접근했는가?
- 변경된 객체·권한·계정과 새 서비스가 있는가?
- 인증서 등록이나 자격 증명 노출이 있었는가?
- 정상 관리 장비·프록시와 승인된 작업인가?

자세한 공격 조건과 보호는 [NTLM 인증과 공격 및 방어](ntlm.html), 사고 조사 순서는 [NTLM 의심 행위 조사](ntlm-triage.html)를 참고하세요.

## 참고자료

- [Microsoft — NTLM overview](https://learn.microsoft.com/en-us/windows-server/security/kerberos/ntlm-overview)
- [Microsoft — Security 4624](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624)
- [Microsoft — Security 4776](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4776)
