---
title: "NTLM 의심 행위 조사 플레이북"
description: "인증 자료 수집, Relay와 hash 재사용을 구분하고 실제 대상과 후속 행동을 확인합니다."
category: "playbooks"
updated: "2026-10-07"
tags: ["NTLM", "사고 대응", "플레이북"]
order: "21"
level: "입문"
---

## 적용 범위와 준비물

이례적인 NTLM 인증, 의심스러운 인증 유도, 자격 증명 접근 뒤의 인증 또는 인증 직후 설정 변경을 조사하는 절차입니다. [NTLM 전체 가이드](ntlm.html)를 먼저 읽으면 Relay와 Pass-the-Hash의 원리를 이해할 수 있습니다.

대상 장비의 인증 로그, 필요하면 DC의 검증 로그, 네트워크·프로세스 자료와 서비스 설정 정보가 필요합니다. 처음 실습할 때는 [가상 로그](first-investigation.html)의 NTLM 성공 사례를 사용합니다. 이 자료만으로 Relay나 Pass-the-Hash를 확정하는 것이 목표는 아닙니다.

## 1단계 — 인증 결과와 실제 대상 확인하기

대상 서비스가 있는 장비에서 4624·4625를 확인하고 인증 패키지·로그온 유형·계정·시각을 적습니다. 다음은 가상 로그의 필드에 맞춘 검색이며 실제 환경의 필드와 시간 범위로 수정합니다.

```spl
index=lab_logs
| spath
| where EventCode=4624 AND AuthenticationPackageName="NTLM"
| table _time ComputerName TargetUserName TargetDomainName LogonType IpAddress TargetLogonId
| sort 0 _time
```

**확인할 결과:** 어떤 계정이 어느 장비에 NTLM으로 로그온했는지입니다. LogonType 3은 네트워크 로그온이라는 뜻이며 Relay 또는 hash 재사용을 직접 증명하지 않습니다. 일부 필드가 비어 있으면 스키마와 원문부터 확인합니다.

## 2단계 — 자격 증명 검증과 서비스 접근 분리하기

4776은 자격 증명을 검증하는 장비의 기록입니다. 도메인 계정은 보통 DC, 로컬 계정은 해당 로컬 장비에서 확인합니다. 검증 결과·계정·Workstation을 보되 실제 접근 대상 서비스가 이 이벤트에 모두 표시되리라 기대하지 않습니다.

```spl
index=lab_logs
| spath
| where EventCode=4776
| table _time ComputerName TargetUserName Workstation Status
| sort 0 _time
```

`Status=0x0`은 검증 성공을 나타냅니다. 실제 서비스에서 어떤 권한으로 무엇을 했는지는 대상 로그로 확인합니다. 비슷한 시각의 성공·실패를 무조건 같은 인증 교환으로 묶지 않습니다.

## 3단계 — 인증 경로 표 만들기

| 역할 | 확보할 근거 |
| --- | --- |
| 원래 클라이언트 후보 | 호스트·주소·사용자·시각 |
| 검증 장비 | DC 또는 로컬 검증 이벤트 |
| 실제 서비스 대상 | 서비스 장비의 로그온·요청 기록 |
| 중간 장비 후보 | 같은 시각의 양쪽 연결과 관련 프로세스 |

NAT, 프록시, 정상 관리 서버와 계정 공유가 관찰값에 미치는 영향을 확인합니다. NTLM Operational 자료는 해당 감사 설정과 수집이 실제 적용된 경우에 보완 근거로 사용합니다. IP 불일치 하나만으로 중계가 있었다고 단정하지 않습니다.

## 4단계 — 가능한 공격 방식의 증거 비교하기

| 가설 | 더 필요한 관찰 | 단독으로 부족한 것 |
| --- | --- | --- |
| 인증 자료 캡처 | 인증이 향한 비정상 서비스, 캡처 지점과 교환 맥락 | NTLM 사용 자체 |
| NTLM Relay | 원래 인증과 대상 연결의 연계, 중간 시스템, 대상 서비스 조건 | 대상의 4624 한 개 |
| Pass-the-Hash | NT hash 노출 가능성, 해당 출발지의 실행·접근 증거와 인증 | 4776 성공만 존재 |
| 정상 관리 | 승인 내역, 계정 역할, 관리 출발지·작업 내용의 일치 | 알려진 관리자 계정 이름 |

LSASS 접근 이벤트도 정상 보안 소프트웨어나 진단 기능에서 발생할 수 있습니다. 실제 읽기 범위와 도구·계정·시각, 후속 인증을 조사해야 합니다. 인증 캡처 자료와 NT hash는 같은 값이 아니며 오프라인 암호 추측, Relay, hash 재사용의 조건도 다릅니다.

## 5단계 — 인증 뒤의 행동과 영향 확인하기

파일 접근, 서비스·예약 작업 생성, 원격 프로세스, AD 객체·권한 변경과 인증서 발급을 서비스별로 확인합니다. 예를 들어 같은 대상의 로그온 ID와 작업 생성 이벤트의 주체 로그온 ID를 비교하되 같은 장비·부팅 맥락인지 확인합니다.

**확인할 결과:** “인증 성공”과 “변경·실행·데이터 접근”을 별도 항목으로 기록합니다. 근거가 없는 후속 행위는 미확인으로 남깁니다. 가상 자료에서는 작업 생성과 프로세스 실행 기록을 볼 수 있지만 그 실행이 반드시 해당 작업에서 시작됐는지는 추가 연결 근거가 필요합니다.

## 6단계 — 서비스별 보호 상태 확인하기

| 대상 | 확인할 방어 조건 |
| --- | --- |
| SMB | 서버의 signing 요구, 클라이언트 정책과 실제 협상 |
| LDAP·LDAPS | LDAP signing, channel binding 적용과 실제 인증 경로 |
| HTTP·IIS·AD CS | EPA·채널 바인딩 관련 구성, 인증 방식과 노출된 엔드포인트 |
| 호스트 자격 증명 | 자격 증명 보호, 관리자 권한 범위와 재사용 조건 |

한 서비스의 signing 설정만 보고 다른 서비스도 보호된다고 결론 내리지 않습니다. 정확한 적용 조건과 Microsoft 원문은 [NTLM 전체 가이드](ntlm.html)의 서비스별 방어 절을 확인합니다. 설정 변경은 호환성 영향과 실제 차단 효과를 함께 검증합니다.

## 7단계 — 억제·복구와 재검증 기록하기

진행 중인 악용이 확인되면 관련 장비·인증 경로를 제한하고 필요한 증거를 보존합니다. 노출된 계정과 비밀값의 범위를 확인해 교체를 계획하고 활성 세션·지속성·AD 변경을 함께 처리합니다. 인증서가 악용됐다면 비밀번호 변경만으로 끝내지 않고 인증서와 발급·인증 경로를 별도로 검토합니다.

정상 업무가 유지되는지, 수정한 서비스가 예상대로 인증을 제한하는지, 필요한 감사가 계속 들어오는지 확인합니다.

## 완료 기준

원래 클라이언트·검증 장비·서비스 대상의 구분, 인증 및 후속 행동 타임라인, 가설별 근거와 반대 근거, 보호 설정과 조치 검증 계획을 남깁니다. **‘NTLM 사용 확인’과 ‘공격 방식 확인’은 별도의 결론**이어야 합니다.

추가 공식 문서: [Microsoft 4624](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624), [Microsoft 4776](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4776).

## 참고자료

- [NTLM 인증과 공격 및 방어 — 27개 원문 참고자료](ntlm.html)
- [Microsoft — AD CS NTLM Relay 완화](https://support.microsoft.com/en-us/servicing/os/windows-server/2021/07/kb5005413-mitigating-ntlm-relay-attacks-on-active-directory-certificate-services-ad-cs)
