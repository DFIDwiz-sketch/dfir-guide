---
title: "소프트웨어 공급망·CI/CD 침해 조사"
description: "패키지·저장소·빌드·배포의 신뢰 경계를 구분하고 commit, 실행 기록, 산출물 digest와 운영 영향을 연결합니다."
category: "supply-chain"
updated: "2026-10-08"
tags: ["CI/CD", "패키지", "Provenance"]
order: "41"
level: "기초 · 실무 확장"
---

## 목표와 준비물

개발자가 내려받는 패키지, 빌드에서 실행하는 action·스크립트, 산출물을 배포하는 계정은 모두 신뢰 관계입니다. 패키지 취약점, 악성 배포, 저장소 계정 탈취와 CI/CD 권한 악용을 서로 구분합니다. 준비물은 저장소·잠금 파일·빌드 기록·배포 이력·산출물 digest와 읽기 권한입니다.

이 문서는 조사와 방어 설계입니다. 실제 패키지 설치나 빌드 스크립트를 실행해 의심 동작을 확인하기 전에 격리 분석이 필요한지 판단합니다.

## 1단계 — 소스에서 운영까지 연결표 만들기

| 구간 | 보존할 식별자 | 핵심 의문 |
| --- | --- | --- |
| 소스 | 저장소 URL·commit·PR·작성/승인 기록 | 누가 어떤 변경을 넣었는가 |
| 의존성 | 정확한 패키지명·버전·레지스트리·잠금 파일 | 실제 어떤 코드를 가져왔는가 |
| 빌드 | workflow·run ID·runner·입력·권한 | 어떤 환경·신원으로 실행했는가 |
| 산출물 | 파일 해시·이미지 digest·attestation | 무엇이 생성됐고 출처를 검증할 수 있는가 |
| 배포 | 환경·시각·승인·배포 ID·사용 자산 | 어느 운영 자산에 도달했는가 |

이름이 비슷한 패키지, 내부·공개 저장소의 이름 충돌과 새 유지관리자·릴리스도 검토 단서입니다. 이름의 유사성만으로 악성이라고 결론 내리지는 않습니다.

## 2단계 — 의심 산출물과 실행 범위 보존하기

문제가 된 버전·digest, 잠금 파일, 빌드 로그, 설정과 권한 변경을 보존합니다. 패키지를 설치한 사실과 설치 스크립트가 실제 실행된 사실을 구분합니다. 개발 PC, CI runner, 배포 서버, 운영 컨테이너별로 실행 여부를 따로 적습니다.

원본 저장소에서 파일을 지우거나 해당 버전을 롤백하기 전에 증거 사본과 영향을 받은 빌드 목록을 확보합니다. 피해가 진행 중이면 배포·릴리스 중단과 자격 증명 제한을 병행합니다.

## 3단계 — CI/CD 권한 경계 점검하기

비신뢰 PR·이슈·외부 자료가 권한 있는 작업에서 코드나 셸 입력으로 처리되는지 확인합니다. GitHub의 `pull_request_target`·`workflow_run` 등을 이름만 보고 안전하거나 위험하다고 단정하지 말고, **실행되는 코드의 출처와 해당 job의 토큰·secret 접근**을 함께 봅니다.

GitHub는 action을 전체 commit SHA로 고정하고 권한을 최소화하는 방법을 설명합니다. 태그 고정은 태그 이동에 영향을 받을 수 있고, SHA 고정도 안전한 코드 검토와 업데이트를 대신하지 않습니다. [GitHub 보안 강화 지침](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions).

## 4단계 — 출처 검증과 안전성 판단 구분하기

SBOM은 구성 요소 목록을 이해하는 데 쓰고, attestation/provenance는 산출물의 빌드 출처와 관련 주장을 검증하는 데 씁니다. 서명·증명이 유효해도 승인된 코드 자체에 취약하거나 악성 동작이 있을 수 있습니다. ‘누가 무엇으로 만들었는가’와 ‘그 동작이 안전한가’를 별도 평가합니다.

기대 저장소·workflow·commit·산출물 digest에 대해 검증 정책을 정합니다. 파일에 해시가 있다는 사실만으로 출처가 검증되지는 않습니다. [GitHub artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations).

## 5단계 — 실행 환경의 비밀정보까지 대응하기

실행된 코드가 접근할 수 있었던 토큰·클라우드 역할·배포 키·패키지 발행 권한을 조사합니다. 실제 접근 증거와 노출 가능 범위를 나눈 뒤 관련 비밀정보를 교체·철회하고 사용 이력을 확인합니다. 버전 롤백은 이미 탈취된 자격 증명을 무효화하지 않습니다.

OIDC 기반 단기 자격 증명을 쓰더라도 대상 저장소·branch·environment 등 신뢰 조건을 좁혀야 합니다. 과도한 권한이나 잘못된 신뢰 정책을 수명 단축만으로 해결할 수 없습니다. 자체 runner는 잔존 파일·다른 작업으로의 영향도 확인합니다.

## 6단계 — 깨끗한 빌드와 배포 검증하기

검토한 소스·의존성으로 신뢰할 수 있는 환경에서 다시 빌드하고 산출물 digest·배포 대상을 확인합니다. 취약성 검사, secret 검사, 의존성 변경 검토를 조합합니다. 스캐너의 미탐 가능성과 실제 실행 범위도 함께 기록합니다.

**무해한 실습:** 이 사이트 같은 정적 프로젝트에서 commit → workflow run → 게시 산출물의 관계를 한 번 추적합니다. 의심 패키지를 설치할 필요는 없습니다. **완료 기준:** 특정 산출물이 영향을 받은 자산 목록과 빌드 출처를 근거로 설명되고, 노출 자격 증명의 후속 조치가 기록되어야 합니다.

## 참고자료

- [GitHub — Actions 보안 강화](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
- [GitHub — Artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations)
- [클라우드·컨테이너 조사](cloud-container-forensics.html)
- [자격 증명 구조와 보호](credential-architecture.html)
