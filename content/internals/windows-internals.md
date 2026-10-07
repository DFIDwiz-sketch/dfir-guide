---
title: "Windows 내부 구조: 프로세스와 권한"
description: "프로세스·스레드·토큰·객체 권한을 로그와 연결하는 시스템 보안의 시작점."
category: "internals"
updated: "2026-10-07"
tags: ["Windows Internals", "프로세스", "토큰"]
order: "22"
level: "입문"
---

## 운영체제의 동작을 증거에 연결하기

프로그램 파일과 실행 중인 프로세스는 다릅니다. 프로세스는 코드와 주소 공간·자원을 가지며 스레드가 그 안에서 실행됩니다. 보안 조사는 이름 하나보다 실행 경로, 부모 관계, 계정과 권한을 함께 봅니다.

## 핵심 개념

| 개념 | 보안 관점 |
| --- | --- |
| 프로세스·스레드 | 실행과 보안 문맥의 단위 |
| 가상 메모리 | 프로세스 주소 공간과 메모리 분석 |
| Access token | 계정 SID·그룹·권한 등 보안 문맥 |
| 보안 객체·ACL | 파일·레지스트리 등 자원의 접근 판단 |
| 서비스 | 서비스 계정·실행 파일·시작 조건 |
| DLL과 API | 프로그램이 이용하는 기능과 모듈 |

Access token은 프로세스·스레드의 보안 문맥을 설명합니다. 같은 계정 이름이어도 토큰·제한·권한 활성 상태와 대상 ACL에 따라 가능한 동작이 달라질 수 있습니다.

## 조사할 연결점

4688·Sysmon 1의 실행을 계정·부모 프로세스와 연결하고 파일·레지스트리·네트워크의 후속 행위를 확인합니다. PID는 시간이 지나며 재사용될 수 있어 생성 시각과 장비를 함께 사용합니다.

## 공부 순서

프로세스와 스레드 → 파일·레지스트리·서비스 → 토큰·SID·ACL → 메모리·DLL·API → 인증과 자격 증명의 순으로 정리합니다. 각 개념을 작은 정상 프로그램에서 관찰한 뒤 로그의 어느 필드에 나타나는지 기록합니다.

## 참고자료

- [Microsoft — Processes and Threads](https://learn.microsoft.com/en-us/windows/win32/procthread/processes-and-threads)
- [Microsoft — Access Tokens](https://learn.microsoft.com/en-us/windows/win32/secauthz/access-tokens)
- [Microsoft — Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)
