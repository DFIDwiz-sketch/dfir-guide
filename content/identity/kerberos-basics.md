---
title: "Kerberos의 TGT · TGS · SPN"
description: "TGT·서비스 티켓·SPN을 익히고 klist, DC 발급 기록과 대상 접근을 비교하는 6단계 인증 실습."
category: "identity"
updated: "2026-10-08"
tags: ["Kerberos", "TGT · TGS", "SPN"]
order: "25"
level: "입문"
---

## 목표와 준비물

Kerberos의 티켓 흐름을 이해하고 **클라이언트의 캐시, DC의 발급 기록, 서비스의 실제 접근**을 구분합니다. 개념과 로그 비교는 이 글만으로 시작할 수 있습니다. 명령 실습에는 승인된 AD 시험 환경의 Windows 클라이언트와 자기 계정, 조회 가능한 인증 로그가 필요합니다.

먼저 [NTLM 가이드](ntlm.html)의 challenge-response를 읽고 오면 두 방식을 비교하기 쉽습니다. 도메인 환경이 없다면 명령 실행 대신 아래의 역할표와 조사 기록 양식을 사용합니다.

## 1단계 — 다섯 구성 요소 연결하기

| 요소 | 하는 일 | 기억할 구분 |
| --- | --- | --- |
| 클라이언트 | 사용자의 보안 문맥에서 티켓을 얻고 서비스를 요청 | 실제 업무 프로그램과 연결 |
| KDC | 티켓 발급 역할 | AD에서는 DC가 수행 |
| TGT | 이후 서비스 티켓 요청에 이용 | 모든 서비스의 실제 접근 성공을 뜻하지 않음 |
| 서비스 티켓 | 특정 서비스에 인증할 때 사용 | 대상 서비스가 접근 권한을 별도로 판단 |
| SPN | 서비스 인스턴스를 식별하는 이름 | IP·호스트 이름·실행 계정과 관계 확인 |

기본 흐름은 AS 교환으로 TGT를 받고, TGS 교환으로 필요한 서비스 티켓을 받은 뒤 서비스에 제시하는 것입니다. **TGS는 Ticket-Granting Service이며, 실무에서 ‘TGS 티켓’이라고 부르는 것은 보통 서비스 티켓**입니다. 이름과 역할을 구분해 적습니다.

## 2단계 — 현재 세션의 티켓 읽기

시험 클라이언트에서 현재 사용자와 캐시를 확인합니다.

```powershell
whoami /user
klist
```

`klist` 출력에서 Client, Server, 시작·만료 시각, 암호화 유형과 로그온 세션을 기록합니다. 현재 캐시를 조회하는 실습이므로 티켓 삭제나 새 티켓 강제 요청은 필요하지 않습니다.

**확인할 결과:** `krbtgt` 관련 TGT와 서비스별 티켓을 구분합니다. 출력이 비어 있다면 로컬 계정인지, 다른 로그온 세션을 보고 있는지, 서비스 이용 시점이 맞는지 확인합니다. 빈 캐시만으로 시스템 전체에서 Kerberos를 사용하지 않는다고 판단하지 않습니다.

## 3단계 — 정상 서비스 이용 전후 비교하기

이미 권한이 있는 시험 공유 폴더나 내부 애플리케이션을 **환경에 등록된 DNS 이름**으로 한 번 엽니다. 사용한 주소와 시각, 성공·실패를 기록한 뒤 `klist`를 다시 확인합니다.

새 티켓이 보이면 서비스 이름·대상·유효 시간을 비교합니다. 기존 티켓을 재사용했다면 매 접근마다 새 발급 기록이 생기지 않을 수 있습니다. FQDN·별칭·IP로 접속할 때 인증 경로가 달라질 수 있으므로 주소 형태만으로 실제 프로토콜을 단정하지 않습니다.

SPN 문제를 조사하도록 승인받았고 도구가 설치돼 있다면 다음과 같이 정확한 서비스 이름을 조회할 수 있습니다. `files.lab.test`는 예시이므로 실제 시험 대상 이름으로 바꿉니다.

```text
setspn -Q cifs/files.lab.test
```

조회 결과와 애플리케이션이 실제 요청한 서비스 이름을 비교합니다. SPN 등록을 추가·삭제하는 조치는 서비스 계정과 중복 여부를 검토한 별도 변경 작업으로 다룹니다.

## 4단계 — 세 위치의 로그 비교하기

| 위치·기록 | 확인할 사실 | 직접 증명하지 못하는 것 |
| --- | --- | --- |
| 클라이언트의 klist | 해당 세션에서 현재 확인되는 티켓 | 과거의 모든 티켓과 실제 업무 처리 |
| DC Security 4768 | TGT 요청과 발급 결과 | 모든 자원 접근 성공 |
| DC Security 4769 | 서비스 티켓 요청과 결과 | 대상에서 파일을 읽거나 코드를 실행한 사실 |
| DC Security 4771 | 사전 인증 실패 | 계정 탈취나 공격 확정 |
| 대상 4624·서비스 로그 | 로그온과 애플리케이션 요청 | 전체 영향 범위와 공격 의도 |

감사 정책·DC별 수집 범위와 이벤트 버전에 따라 필드가 달라집니다. 한 DC에서 기록을 못 찾았다면 실제 발급 DC와 보존 구간을 확인합니다. 모든 실패가 동일 이벤트에 기록되는 것도 아닙니다.

## 5단계 — 실패를 원인별로 나누기

| 관찰 | 먼저 확인할 것 |
| --- | --- |
| 서비스 티켓 요청 실패 | 요청한 이름, SPN과 계정 매핑, 결과 코드 |
| 시간 관련 오류 | 클라이언트·DC·서비스의 시간 동기화 |
| NTLM으로 동작 | 앱의 Negotiate 결과, 이름·서비스 지원과 fallback 경로 |
| 티켓 발급은 성공했지만 접근 거부 | 대상 서비스의 권한과 요청 내용 |
| 예상과 다른 암호화 유형 | 클라이언트·서비스·계정 지원과 정책·호환성 |

오류 코드와 암호화 유형의 의미는 해당 Windows 버전의 Microsoft 문서에 대조합니다. 특정 암호화 유형 하나만으로 공격이나 정상 여부를 결정하지 않습니다.

## 6단계 — 공격 조건과 방어를 연결하기

| 공격 관점 | 필요한 조건의 예 | 방어·조사의 초점 |
| --- | --- | --- |
| Kerberoasting | 얻을 수 있는 서비스 티켓과 취약한 서비스 계정 비밀값 | 서비스 계정 비밀값·권한 관리, 발급 패턴과 정상 업무 비교 |
| AS-REP Roasting | 사전 인증을 요구하지 않는 계정 등 해당 조건 | 불필요한 사전 인증 예외 제거, 계정 구성과 요청 확인 |
| Pass-the-Ticket | 사용 가능한 티켓 자료의 확보 | 티켓 노출 경로, 실행 세션·출발지와 서비스 접근 |
| 티켓 위조 | 관련 키가 침해된 상황 | 키 침해 범위와 도메인 복구 절차 검토 |

이 표는 조건을 이해하는 학습용 분류입니다. 티켓 요청량이 많다는 사실만으로 Kerberoasting을 확정하지 않습니다. 위임은 서비스가 다른 서비스를 대신 이용하는 구조이므로 허용 대상·계정·실제 필요를 별도로 확인합니다.

## 완료 기준과 다음 단계

TGT, 서비스 티켓, SPN을 자기 말로 설명하고, 정상 접속 한 번의 클라이언트·DC·대상 기록을 연결합니다. 미수집 자료와 캐시 재사용 가능성도 남깁니다. 다음은 [AD 인증 조사](ad-investigation.html)와 [자격 증명 보호](credential-architecture.html)입니다.

추가 공식 자료: [klist](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/klist), [setspn](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/setspn), [4768](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4768), [4769](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4769), [4771](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4771), [MITRE Kerberoasting](https://attack.mitre.org/techniques/T1558/003/), [MITRE AS-REP Roasting](https://attack.mitre.org/techniques/T1558/004/), [MITRE Pass the Ticket](https://attack.mitre.org/techniques/T1550/003/).

## 참고자료

- [Microsoft — Kerberos authentication overview](https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview)
- [NTLM 인증과 공격 및 방어](ntlm.html)
