# DFIR Guide · 한국어 보안 지식 가이드

Windows·Linux·메모리·네트워크 포렌식, 인증·Active Directory, 시스템 내부 구조와 프로그래밍, 웹 보안, 악성코드 분석·리버싱, APT·위협 인텔리전스, 블루팀·레드팀·퍼플팀, 대응 플레이북과 학습 노트를 정리하는 사이트입니다.

NTLM 인증·공격·방어 전체 가이드와 Word 다운로드, 주제별 초기 글을 포함합니다. 검색은 제목·본문·태그를 대상으로 실행되며, PC와 모바일 메뉴, 글 목차와 코드 복사를 제공합니다.

## GitHub Pages로 공개하기

1. 이 저장소의 **Settings → Pages**를 엽니다.
2. **Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.
3. **Actions → Publish DFIR Guide → Run workflow**를 실행합니다. 이후 `main`에 변경을 저장하면 자동으로 빌드·배포합니다.
4. 성공한 배포의 `github-pages` 링크를 확인합니다. 예정 주소는 `https://dfidwiz-sketch.github.io/dfir-guide/`입니다.

이 주소는 Pages 활성화와 배포가 성공한 뒤 사용할 수 있습니다. 권한·Pages 설정 등으로 워크플로가 실패하면 해당 실행의 오류를 먼저 확인하세요.

## 단계별 학습 콘텐츠

처음 방문하면 `first-investigation.html`에서 가상 로그 12개를 분석합니다. JSONL, SHA-256 목록과 외부 패키지가 필요 없는 Python 요약 스크립트를 `downloads/`에 포함합니다. 실제 사건이나 제품의 원본 로그 형식이 아닌 학습용 예제입니다.

DFIR 기본, 증거 보존, Splunk, Windows·Linux 초기 조사, Windows 이벤트, 네트워크 조사, Velociraptor, 예약 작업과 NTLM 플레이북은 준비물·단계·결과 해석·완료 기준을 포함합니다. `learning-roadmap.html`에서 8단계 학습 경로를 확인합니다.

인증·권한, 시스템 증거, 탐지·대응의 연결 과정도 제공합니다. Kerberos·AD·자격 증명, Windows 내부 구조·Linux 지속성·메모리, 레드팀·퍼플팀·사고 대응 가이드에서 단계별 관찰과 완료 기준을 확인할 수 있습니다.

GOAD-Light 실습은 `goad-light-overview.html`에서 시작합니다. Windows/VirtualBox 설치, Splunk·Velociraptor·네트워크 센서 수집 검증, 제한된 공격 행동과 조사 기록을 네 편의 글로 연결합니다.

## 새 글 추가하기

`templates/article.md`를 복사해 `content/<분류>/my-article.md`로 저장합니다. 파일 이름에는 영문 소문자·숫자·하이픈만 사용하고 사이트 전체에서 중복되지 않게 합니다.

```yaml
---
title: "글 제목"
description: "독자가 확인할 내용을 한 문장으로 설명합니다."
category: "windows"
updated: "2026-10-07"
tags: ["Windows", "포렌식"]
order: "50"
level: "입문"
---
```

본문은 Markdown으로 작성합니다. 문서 제목은 자동으로 표시되므로 본문의 큰 절은 `##`, 하위 절은 `###`로 시작합니다. 같은 사이트의 다른 글은 파일 이름 기준으로 `[글 제목](my-article.html)`처럼 연결합니다. 분류·메뉴·검색 색인은 빌드 시 자동으로 갱신합니다.

| category | 메뉴 |
| --- | --- |
| fundamentals | DFIR 시작하기 |
| internals | 시스템 내부 구조 |
| programming | 보안 프로그래밍 |
| windows / linux / memory | 호스트 포렌식 |
| network | 네트워크 포렌식 |
| identity | 인증 · Active Directory |
| web-security | 웹 보안 |
| malware | 악성코드 · 리버싱 |
| threat-intelligence | APT · 위협 인텔리전스 |
| blue-team / red-team / purple-team | 팀별 보안 운영 |
| tools | 도구 가이드 |
| playbooks | 대응 플레이북 |
| learning | 학습 로드맵 · 실습 노트 |

주간 기술 실습은 `templates/technique-note.md`를 사용합니다. 원리, 실제 결과, 호스트·네트워크 흔적, 탐지, 대응과 남은 불확실성을 함께 남깁니다.

## 로컬 실행

Node.js 22 이상을 사용합니다.

```bash
npm ci
npm run build
npm run check
npm run preview
```

`http://localhost:4173/dfir-guide/`에서 확인합니다. 수정 후 `npm run build`를 다시 실행하면 새 콘텐츠가 반영됩니다. 서버가 실행 중이라면 브라우저만 새로고침합니다.

## 구조

- `content/`: 글과 메타데이터
- `assets/`: 디자인·검색·모바일 메뉴 동작
- `scripts/`: 정적 사이트 생성, 링크 검증과 미리보기
- `downloads/`: NTLM Word 원문
- `site.config.json`: 메뉴·분류·저장소와 예정 사이트 주소
- `.github/workflows/pages.yml`: GitHub Pages 빌드와 배포
- `dist/`: 생성된 공개 파일, Git 저장소에서 제외

## 작성 원칙

공식 공개 문서와 원본 프로젝트를 참고하고 출처·확인 날짜를 남깁니다. 사실·보고서의 추정·분석 가설·실습 결과를 구분합니다. 실제 사건의 개인정보·비밀정보·내부 환경과 비공개 교육자료는 게시하지 않습니다. 주제별 초기 글은 입문 자료이며 모든 세부 분야를 완성한 매뉴얼을 의미하지 않습니다.

## 2026-10-08 보강

공식 공개 자료를 대조해 10개 가이드를 추가했습니다. 보안 동향 허브에서 클라우드 계정·토큰, 경계 장비, ClickFix·RMM, 랜섬웨어·유출, 클라우드·컨테이너, 공급망·CI/CD, AI·에이전트, 암호화 통신, 수집 상태·지연으로 연결합니다. 메뉴에 클라우드·SaaS, 공급망·CI/CD, AI·에이전트 보안을 추가했습니다.

동향 글의 확인일과 출처 발표일·사건 관찰 기간은 서로 다릅니다. 사이트는 자동 뉴스 피드가 아니며 월간 또는 중요 권고 발생 시 재검토합니다. 예제 쿼리·명령은 환경별 필드·버전·권한을 확인해 사용하는 출발점입니다. 빌드·링크 검증은 실제 Splunk·Entra·Kubernetes에서의 실행 검증을 대신하지 않습니다.


## 네트워크 블루팀 2일차 보강

2022년 SEC450.2의 일반 주제를 공개 공식 자료와 독립 가이드로 확장했습니다. 원본 슬라이드·그림·VM을 게시하지 않습니다. `network-blue-team-path.html`에서 관측 지도, 수집과 증거, DNS 조사·헌팅, HTTP/HTTPS, 메일·DMARC, 원격 프로토콜과 통합 실습으로 진행합니다. 확인일은 2026-10-08입니다.

`downloads/network-day2-events.jsonl`은 정규화한 가상 기록 20개이며 제품 원본 형식이 아닙니다. `network-day2-mail.eml`은 발송하지 않은 비작동 헤더 예로 실제 DKIM 서명이 없습니다. `network-investigation-template.md`는 증거·가설·관측 공백·인계를 기록하는 양식입니다. Python·Splunk의 예시 집계와 한계를 실습 글에 설명합니다.
