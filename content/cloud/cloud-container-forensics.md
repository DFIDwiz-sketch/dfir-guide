---
title: "클라우드·컨테이너 포렌식의 출발점"
description: "클라우드 관리·데이터·워크로드 기록을 구분하고 Kubernetes의 임시 자원과 신원을 보존하는 조사 흐름."
category: "cloud"
updated: "2026-10-08"
tags: ["CloudTrail", "Kubernetes", "워크로드"]
order: "40"
level: "기초 · 실무 확장"
---

## 목표와 준비물

클라우드 사건을 VM 안의 로그만으로 조사하지 않습니다. **관리 API, 실제 데이터 접근, 워크로드 실행**은 다른 관측면입니다. 준비물은 시험 계정·프로젝트·클러스터의 읽기 권한, 자산 목록과 감사 로그 설정입니다. 비용이 발생하는 수집이나 운영 클러스터 설정 변경은 별도 변경 절차로 다룹니다.

아래는 제품 공통 조사 구조와 AWS·Kubernetes 예입니다. 하나의 공급사 로그 이름을 모든 클라우드에 그대로 적용하지 않습니다.

## 1단계 — 소유 범위와 신원 지도 만들기

조직·계정/구독·프로젝트·리전·클러스터·namespace·워크로드 담당자를 적습니다. 사람 사용자, 역할을 맡은 세션, 서비스 계정, 관리 ID와 CI/CD 신원을 구분합니다. 표시 이름보다 고유 ID·역할·세션·리소스 식별자를 우선 보존합니다.

‘같은 이름의 Pod’라도 다시 생성되면 다른 객체입니다. 클러스터, namespace, Pod UID, 컨테이너 ID, 노드, 이미지 digest와 생성 시각을 함께 기록합니다. IP와 태그만으로 장시간 활동을 연결하지 않습니다.

## 2단계 — 세 가지 관측면 확인하기

| 관측면 | 사례 | 핵심 확인 |
| --- | --- | --- |
| 관리·제어 | CloudTrail 관리 이벤트, Kubernetes audit | 누가 어떤 API·권한·설정을 변경했는가 |
| 데이터 접근 | 객체 저장소 읽기·쓰기, DB·SaaS 감사 | 실제 어떤 데이터에 접근했는가 |
| 워크로드·네트워크 | 앱·컨테이너 stdout, 노드 로그, 프로세스·흐름 | 실행과 연결이 무엇이었는가 |

AWS CloudTrail의 trail과 event data store는 기본적으로 데이터 이벤트를 기록하지 않습니다. 관리 이벤트와 구분해 필요한 데이터 이벤트를 선택·수집해야 합니다. Event history만으로 객체 읽기 내역 전체를 조회할 수 있다고 가정하지 않습니다. 대상 리소스·이벤트 선택·보존·비용을 점검합니다. [CloudTrail 데이터 이벤트](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html).

## 3단계 — 자원 소멸 전에 증거 확보하기

현재 Pod·노드·서비스 계정·역할 바인딩·Deployment 등 상위 객체와 배포 기록을 읽기 방식으로 확보합니다. 의심 컨테이너가 종료·재스케줄될 수 있으므로 중앙 로그와 감사 기록을 먼저 찾습니다. `kubectl logs`의 현재 출력만으로 이전 컨테이너 전체 이력을 보장할 수 없습니다.

정확한 클러스터 문맥과 시험 namespace를 확인한 후 다음처럼 조회할 수 있습니다. `lab`은 실제 허용된 namespace로 바꿉니다.

```bash
kubectl config current-context
kubectl get pods -n lab -o wide
kubectl get pod POD_NAME -n lab -o json
kubectl logs POD_NAME -n lab --timestamps
```

`POD_NAME`은 확인한 이름으로 바꿉니다. 여러 컨테이너면 대상을 지정해야 합니다. 출력에는 내부 주소·환경값·개인정보가 포함될 수 있으므로 원문을 제한된 증거 위치에 보존합니다. 조사한다고 무조건 `exec`를 실행하면 컨테이너 상태와 감사 기록이 바뀝니다.

## 4단계 — API 행동과 실행 연결하기

Kubernetes 감사에서 주체·verb·resource/subresource·namespace·응답 코드·source IP와 user agent를 확인합니다. Pod 생성, `pods/exec`, Secret 접근, 역할 바인딩·감사 설정 변경을 시간순으로 비교합니다. 해당 기록의 audit policy와 stage·level을 확인해 요청·응답 본문이 실제 남는지 판단합니다.

감사 정책이 없거나 제외된 요청이면 필요한 기록이 없을 수 있습니다. 반대로 Secret 본문을 무분별하게 수집하면 로그가 비밀정보 저장소가 됩니다. 최소한의 필요한 필드, 접근 제한과 보존 정책을 설계합니다. [Kubernetes 감사](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/).

## 5단계 — 워크로드와 신뢰 관계 함께 대응하기

위험한 Pod를 삭제하면 증거가 사라지고 상위 컨트롤러가 같은 이미지를 다시 실행할 수 있습니다. 이미지·배포 정의·CI/CD·서비스 계정·레지스트리 접근을 함께 확인합니다. 격리, 스케일 변경, 자격 증명 철회와 재배포는 서비스 담당자와 영향·증거를 고려해 결정합니다.

최소 RBAC, 과도한 host 접근·특권 컨테이너 제한, 승인 이미지·digest와 워크로드 네트워크 정책을 검토합니다. NetworkPolicy는 지원되는 CNI·정책 범위에서 작동하는지 시험하고 이름만 존재한다고 통제가 됐다고 보지 않습니다.

## 6단계 — 정상 API로 수집 검증하기

시험 namespace의 Pod 조회 하나를 수행하고 감사 원문·중앙 수집·검색까지 추적합니다. 이 조회는 공격 탐지 성능이 아니라 **API 관측 경로**를 검증합니다. 실제 audit policy에서 해당 읽기를 제외했다면 미관찰 이유를 기록합니다.

**완료 기준:** 특정 워크로드의 ‘신원 → 관리 API → 이미지/배포 → 실제 실행 → 데이터 접근’ 중 확인한 연결과 누락된 연결을 설명합니다. [공급망 조사](software-supply-chain.html)에서 빌드 출처까지 확장합니다.

## 참고자료

- [AWS — CloudTrail 데이터 이벤트](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html)
- [Kubernetes — Auditing](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/)
- [Kubernetes — Logging Architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/)
- [Kubernetes — Security Checklist](https://kubernetes.io/docs/concepts/security/security-checklist/)
