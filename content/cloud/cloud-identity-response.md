---
title: "클라우드 계정·세션·토큰 침해 조사"
description: "AiTM, device code phishing, 앱 동의와 서비스 계정 악용을 구분하고 Entra·SaaS 증거와 세션 대응을 연결합니다."
category: "cloud"
updated: "2026-10-08"
tags: ["Entra ID", "토큰", "SaaS"]
order: "36"
level: "기초 · 실무 확장"
---

## 목표와 준비물

온프레미스의 NT hash와 Kerberos 티켓에 더해 클라우드의 access token, refresh token, 앱 세션과 워크로드 자격 증명을 구분합니다. 준비물은 시험 테넌트 또는 익명화한 로그인·감사 로그, 계정·앱 목록과 읽기 권한입니다. 아래는 **학습용 조사 절차**이며 실제 침해를 재현하기 위한 피싱 지침이 아닙니다.

## 1단계 — 인증 자료와 공격 경로 나누기

| 대상 | 의미 | 조사 방향 |
| --- | --- | --- |
| Access token | 특정 리소스에 대한 접근 권한 자료 | 대상 리소스·권한·수명과 실제 API 사용 |
| Refresh token | 새 토큰을 얻는 데 쓰이는 자료 | 세션 갱신·철회와 재인증 |
| 앱 세션 쿠키 | 앱이 관리하는 로그인 상태 | 앱 자체 세션 종료·보존 정책 |
| OAuth 동의·앱 권한 | 앱에 위임되거나 부여된 접근 범위 | 승인자·권한·사용·철회 |
| 서비스 principal·관리 ID | 사람이 아닌 워크로드의 신원 | 자격 증명·역할 변경과 실행 환경 |

AiTM은 중간에서 인증 흐름을 악용하는 방식이고, device code phishing은 사용자가 공격자 측 흐름에 필요한 코드를 정상 인증 페이지에 입력하도록 유도하는 방식입니다. 정상 도메인에서 로그인했다는 사실만으로 사용 의도가 정당했다고 결론 내리지 않습니다. 앱 동의 악용은 토큰 탈취와 별도 경로로 검토합니다. [Microsoft 사례](https://www.microsoft.com/en-us/security/blog/2026/09/22/unmasking-eviltokens-getting-to-the-root-of-device-code-phishing/).

## 2단계 — 네 종류의 로그 확보하기

Entra의 사용자 로그인(대화형·비대화형), 워크로드 로그인, 디렉터리 감사, 사용한 SaaS의 활동 감사를 구분합니다. 수집 범위·보존·내보내기·요금제는 테넌트별로 확인합니다. 로그인 기록만으로 메일 열람이나 파일 유출 범위를 확정할 수 없습니다.

사건 계정의 object ID, tenant ID, 앱 ID, 리소스, 시각·시간대, IP, 장치 정보, 인증 방식, Conditional Access 결과와 correlation ID를 기록합니다. 필드가 없으면 ‘미수집’으로 표시합니다. 원문 토큰·쿠키·비밀키는 분석 노트나 외부 서비스에 붙이지 않습니다.

## 3단계 — 로그인 전후의 행동 연결하기

1. 신고 메일·메신저의 수신 및 클릭 시각을 보존합니다.
2. 로그인 방식·대상 앱·새 장치·이상 위치를 정상 사용과 비교합니다.
3. 이어진 앱 동의, 자격 증명 등록, 디렉터리 역할 변경을 확인합니다.
4. 메일 규칙·전달, 파일 공유·다운로드, API 활동을 서비스 감사에서 조사합니다.
5. 관련 사용자·앱·장치로 범위를 확장하되 근거와 기간을 기록합니다.

VPN, 모바일 망, 프록시 때문에 IP·위치는 변할 수 있습니다. MFA 성공도 정상 의도의 증거는 아닙니다. 반대로 장치 정보 부재나 낯선 국가 하나만으로 침해를 확정하지 않습니다.

## 4단계 — 의심 후보와 정상 업무 비교하기

| 후보 | 추가 확인 | 가능한 정상 설명 |
| --- | --- | --- |
| 평소 없던 device code flow | 사용 앱과 사용자 의도, 후속 접근 | 승인된 CLI·장치 로그인 |
| 새 앱 동의 후 데이터 접근 | 실제 권한·게시자·승인자·접근량 | 새 업무 연동 |
| 앱 자격 증명·역할 변경 | 변경 주체와 배포 기록 | 정상 인증서 교체 |
| 메일 규칙·외부 전달 추가 | 대상 주소와 기존 업무 정책 | 승인된 업무 전달 |

우선 포털에서 정상 이벤트 한 개의 원문 구조를 확인합니다. Defender의 KQL 예제를 Splunk SPL에 그대로 붙이지 않습니다. 수집 커넥터의 필드 매핑이 확인된 뒤 검색을 작성합니다.

## 5단계 — 계정·세션·앱을 함께 통제하기

증거 보존과 동시에 진행 중인 피해를 차단합니다. 계정 잠금 또는 접근 제한, 세션·refresh token 철회, 비밀번호·앱 자격 증명 교체, 악성 동의·역할·메일 규칙 제거를 노출 범위에 맞춰 결정합니다. 사람 계정의 비밀번호 변경은 별도 앱 자격 증명을 교체하지 않습니다.

**세션 철회가 모든 접근을 즉시 끝내는 것은 아닙니다.** Access token 수명, CAE 지원, 앱 자체 세션 처리에 따라 차이가 있으므로 실제 리소스 접근 차단을 검증합니다. [Microsoft 접근 철회 설명](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access).

## 6단계 — 방어와 복구 검증하기

피싱 저항성 MFA, 최소 권한, 불필요한 인증 흐름 제한, 앱 동의 검토와 워크로드 자격 증명 관리를 조합합니다. FIDO2/passkey는 피싱 저항성을 높이지만 모든 세션 탈취·단말 침해·앱 권한 악용을 해결하지는 않습니다.

Device code flow를 제한하려면 사용 현황을 조사하고 시험 그룹·report-only 평가부터 시작합니다. 장치 등록 등 필요한 흐름의 영향도 따로 검토합니다. [인증 흐름 정책](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-authentication-flows).

**완료 기준:** 시험 계정의 정상 로그인부터 앱 접근까지 추적하고, ‘비밀번호·세션·앱 권한·워크로드 자격 증명’ 중 무엇을 통제해야 하는지 구분합니다. 조치 뒤 신규 토큰·외부 전달·데이터 접근의 재발 여부를 확인합니다.

## 참고자료

- [Microsoft — 로그인 로그](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ins)
- [Microsoft — 비상 접근 철회](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access)
- [Microsoft — 인증 흐름 조건](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-authentication-flows)
- [클라우드·컨테이너 조사로 확장](cloud-container-forensics.html)
