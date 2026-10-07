---
title: "NTLM 인증과 공격 및 방어"
description: "인증 흐름과 버전 차이, Relay와 Pass-the-Hash, 서비스별 방어, 감사·탐지와 사고 대응을 정리합니다."
category: "identity"
updated: "2026-10-07"
tags: ["NTLM", "Active Directory", "인증 보안"]
order: "1"
level: "심화"
---

NTLM은 비밀번호에서 유도한 비밀값으로 서버의 challenge에 응답하는 Windows 인증 방식입니다. 비밀번호를 전송하지 않더라도 인증 중계나 hash 재사용으로 계정 권한이 악용될 수 있습니다. 안전한 운영에는 NTLM 의존성 축소, 서비스별 Relay 방어, 자격 증명 보호, 인증과 후속 행동의 탐지가 함께 필요합니다.

이 문서는 NTLM의 구성과 인증 흐름, 버전별 특징, 주요 공격 방식, 예방 설정, 감사와 탐지, 사고 대응 및 Kerberos 전환을 정리합니다. 공격을 설명할 때 인증 자료의 종류와 성공 조건을 구분하고, 방어 설정에는 적용 범위와 확인 방법을 함께 제시합니다.

## NTLM의 역할과 사용 환경

NTLM은 NT LAN Manager의 약자입니다. 도메인 계정, 로컬 계정, 컴퓨터 계정의 인증에 사용될 수 있으며 SMB, HTTP, LDAP 등 여러 애플리케이션 프로토콜 안에서 동작합니다. NTLM 전용 포트는 없습니다. 사용자 인증과 이후의 파일·디렉터리·관리 서비스 접근 권한은 별도로 판단됩니다. 〔[1](#ref-1), [2](#ref-2)〕

### Kerberos와 Negotiate

Active Directory에서는 Kerberos를 우선합니다. 애플리케이션의 Negotiate 또는 SPNEGO는 사용할 인증 방식을 협상하며, Kerberos를 사용할 수 없는 경우 NTLM로 fallback할 수 있습니다. 따라서 HTTP에 Negotiate가 표시되거나 앱에서 Windows Authentication을 사용한다는 사실만으로 실제 인증이 Kerberos라고 단정할 수 없습니다. 〔[1](#ref-1), [17](#ref-17)〕

기존 앱의 NTLM 직접 지정, workgroup·로컬 계정, 서비스 이름과 SPN 구성 문제, 일부 IP 주소 기반 접근 등은 NTLM 의존성을 남길 수 있습니다. SPN은 Kerberos에서 서비스 인스턴스를 식별하는 이름입니다. 올바른 DNS 이름과 SPN, 도메인 신뢰 및 시간 동기화는 Kerberos 운영에 중요합니다. 〔[1](#ref-1), [6](#ref-6)〕

### 용어와 역할

| 용어 | 의미 |
| --- | --- |
| Client | 인증을 시작하는 사용자 또는 컴퓨터의 장비 |
| Server 또는 Target | 인증을 받고 요청된 서비스의 권한을 적용하는 장비 |
| Domain Controller 또는 DC | 도메인 계정의 인증 정보를 검증하는 서버 |
| Authentication과 Authorization | 신원 확인과 접근 권한 결정 |
| Single sign on 또는 SSO | 로그온 후 보유한 자격 증명을 이용하는 통합 인증 |
| Mutual authentication | 클라이언트와 서버가 서로의 신원을 확인하는 상호 인증 |

## 인증 흐름과 자격 증명

NTLM은 challenge-response 방식으로, 연결 지향 인증에서는 세 가지 메시지를 교환합니다. 비밀번호와 원시 NT hash를 그대로 전송하는 대신 비밀값으로 계산한 응답을 보냅니다. 사용자·도메인 이름과 협상 정보 등은 외부 프로토콜의 보호 여부에 따라 관찰될 수 있습니다. 〔[2](#ref-2), [3](#ref-3), [4](#ref-4)〕

| 순서 | 메시지 | 동작 |
| --- | --- | --- |
| 1 | NEGOTIATE 또는 Type 1 | 클라이언트가 지원하는 인증·보안 기능을 알립니다. |
| 2 | CHALLENGE 또는 Type 2 | 서버가 임의의 challenge와 대상·협상 정보를 제공합니다. |
| 3 | AUTHENTICATE 또는 Type 3 | 클라이언트가 계정 정보와 계산한 response를 보냅니다. |

도메인 계정이면 대상 서버는 challenge-response와 계정 정보를 DC에 보내 검증을 요청할 수 있습니다. 로컬 계정이면 해당 컴퓨터의 계정 데이터로 검증합니다. 인증 성공 후 서버는 접근 토큰과 세션을 통해 계정의 권한을 적용합니다. 파일 서버가 인증을 DC에 확인하는 것과 파일 공유를 DC가 제공하는 것은 다른 역할입니다. 〔[2](#ref-2)〕

### NT hash와 NetNTLM 인증 자료

| 구분 | NT hash | NetNTLMv1 또는 NetNTLMv2 자료 |
| --- | --- | --- |
| 정체 | 비밀번호에서 유도한 장기 비밀값 | challenge와 response 및 관련 인증 정보 |
| 생성 또는 획득 | 비밀번호의 UTF-16LE 데이터에 MD4 적용 | 네트워크 인증 교환을 캡처 |
| 보안 의미 | 유출되면 새 NTLM 응답 생성 가능 | 비밀번호 추측 검증에 이용 가능 |
| 대표 악용 | Pass-the-Hash | 오프라인 cracking 또는 진행 중인 인증 Relay |

NetNTLMv2 자료를 얻었다고 원시 NT hash를 얻은 것은 아닙니다. 일반적인 Pass-the-Hash에 캡처한 response를 바로 넣어 사용할 수 없습니다. 또한 도메인 cached logon verifier는 오프라인 로그온 검증용 자료이며 원시 NT hash와 구분해야 합니다. 〔[3](#ref-3), [4](#ref-4), [11](#ref-11)〕

### 서버 challenge의 의미

과거 response를 새로운 challenge에 그대로 보내는 단순 Replay는 일반적으로 실패합니다. Relay는 대상 서버의 현재 challenge를 피해자에게 전달하고, 피해자가 만든 유효한 response를 같은 인증 흐름에 되돌리는 방식입니다. 실제 서버의 신원과 연결·서비스의 결합을 확인하지 못하면 새로운 challenge만으로 이 중계를 차단할 수 없습니다. 〔[2](#ref-2), [5](#ref-5)〕

## 버전과 세션 보안

| 구분 | 특징 | 운영 판단 |
| --- | --- | --- |
| LM | 매우 오래되고 취약한 비밀번호·응답 구조 | 사용과 저장 의존성 제거 |
| NTLMv1 | NT hash에 기반한 DES 계열 응답 계산 | 허용하지 않는 방향으로 정비 |
| NTLMv2 | HMAC-MD5 기반 응답과 클라이언트 challenge·시간·대상 정보 활용 | v1보다 개선됐지만 Relay·hash 유출 위험은 남음 |
| NTLM2 Session | NTLMv1의 extended session security를 지칭하는 용어 | 이름이 비슷해도 NTLMv2 인증과 같지 않음 |

NT hash 생성의 MD4와 NTLMv2 response 계산의 HMAC-MD5는 서로 다른 단계입니다. NTLMv1의 DES 기반 response를 “비밀번호 hash가 DES로 생성된다”라고 설명하면 부정확합니다. NTLMv2는 AES 기반 인증으로 바뀐 프로토콜도 아닙니다. 〔[3](#ref-3), [4](#ref-4), [22](#ref-22)〕

### Signing과 sealing 및 MIC

인증 이후 협상된 세션 키는 메시지 signing과 sealing에 사용될 수 있습니다. Signing은 무결성과 메시지 인증을 제공하고, sealing은 기밀성을 제공합니다. 실제 적용은 애플리케이션 프로토콜과 협상·요구 정책에 달려 있습니다. NTLM 인증을 사용했다는 사실만으로 모든 트래픽이 암호화되지는 않습니다. 〔[22](#ref-22), [26](#ref-26)〕

MIC는 Message Integrity Code로, 인증 과정의 주요 메시지를 무결성 검증하는 기능입니다. 협상 메시지 변조와 일부 downgrade 위험을 줄이는 역할이며, SMB 메시지 signing이나 TLS channel binding과 동일하지 않습니다. MIC가 있다는 이유만으로 모든 Relay가 차단되는 것도 아닙니다. 〔[22](#ref-22)〕

SMB signing 알고리즘은 SMB 버전에 따라 HMAC-SHA-256, AES-CMAC, AES-GMAC 등으로 달라질 수 있습니다. 이는 NTLMv2 response가 HMAC-MD5 기반이라는 설명과 충돌하지 않습니다. 인증 응답과 SMB 메시지 보호는 서로 다른 단계입니다. 〔[6](#ref-6)〕

### 상호 인증과 채널 보호

NTLM 자체는 Kerberos처럼 일반적인 서버 신원 보장을 제공하지 못합니다. TLS는 전송 암호화와 서버 인증을 제공하지만, 그 안의 NTLM 인증을 다른 TLS 연결로 전달하지 못하게 하려면 CBT 또는 EPA 같은 결합 보호가 중요합니다. 〔[7](#ref-7), [16](#ref-16)〕

### 현재 Windows의 변화

Microsoft는 NTLM 계열을 deprecated 상태로 두고 의존성 제거를 권고합니다. NTLMv1 프로토콜은 Windows 11 24H2와 Windows Server 2025부터 제거됐습니다. 이것은 모든 Windows에서 NTLMv2까지 사라졌다는 뜻은 아닙니다. 실제 인증 동작은 OS·업데이트·정책·앱 의존성을 함께 확인해야 합니다. 〔[17](#ref-17)〕

## 인증 자료 수집과 인증 유도 공격

### 이름 해석 위조

LLMNR, NBT-NS, mDNS는 로컬 네트워크의 이름 해석에 이용됩니다. 공격자는 요청된 이름의 서버인 것처럼 응답해 클라이언트를 자기 장비로 연결시킬 수 있습니다. LLMNR는 주로 multicast, NBT-NS는 broadcast를 사용합니다. 질의 순서와 fallback은 Windows 정책과 네트워크 구성에 따라 달라집니다. 〔[5](#ref-5), [9](#ref-9)〕

잘못 입력한 공유 서버 이름을 공격자가 응답하면 클라이언트가 가짜 SMB 서버에 연결해 인증할 수 있습니다. 공격자가 확보하는 것은 뒤이어 발생한 NTLM challenge-response입니다. 이름 해석 질의 패킷 자체에 비밀번호나 NT hash가 들어 있는 것은 아닙니다. 〔[5](#ref-5), [8](#ref-8)〕

### 가짜 서비스와 WPAD

가짜 SMB·HTTP 서비스, 공격자 주소를 가리키는 UNC 경로, 악성 문서나 링크 등의 접근 유도는 인증 자료 노출로 이어질 수 있습니다. WPAD나 프록시 자동 탐색이 부적절하게 구성된 환경에서는 가짜 프록시와 인증 요청이 추가 경로가 될 수 있습니다. 인증 여부는 애플리케이션과 Windows의 신뢰 영역·정책에 따라 달라집니다. 〔[8](#ref-8)〕

### 강제 인증 또는 authentication coercion

공격자가 노출된 RPC나 서비스 기능을 악용해 다른 Windows 장비가 지정한 주소로 접속하고 인증하도록 유도하는 방식입니다. 공격자가 인증을 요청하는 방향과 실제 인증이 나가는 방향이 다를 수 있습니다. 사용자 계정뿐 아니라 서버·DC의 컴퓨터 계정 인증도 표적이 될 수 있습니다. 〔[23](#ref-23)〕

LLMNR를 껐어도 강제 인증이나 다른 유도 경로가 남으면 Relay가 가능할 수 있습니다. 관련 취약점 패치, 불필요한 서비스 제거, 관리 프로토콜 접근 제한, 서버의 불필요한 outbound 연결 차단을 대상 서비스의 signing·EPA와 함께 적용합니다. 〔[5](#ref-5), [23](#ref-23)〕

### 자료 수집 이후의 선택

| 방식 | 추가로 필요한 것 | 결과 |
| --- | --- | --- |
| 오프라인 cracking | 캡처 자료와 비밀번호 후보 | 후보로 response를 재계산해 비밀번호 추측 |
| 실시간 Relay | 진행 중인 인증과 중계 가능한 대상 | 대상 서버에 피해자 계정으로 인증 |
| NT hash 탈취 | 메모리·계정 저장소 등 접근 | 새 응답을 만들 수 있는 비밀값 확보 |

긴 고유 비밀번호는 오프라인 추측을 어렵게 하지만, 유효한 인증을 전달하는 Relay를 직접 막지는 않습니다. 잠금 정책 역시 공격자가 비밀번호를 추측하지 않는 Relay·Pass-the-Hash를 일반적인 로그인 시도와 같은 방식으로 막지 못합니다. 〔[5](#ref-5), [11](#ref-11)〕

## NTLM Relay의 구조와 성공 조건

Relay 공격은 클라이언트 C, 공격자 A, 실제 대상 T 사이에서 발생합니다. C가 A에게 인증을 시작하면 A는 T에도 연결합니다. A는 T의 challenge를 C에게 전달하고, C의 response를 T로 보내 검증받습니다. 서버가 추가 보호로 중계를 막지 못하면 A의 연결이 C 계정으로 인증됩니다. 〔[2](#ref-2), [5](#ref-5), [10](#ref-10)〕

### 양쪽에서 보이는 신원

피해자 관점에서는 공격자가 원래 접속하려던 서버나 인증 서비스인 것처럼 행동합니다. 실제 대상 서버 관점에서는 공격자의 연결이 피해자의 사용자 또는 컴퓨터 계정으로 인증됩니다. 대상 로그의 계정 이름과 실제 TCP 연결의 출발지 장비가 서로 다른 맥락을 가질 수 있습니다.

### 성공에 영향을 주는 조건

- 피해자가 공격자가 제어하거나 중간에 관여하는 경로로 NTLM 인증을 수행합니다.

- 공격자가 도달 가능한 대상 서비스가 해당 NTLM 인증을 받아 검증할 수 있습니다.

- signing, channel binding, EPA, 대상 검증 등의 보호가 해당 중계와 후속 동작을 막지 못합니다.

- 인증된 계정에 공격자가 수행하려는 동작의 권한이 있습니다.

공격자는 피해자의 평문 비밀번호나 NT hash를 반드시 알 필요가 없습니다. NTLMv2라도 signing·바인딩 보호가 불충분하면 Relay 위험은 남습니다. 인증 성공 이후 관리 기능이나 데이터 접근을 실제로 사용할 수 있는지는 서비스 보호와 계정 권한에 따라 달라집니다. 〔[5](#ref-5), [6](#ref-6), [7](#ref-7)〕

### 동일 프로토콜과 다른 프로토콜로의 중계

| 대상 서비스 | 대표 영향 | 확인할 보호 |
| --- | --- | --- |
| SMB | 공유 접근과 허용된 원격 관리 동작 | 대상 서버의 SMB signing 필수 요구 |
| LDAP | 허용된 AD 객체·권한 변경 | 비 TLS SASL signing 요구 |
| LDAPS 또는 STARTTLS | TLS 연결을 통한 디렉터리 접근 | SASL 인증의 channel binding 요구 |
| HTTP Windows 인증 | 웹 앱·관리 서비스에서 계정 권한 악용 | EPA와 HTTPS 및 서비스 바인딩 |
| AD CS 웹 등록 서비스 | 권한·템플릿 조건에 따른 인증서 발급 악용 | EPA·HTTPS와 NTLM 제한 |

SMB에서 시작한 인증을 HTTP 또는 LDAP 등으로 중계하는 cross-protocol Relay도 고려해야 합니다. 프로토콜·클라이언트가 설정하는 flags와 보호 정보, 대상 요구가 호환돼야 하므로 모든 조합이 항상 성공하지는 않습니다. SMB만 보호하고 웹·디렉터리 서비스를 방치하면 다른 대상이 남을 수 있습니다. 〔[5](#ref-5), [10](#ref-10), [23](#ref-23)〕

## Pass the Hash와 후속 공격

### Pass the Hash의 원리

Pass-the-Hash는 이미 확보한 NT hash를 사용해 정상 challenge에 대한 새 NTLM response를 만드는 방식입니다. 비밀번호를 알아내는 과정이나 피해자의 현재 인증이 필요하지 않습니다. 원시 hash가 모든 서버에 그대로 전송되는 것으로 이해하면 부정확합니다. 〔[3](#ref-3), [4](#ref-4), [11](#ref-11)〕

| 항목 | NTLM Relay | Pass the Hash |
| --- | --- | --- |
| 필요한 핵심 자료 | 피해자의 현재 인증 교환 | 계정의 NT hash |
| 피해자의 실시간 참여 | 인증 흐름 필요 | 보통 필요 없음 |
| 비밀번호 cracking | 필수 아님 | 필수 아님 |
| 인증 수행 방식 | challenge와 response 중계 | 보유한 hash로 새 response 계산 |
| 주요 방어 | 서비스 signing과 바인딩 | hash 유출·재사용 방지와 NTLM 제한 |

로컬 관리자 비밀번호를 여러 장비에서 재사용하면 한 장비에서 탈취한 NT hash가 다른 장비에서도 통할 수 있습니다. SMB signing은 Relay의 후속 동작을 막지만, 비밀값을 가진 공격자는 세션 키를 계산해 서명할 수 있으므로 Pass-the-Hash를 같은 원리로 차단하지 못합니다. 〔[6](#ref-6), [11](#ref-11), [19](#ref-19)〕

### 권한과 공격 영향

인증된 계정의 권한 범위에서 공유 파일 접근, 원격 관리, 명령 실행, AD 변경 등이 가능할 수 있습니다. 원격 명령 실행에는 일반적으로 해당 대상의 관리자 권한과 적절한 실행 경로가 필요합니다. 네트워크 연결, UAC·로그온 제한, 서비스 설정도 결과에 영향을 줍니다. 인증 성공이 자동 권한 상승을 의미하지는 않습니다.

Domain Admins, 높은 권한의 서비스 계정, DC·서버 컴퓨터 계정은 높은 영향을 줄 수 있습니다. 위험도는 그룹 이름만으로 결정하지 않고 실제 대상 권한, 위임 설정, 인증 제한을 평가합니다. 컴퓨터 계정은 종종 이름 끝에 $가 표시됩니다.

### 구별해야 할 후속 기술

Credential dumping은 hash 등 비밀정보를 얻는 과정이고, Pass-the-Hash는 얻은 값을 사용하는 과정입니다. DCSync는 AD 복제 권한으로 DC에서 계정 비밀정보를 가져오는 기술입니다. Overpass-the-Hash는 비밀값을 Kerberos 인증에 이용해 티켓을 획득하는 방식이며, Kerberoasting은 서비스 티켓 자료의 오프라인 추측입니다. 서로 연계될 수 있어도 같은 동작은 아닙니다. 〔[11](#ref-11), [12](#ref-12), [27](#ref-27)〕

Responder는 이름 해석 위조와 가짜 인증 서비스로 유도·수집하는 도구이고, Impacket의 ntlmrelayx는 Relay 도구입니다. Mimikatz 등은 자격 증명 접근·재사용 기능을 제공하며, hashcat이나 John the Ripper는 비밀번호 추측에 쓰입니다. 도구 파일명 하나보다 실제 행위와 인증 흐름이 더 유용한 조사 근거입니다. 〔[5](#ref-5), [8](#ref-8), [10](#ref-10), [11](#ref-11)〕

## 서비스별 Relay 방어

### SMB signing을 필수로 요구하기

SMB signing은 세션 키로 메시지의 무결성과 인증을 검증합니다. 대상 서버가 signing을 요구하면 hash나 세션 키를 모르는 일반적인 Relay 공격자가 유효한 SMB 후속 메시지를 만들기 어렵습니다. Signing 지원 또는 enabled와 required는 구별해야 합니다. Signing 자체는 데이터 암호화가 아닙니다. 〔[6](#ref-6)〕

GPO의 Security Options에서 Microsoft network client 및 server의 Digitally sign communications always 정책을 점검합니다. 서버와 클라이언트 모두에 필요한 정책을 적용하고 실제 연결에서 서명이 사용되는지 확인합니다. 〔[6](#ref-6)〕

### LDAP signing과 channel binding

비 TLS SASL LDAP에는 signing을 필수로 요구합니다. Domain controller LDAP server signing requirements가 핵심 정책입니다. TLS로 보호된 SASL LDAP에는 LDAP server channel binding token requirements도 확인합니다. CBT는 내부 인증을 외부 TLS 채널 정보에 결합하여 다른 채널에서 전달된 인증을 거부하도록 합니다. 〔[7](#ref-7), [13](#ref-13)〕

LDAPS 또는 STARTTLS를 사용한다는 사실만으로 NTLM Relay 방어가 완성되지는 않습니다. Simple bind over TLS는 같은 CBT 적용 방식이 아니며, TLS 인증서와 이름 검증이 중요합니다. Signing, TLS, CBT는 각각 기능과 적용 범위가 다릅니다. 〔[7](#ref-7), [13](#ref-13)〕

### HTTP와 AD CS의 EPA

IIS의 Extended Protection for Authentication은 CBT와 서비스 이름 바인딩으로 인증 Relay를 줄입니다. 서비스·프록시·로드밸런서의 TLS 종료 방식과 SPN 구성에 맞춰 요구 정책을 적용해야 합니다. HTTPS만 켜고 EPA를 적용하지 않으면 NTLM 인증 중계 경로가 남을 수 있습니다. 〔[16](#ref-16)〕

AD CS의 웹 등록 서비스와 인증서 등록 웹 서비스는 별도 점검 대상입니다. Microsoft는 EPA와 SSL 요구, 필요한 NTLM 제한을 제시합니다. 인증서 발급 권한·템플릿과 웹 서비스 구성을 함께 확인합니다. 〔[23](#ref-23)〕

### 설정 확인 예시

다음 PowerShell 명령은 SMB의 현재 signing 요구 여부를 읽는 예시입니다. OS 버전과 실제 활성 세션도 함께 확인합니다.

```powershell
Get-SmbServerConfiguration | Select-Object RequireSecuritySignature
Get-SmbClientConfiguration | Select-Object RequireSecuritySignature
```

LDAP에는 signing·CBT 정책 결과와 DC 감사 이벤트, HTTP에는 EPA 요구와 프록시 경로를 확인합니다. 설정 화면의 값뿐 아니라 정상 인증 성공과 보호 없는 접근 거부를 시험해 실제 적용을 검증합니다.

## 자격 증명과 인증 경로 보호

### Hash 유출과 재사용 줄이기

Windows LAPS로 장비별 로컬 관리자 비밀번호를 고유하게 관리하고 회전합니다. 비밀번호를 읽을 수 있는 권한과 저장 보호도 제한합니다. LAPS는 한 장비의 비밀값이 여러 장비로 재사용되는 범위를 줄이며, 그 장비 자체가 침해됐을 때 모든 공격을 막는 것은 아닙니다. 〔[19](#ref-19)〕

지원되는 장비에는 Credential Guard와 LSASS 보호를 검토합니다. Credential Guard는 VBS로 일부 도메인 자격 증명을 격리하지만 SAM·AD 데이터베이스 자체를 보호하지는 않습니다. DC·Exchange 및 가상화 환경의 지원 조건을 확인해야 하며, 이미 탈취된 hash를 무효화하거나 모든 Relay를 막는 조치는 아닙니다. 〔[18](#ref-18)〕

고권한 계정의 일반 사용자 장비 로그온을 줄이고 전용 관리 장비와 분리된 관리 계정을 사용합니다. 서비스 계정은 필요한 권한만 부여하고 가능한 경우 관리형 서비스 계정을 검토합니다. 관리자 공유와 원격 관리 프로토콜은 승인된 출발지로 제한합니다.

### 이름 해석과 outbound 인증 줄이기

GPO의 DNS Client에서 Turn off multicast name resolution을 Enabled로 설정하면 LLMNR가 비활성화됩니다. NBT-NS와 불필요한 mDNS·WPAD 경로는 별도로 확인합니다. 해당 이름 해석이 필요한 앱은 DNS와 정상 서비스 등록을 정비한 뒤 전환합니다. 〔[5](#ref-5), [9](#ref-9)〕

업무상 필요 없는 외부·사용자 장비 방향의 SMB 연결과 서버 outbound 인증을 제한합니다. 같은 subnet에서 일어나는 LLMNR 위조는 인터넷 경계만 감시해서는 보이지 않을 수 있습니다. 내부 센서의 수집 범위와 east-west 트래픽 관찰도 확인합니다.

### 정책 점검 행렬

| 영역 | 확인할 설정 | 보호 목표 |
| --- | --- | --- |
| 구형 인증 | LAN Manager authentication level과 LM·NTLMv1 의존성 | 취약한 구형 응답 제한 |
| NTLM 흐름 | Restrict NTLM의 outgoing·incoming·domain 정책 | 사용 감사 후 필요한 경로 제한 |
| 로컬 관리자 | LAPS와 네트워크·원격 로그온 권한 | 비밀값 재사용과 원격 영향 감소 |
| 고권한 계정 | 관리 계층 분리와 권한 최소화 | 계정 노출과 침해 영향 제한 |
| 관리 서비스 | SMB·RPC·WinRM 등 도달성 | 불필요한 인증·실행 경로 축소 |

LAN Manager authentication level에서 NTLMv2만 허용하는 설정은 NTLMv1 의존성을 줄이는 단계입니다. 이 값만으로 NTLMv2 Relay나 Pass-the-Hash를 해결할 수는 없습니다. 〔[25](#ref-25)〕

## 감사 설정과 수집할 증거

탐지에는 인증 출발지, 중간 장비, 대상 서비스, 사용 계정, 결과와 후속 행동이 필요합니다. Windows Security 로그, NTLM Operational, 서비스 로그, EDR·Sysmon과 네트워크 자료를 함께 수집합니다. 감사 정책을 켰어도 로그 전달이나 보존이 빠지면 조사 증거가 남지 않습니다.

| 증거 | 주요 내용 | 해석 범위 |
| --- | --- | --- |
| Security 4624와 4625 | 로그온 성공·실패, 계정, 인증 패키지, LogonType | 대상 장비에서 NTLM 사용과 이례적 로그인 확인 |
| Security 4776 | NTLM 자격 증명 검증과 결과 코드 | 도메인 계정은 DC, 로컬 계정은 검증 장비 확인 |
| NTLM Operational 8004 | 도메인 NTLM 인증 관련 보강 정보 | DC의 NTLM 감사 설정 필요 |
| 7045와 4688 | 새 서비스 설치와 프로세스 실행 | 원격 인증 이후 실행 행위 확인 |
| 5136과 4662 | AD 객체 변경과 접근 | 감사 정책 및 필요한 객체 SACL 설정 |
| Sysmon 1과 3 및 10 | 프로세스, 네트워크 연결, 프로세스 접근 | 설정된 필터·기능에서만 기록 |
| 네트워크·서비스 로그 | 이름 해석 응답, IP·포트·시간, 요청 결과 | 실제 연결 경로와 사용된 서비스 확인 |

### Windows 감사의 기본 구성

Logon 감사와 Credential Validation 감사로 인증 이벤트를 확보합니다. Restrict NTLM의 Audit incoming, Outgoing Audit all, Audit NTLM authentication in this domain 정책을 역할에 맞게 적용합니다. DC의 8004 설정은 도메인 NTLM 조사에 유용하며 Microsoft Windows NTLM Operational 채널을 수집 대상으로 포함합니다. 〔[14](#ref-14), [15](#ref-15), [20](#ref-20), [24](#ref-24)〕

Sysmon network connection 이벤트 3은 기본으로 비활성화돼 있으므로 수집 설정을 확인합니다. 이벤트 10의 LSASS 접근은 비밀정보 탈취 조사에 유용하지만 정상 보안·진단 프로그램도 접근하므로 프로세스·서명·권한·후속 행동을 함께 판단합니다. 〔[21](#ref-21)〕

### 로그 해석에서의 한계

4624의 IP와 workstation 필드는 인증 문맥에 따라 비어 있을 수 있습니다. 4776에는 실제 대상 서버 정보가 없고, 패키지 이름의 V1_0은 NTLMv1 사용의 증거가 아닙니다. NTLM과 LogonType 3의 조합만으로 Relay 또는 Pass-the-Hash를 확정할 수도 없습니다. 〔[14](#ref-14), [15](#ref-15)〕

TLS 내부 인증 자료는 수동 패킷 수집만으로 보이지 않을 수 있습니다. 센서 위치와 패킷 손실, 시간대·시각 동기화, NAT·프록시·서비스 계정의 정상 패턴을 확인한 뒤 자료를 연계합니다.

## 탐지와 사고 대응

### 행위 기반 탐지

| 관찰할 조합 | 조사할 의미 |
| --- | --- |
| 여러 이름에 응답하는 이례적 장비와 후속 SMB·HTTP 인증 | 이름 해석 위조와 가짜 인증 서비스 가능성 |
| 클라이언트에서 중간 장비로 인증 직후 중간 장비에서 대상 서버로 연결 | Relay 경로 가능성 |
| 서버·DC의 이례적 outbound 인증과 새 LDAP·HTTP 세션 | 강제 인증 및 컴퓨터 계정 Relay 가능성 |
| LSASS 접근 또는 자격 증명 유출 뒤 여러 대상의 NTLM 인증 | Pass-the-Hash 가능성 |
| 인증 직후 서비스 설치·공유 접근·AD 변경·인증서 발급 | 인증된 세션의 후속 악용 가능성 |

단일 징후는 조사 우선순위이며 확정 결론은 아닙니다. 허용된 관리 장비·프록시·스캐너와 비교하고, 동일 계정과 실제 출발지 연결 및 시간 흐름을 대조합니다. LLMNR나 NTLM 트래픽 자체는 정상 업무에서도 발생할 수 있습니다. 〔[5](#ref-5), [11](#ref-11), [14](#ref-14), [15](#ref-15)〕

### 조사 순서

- 의심 시점과 시간대를 고정하고 원래 클라이언트, 중간 장비, 대상 서비스를 식별합니다.

- 이름 해석 결과와 실제 IP 연결을 확인하고 대상 계정의 인증·검증 기록을 연결합니다.

- 계정의 실제 권한과 signing·CBT·EPA 요구 여부를 확인합니다.

- 파일 접근, 명령 실행, AD 변경, 인증서 발급 등 후속 동작으로 영향 범위를 확정합니다.

- 캡처만 발생했는지, Relay가 사용됐는지, NT hash 유출·재사용까지 있었는지 구분합니다.

### 사고 대응과 복구

의심 장비와 관련 인증 경로를 격리하거나 제한하고 필요한 로그·패킷·메모리 증거를 보존합니다. 침해 계정과 자격 증명 노출 범위를 확인한 뒤 영향받은 비밀번호와 서비스 비밀값을 회전합니다. 활성 세션·토큰, 생성된 서비스와 계정, 변경된 AD 권한도 정리해야 합니다.

인증서 발급이 악용됐다면 비밀번호 변경만으로 복구가 끝나지 않습니다. 발급된 인증서의 확인·폐기와 인증서 인증 경로를 점검합니다. AD 복제 권한이나 DC 비밀정보가 노출됐다면 도메인 수준 복구 계획으로 범위를 확대합니다. 〔[12](#ref-12), [23](#ref-23)〕

재발 원인이 된 이름 해석·강제 인증·Relay 대상 설정과 hash 보호를 수정하고, 정상 업무 및 차단 검증을 수행합니다. 의심 연결 수가 줄었다는 결과와 침해 계정·지속성·권한이 제거됐다는 결과는 각각 확인합니다.

## NTLM 축소와 운영 검증

### Kerberos로 전환하는 순서

- 감사 로그로 NTLM을 사용하는 계정·클라이언트·서버·앱과 인증 이유를 식별합니다.

- DNS 이름, SPN, 도메인 신뢰, 시각 동기화와 앱의 인증 설정을 정비합니다.

- 직접 NTLM 지정 대신 Negotiate와 Kerberos 지원을 적용하고 실제 인증 패키지를 확인합니다.

- 구형 인증을 제거하고 SMB·LDAP·HTTP의 Relay 방어와 자격 증명 보호를 적용합니다.

- 제한된 시험 대상에서 incoming·outgoing·domain NTLM 차단을 검증한 뒤 확대합니다.

- 필요한 예외는 대상·소유자·업무 사유·만료일을 기록하고 재평가합니다.

Negotiate는 Kerberos를 우선하도록 돕지만 fallback을 자동으로 제거하지는 않습니다. 공유를 IP로 접속하지 않는 방식과 정상 SPN 사용을 정비하고, 성공 로그에서 Kerberos 전환을 확인해야 합니다. NAS·비 Windows 장비·기존 앱도 검증 대상에 포함합니다. 〔[1](#ref-1), [6](#ref-6), [17](#ref-17), [24](#ref-24)〕

### 운영 검증 목록

| 검증 항목 | 성공 기준 |
| --- | --- |
| 수집과 시간 | 대상 인증·DC 검증·후속 이벤트가 누락 없이 연결됨 |
| 서비스 보호 | 보호 요구가 실제 연결에 적용되고 정상 업무는 성공함 |
| 자격 증명 | 장비별 로컬 관리자 비밀값과 고권한 로그온이 관리됨 |
| NTLM 축소 | 사용량뿐 아니라 허용 경로·예외의 범위가 감소함 |
| 대응 준비 | 계정 회전·세션 제거·AD 및 인증서 변경 복구 절차가 준비됨 |

### 핵심 개념 요약

NT hash는 장기 비밀값이고, NetNTLM은 인증 교환에서 계산한 자료입니다. Relay는 현재 인증을 중계하며, Pass-the-Hash는 보유한 비밀값으로 새 인증을 수행합니다. 긴 비밀번호와 NTLMv2는 추측 저항을 개선해도 Relay를 직접 제거하지는 않습니다.

Signing은 메시지 무결성, TLS는 전송 보호, CBT와 EPA는 인증과 채널·서비스의 결합을 담당합니다. LLMNR 비활성화는 특정 유도 경로를 줄이는 조치입니다. Kerberos 전환, 서비스별 보호, 비밀정보 노출 방지, 권한 최소화와 행위 탐지를 함께 적용해야 합니다.

## 참고자료

본문의 대괄호 번호는 아래 원문에 대응합니다. Microsoft 공식 문서, MITRE ATT&CK, 도구의 원본 저장소를 사용했습니다. 문서 제목을 선택하면 원문으로 이동합니다. 확인 기준일은 2026년 10월 7일입니다.

<span id="ref-1">[1]</span> [Microsoft Learn  NTLM overview NTLM overview](https://learn.microsoft.com/en-us/windows-server/security/kerberos/ntlm-overview)

<span id="ref-2">[2]</span> [Microsoft Open Specifications  NTLM Connection Oriented Call Flow NTLM Connection Oriented Call Flow](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/1fbf5c3b-04c1-4591-a4be-9dc232c4744b)

<span id="ref-3">[3]</span> [Microsoft Open Specifications  NTLM v1 Authentication NTLM v1 Authentication](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/464551a8-9fc4-428e-b3d3-bc5bfb2e73a5)

<span id="ref-4">[4]</span> [Microsoft Open Specifications  NTLM v2 Authentication NTLM v2 Authentication](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/5e550938-91d4-459f-b67d-75d70009e3f3)

<span id="ref-5">[5]</span> [MITRE ATT&CK  T1557.001 Name Resolution Poisoning and SMB Relay T1557.001 Name Resolution Poisoning and SMB Relay](https://attack.mitre.org/techniques/T1557/001/)

<span id="ref-6">[6]</span> [Microsoft Learn  Overview of Server Message Block signing Overview of Server Message Block signing](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-signing-overview)

<span id="ref-7">[7]</span> [Microsoft Learn  LDAP Channel Binding in Active Directory LDAP Channel Binding in Active Directory](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/ldap-channel-binding)

<span id="ref-8">[8]</span> [lgandx  Responder original repository Responder original repository](https://github.com/lgandx/Responder)

<span id="ref-9">[9]</span> [Microsoft Learn  ADMX DnsClient Policy CSP ADMX DnsClient Policy CSP](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-admx-dnsclient)

<span id="ref-10">[10]</span> [Fortra  Impacket ntlmrelayx source Impacket ntlmrelayx source](https://github.com/fortra/impacket/blob/master/examples/ntlmrelayx.py)

<span id="ref-11">[11]</span> [MITRE ATT&CK  T1550.002 Pass the Hash T1550.002 Pass the Hash](https://attack.mitre.org/techniques/T1550/002/)

<span id="ref-12">[12]</span> [MITRE ATT&CK  T1003.006 DCSync T1003.006 DCSync](https://attack.mitre.org/techniques/T1003/006/)

<span id="ref-13">[13]</span> [Microsoft Learn  LDAP session security settings after ADV190023 LDAP session security settings after ADV190023](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/ldap-session-security-settings-requirements-adv190023)

<span id="ref-14">[14]</span> [Microsoft Learn  Security event 4624 Security event 4624](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624)

<span id="ref-15">[15]</span> [Microsoft Learn  Security event 4776 Security event 4776](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4776)

<span id="ref-16">[16]</span> [Microsoft Learn  Windows Extended Protection for IIS Windows Extended Protection for IIS](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/security/authentication/windowsauthentication/extendedprotection/)

<span id="ref-17">[17]</span> [Microsoft Learn  Deprecated features and NTLMv1 removal Deprecated features and NTLMv1 removal](https://learn.microsoft.com/en-us/windows/whats-new/deprecated-features)

<span id="ref-18">[18]</span> [Microsoft Learn  Credential Guard overview Credential Guard overview](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-guard/)

<span id="ref-19">[19]</span> [Microsoft Learn  Windows LAPS overview Windows LAPS overview](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview)

<span id="ref-20">[20]</span> [Microsoft Learn  Configure Windows event auditing and NTLM 8004 Configure Windows event auditing and NTLM 8004](https://learn.microsoft.com/en-us/defender-for-identity/deploy/configure-windows-event-collection)

<span id="ref-21">[21]</span> [Microsoft Sysinternals  Sysmon events and configuration Sysmon events and configuration](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)

<span id="ref-22">[22]</span> [Microsoft Open Specifications  NTLM Security Considerations for Implementers NTLM Security Considerations for Implementers](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/1e846608-4c5f-41f4-8454-1b91af8a755b)

<span id="ref-23">[23]</span> [Microsoft Support  Mitigating NTLM Relay attacks on AD CS Mitigating NTLM Relay attacks on AD CS](https://support.microsoft.com/en-us/servicing/os/windows-server/2021/07/kb5005413-mitigating-ntlm-relay-attacks-on-active-directory-certificate-services-ad-cs)

<span id="ref-24">[24]</span> [Microsoft Learn  Restrict NTLM outgoing traffic policy Restrict NTLM outgoing traffic policy](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/network-security-restrict-ntlm-outgoing-ntlm-traffic-to-remote-servers)

<span id="ref-25">[25]</span> [Microsoft Learn  LAN Manager authentication level policy LAN Manager authentication level policy](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/network-security-lan-manager-authentication-level)

<span id="ref-26">[26]</span> [Microsoft Open Specifications  NTLM Session Security Details NTLM Session Security Details](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/d1c86e81-eb66-47fd-8a6f-970050121347)

<span id="ref-27">[27]</span> [MITRE ATT&CK  T1558.003 Kerberoasting T1558.003 Kerberoasting](https://attack.mitre.org/techniques/T1558/003/)
