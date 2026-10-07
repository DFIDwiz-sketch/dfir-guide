---
title: "Velociraptor 수집과 모니터링"
description: "단일 수집, Hunt와 Client Monitoring을 목적과 데이터 흐름에 맞춰 구분합니다."
category: "tools"
updated: "2026-10-07"
tags: ["Velociraptor", "Hunt", "모니터링"]
order: "18"
level: "입문"
---

## 목표와 준비물

한 호스트에서 필요한 자료를 확보하고, 수집 결과가 서버와 SIEM까지 전달되는지 확인합니다. 등록된 시험 클라이언트 한 대, 수집 권한과 설치 버전 정보를 준비합니다. 화면 명칭은 버전·권한에 따라 달라질 수 있으므로 아래의 대상·수집·결과 흐름을 기준으로 찾습니다.

## 1단계 — 수집 방식 선택하기

| 방식 | 사용할 상황 | 결과 확인 기준 |
| --- | --- | --- |
| 단일 Collection | 한 장비의 특정 자료 확인 | Client ID와 Flow ID |
| Hunt | 정해진 조건의 여러 장비 조사 | Hunt ID와 장비별 Flow·상태 |
| Client Monitoring | 새 이벤트를 계속 관찰 | 적용 라벨·이벤트 Artifact·시간 범위 |

일반적인 Hunt의 한 번 수집과 지속 감시는 다릅니다. 이벤트 Artifact에 따라 과거 자료를 읽는 범위도 다를 수 있으므로 정의를 확인합니다.

## 2단계 — 대상 한 대 확정하기

클라이언트 검색에서 호스트 이름을 찾고 **Client ID, OS, 마지막 연결 시각, 표시된 주소**를 확인합니다. 이름이 같거나 주소가 재할당됐을 수 있으므로 이름만으로 선택하지 않습니다.

**확인할 결과:** 시험할 Client ID가 확정되고 최근 접속 상태를 알 수 있어야 합니다. 오프라인 장비에 예약된 수집은 즉시 실행되지 않을 수 있습니다.

## 3단계 — 단일 Collection 실행하기

1. 선택한 클라이언트의 수집 화면으로 이동합니다. 공식 문서에서는 `Collected Artifacts` 또는 Collections 흐름으로 안내합니다.
2. 새 수집을 만들고 현재 설치에서 실제로 검색되는 Artifact를 선택합니다.
3. 설명과 정의에서 지원 OS, 권한, 매개변수와 출력을 확인합니다.
4. 첫 시도는 장비 정보처럼 작은 범위의 자료로 연결을 확인합니다. 예를 들어 설치에 존재한다면 `Generic.Client.Info`를 검토할 수 있습니다.
5. 수집 요청의 대상과 매개변수를 확인한 뒤 실행하고 Flow ID를 기록합니다.

Artifact가 안 보이면 철자를 바꿔 추측하기보다 설치 버전, 검색 필터, Artifact 유형과 서버에 등록된 정의를 확인합니다. 서버용 Artifact와 클라이언트용 Artifact도 구분합니다.

## 4단계 — 결과 행과 업로드 파일을 따로 보기

수집의 상태와 로그를 먼저 확인하고 결과 테이블 및 업로드 파일 영역을 봅니다. Artifact는 행을 반환할 수도, 파일을 업로드할 수도 있습니다. 파일 경로를 나열한 행이 있다는 사실만으로 해당 파일 바이트가 수집됐다고 볼 수 없습니다.

| 관찰 상태 | 다음 확인 |
| --- | --- |
| 대기 중 | 클라이언트 접속과 수집 예약 상태 |
| 실패·부분 결과 | 권한, 타임아웃, 리소스 제한과 오류 로그 |
| 완료됐지만 0행 | 필터·경로·시각·지원 OS·Artifact 조건 |
| 파일 목록만 있음 | 정의에 실제 업로드 단계가 있는지 |

성공 여부는 상태 한 칸으로 끝내지 않고 기대한 필드·기간·파일이 실제 있는지 확인합니다. 서버 내부의 임의 숫자 디렉터리를 추측해 찾지 말고 Client ID와 Flow ID로 결과에 접근합니다.

## 5단계 — Hunt 범위를 라벨로 제한하기

한 대의 수집이 검증되면 시험 대상에 전용 라벨을 붙이고 Hunt의 대상 조건에 그 라벨을 사용합니다. 라벨이 붙은 클라이언트 목록을 먼저 확인합니다. Hunt를 실행한 뒤 전체 합계뿐 아니라 **장비별 성공·실패·0행**을 나눠 봅니다.

현재 버전의 대상 선택 방식에서 OS 조건과 라벨 조건을 어떻게 지원하는지도 확인합니다. 지원하지 않는 조건 조합이 적용됐다고 가정하지 않습니다. 예상보다 많은 대상이 보이면 실행 전에 범위를 수정합니다.

## 6단계 — 필요한 경우 Client Monitoring 설정하기

지속 감시가 필요하다면 시험 라벨에 이벤트 Artifact를 적용합니다. 정의의 유형이 `CLIENT_EVENT`인지, 대상 채널과 필터가 무엇인지 확인합니다. 일반 수집 Artifact를 선택했다고 지속 감시가 되는 것은 아닙니다.

설정 반영 후 새 시험 이벤트를 만들고 원본 호스트 → Velociraptor 서버의 Client Events → 전달 경로 → Splunk 순서로 확인합니다. 예약 작업 예제는 [예약 작업 조사](scheduled-tasks.html)의 정상 관찰 실습을 사용할 수 있습니다.

## 7단계 — Splunk 전달과 지연 확인하기

Velociraptor 수집 성공이 Splunk 색인 성공을 뜻하지는 않습니다. 구성한 내보내기·전송 파이프라인을 확인하고 다음 정보를 유지합니다.

- 원래 이벤트 시각과 시간대
- Client ID와 실제 장비 이름
- Artifact·Flow ID 또는 Hunt ID
- 원문과 수집 시각

[Splunk 검색](splunk-basics.html)에서 실제 인덱스·sourcetype·필드를 확인합니다. 각 단계의 도착 시각을 비교해 지연 위치를 찾습니다. Hunt로 과거 로그를 가져온 경우 이벤트 시각과 수집 시각의 큰 차이는 정상일 수 있습니다.

## 완료 기준

한 대에서 목표 자료를 수집하고 Flow ID로 다시 열 수 있으며, 결과 행과 파일 업로드를 구분해 설명할 수 있어야 합니다. SIEM 연계가 목표라면 같은 기록을 양쪽에서 식별할 수 있는 연결점까지 남깁니다.

추가 공식 문서: [Collecting Artifacts](https://docs.velociraptor.app/docs/clients/artifacts/), [Searching for clients](https://docs.velociraptor.app/docs/clients/searching/).

## 참고자료

- [Velociraptor — Hunting](https://docs.velociraptor.app/docs/hunting/)
- [Velociraptor — Client Monitoring](https://docs.velociraptor.app/docs/clients/monitoring/)
- [Velociraptor — Client Labels](https://docs.velociraptor.app/docs/clients/labels/)
- [Microsoft — Audit Other Object Access Events](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/audit-other-object-access-events)
