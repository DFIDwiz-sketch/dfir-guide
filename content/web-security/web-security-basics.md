---
title: "웹 보안: 요청에서 서버 실행까지"
description: "HTTP·인증·접근 제어와 웹 취약점의 원리를 랩과 방어 증거로 연결합니다."
category: "web-security"
updated: "2026-10-07"
tags: ["HTTP", "웹 보안", "취약점 원리"]
order: "29"
level: "입문"
---

## HTTP의 흐름부터 읽기

요청 메서드·경로·헤더·쿠키·본문과 응답 상태·헤더·본문을 구분합니다. 사용자 인증과 해당 자원 접근의 권한 판단은 별개입니다. 웹 서버·앱·프록시·DB의 기록을 함께 보면 패킷만으로 보이지 않는 처리를 설명할 수 있습니다.

## 학습할 주제

| 주제 | 핵심 질문 |
| --- | --- |
| Authentication | 사용자의 신원을 어떻게 검증하는가 |
| Access control | 각 자원과 행동의 권한을 서버가 검사하는가 |
| SQL injection | 입력이 데이터와 쿼리 구조에서 어떻게 처리되는가 |
| XSS | 입력이 브라우저의 실행 문맥으로 들어가는가 |
| SSRF | 서버가 어떤 주소로 요청할 수 있는가 |
| File upload | 저장·검사·실행과 접근 정책이 어떻게 연결되는가 |

구체적인 학습과 재현에는 PortSwigger Web Security Academy의 주제별 설명과 제공 랩을 활용할 수 있습니다. 서비스는 무료로 제공되는 학습 자료와 실습 랩을 안내합니다.

## 공격과 방어를 함께 기록하기

실습에서 취약점의 원인, 처리된 입력과 결과를 설명합니다. 웹 요청·서버 로그·프로세스·파일·DB·네트워크에서 남는 자료를 비교하고 예방 설정과 탐지의 차이를 정리합니다.

## 웹셸 조사 예시 관점

업로드 요청 하나로 코드 실행을 확정하지 않습니다. 저장된 파일 내용, 이후 접근 요청, 웹 프로세스의 자식 실행과 통신을 연결합니다. 확장자·응답 코드·IDS 경보 각각의 증명 범위를 구분합니다.

## 참고자료

- [PortSwigger — Web Security Academy](https://portswigger.net/web-security)
- [PortSwigger — File upload vulnerabilities](https://portswigger.net/web-security/file-upload)
- [네트워크 포렌식 조사 흐름](network-investigation.html)
