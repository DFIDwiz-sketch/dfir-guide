---
title: "Kerberos의 TGT · TGS · SPN"
description: "티켓 기반 인증의 역할을 이해하고 실제 서비스 접근과 인증 기록을 구분합니다."
category: "identity"
updated: "2026-10-07"
tags: ["Kerberos", "TGT · TGS", "SPN"]
order: "25"
level: "입문"
---

## Kerberos가 해결하는 일

Kerberos는 티켓을 이용하는 인증 프로토콜이며 Active Directory에서 주요 인증 방식입니다. 서비스의 신원과 인증 흐름을 이해하려면 사용자·서비스·KDC의 역할을 구분해야 합니다.

## 구성 요소

| 개념 | 역할 |
| --- | --- |
| KDC | 티켓을 발급하는 인증 역할; AD에서는 DC가 수행 |
| TGT | 이후 서비스 티켓 요청에 이용하는 티켓 |
| TGS 교환 | 특정 서비스의 티켓을 요청하는 단계 |
| Service ticket | 대상 서비스 인증에 쓰이는 티켓 |
| SPN | 서비스 인스턴스를 식별하는 이름 |

로그온 후 티켓을 얻고, 필요한 서비스의 티켓을 요청한 뒤 해당 서비스에 접근하는 흐름으로 이해합니다. 티켓 획득과 서비스에서 실제로 수행한 행동은 서로 다른 기록입니다.

## 운영과 조사에서 확인할 것

DNS 이름·SPN·시간 동기화·도메인 신뢰와 서비스 계정 구성을 확인합니다. 티켓 발급 기록만으로 파일 접근이나 명령 실행까지 성공했다고 단정하지 않습니다. 대상 서버의 접근·프로세스·서비스 로그를 함께 봅니다.

## NTLM과 이어서 공부하기

NTLM의 challenge-response와 Kerberos의 티켓 흐름을 비교합니다. 앱의 Negotiate는 실제 인증을 협상하므로 NTLM fallback이 있는지 확인해야 합니다. 위임과 서비스 계정, 자격 증명 보호는 인증 흐름을 익힌 뒤 별도 주제로 학습합니다.

## 참고자료

- [Microsoft — Kerberos authentication overview](https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview)
- [NTLM 인증과 공격 및 방어](ntlm.html)
