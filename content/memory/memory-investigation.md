---
title: "메모리 포렌식의 조사 흐름"
description: "메모리 확보에서 프로세스·연결·의심 영역 확인까지, 결과의 한계를 함께 읽습니다."
category: "memory"
updated: "2026-10-07"
tags: ["메모리", "Volatility 3", "프로세스"]
order: "9"
level: "입문"
---

## 메모리에서 찾는 것

메모리에는 실행 중인 프로세스, 연결과 디스크에 아직 기록되지 않은 자료가 남을 수 있습니다. 확보 방식·OS·버전·수집 시각·해시를 기록하고 덤프의 민감정보 접근을 관리합니다. 메모리를 수집하는 동작도 장비 상태에 영향을 줍니다.

## Volatility 3로 분석 시작하기

먼저 이미지의 OS와 필요한 심볼이 식별되는지 확인합니다. Volatility 3는 Volatility 2의 profile 사용 방식과 다르므로 이전 명령을 그대로 옮기지 않습니다. 설치한 버전의 도움말과 플러그인 목록을 확인하세요.

| 목적 | 확인할 내용 |
| --- | --- |
| 이미지 적합성 | 운영체제, 덤프 형식과 심볼·레이어 구성 |
| 프로세스 맥락 | PID·PPID, 실행 이름과 생성 시점 |
| 행동 연결 | 명령행, 모듈, 핸들과 연결 자료 |
| 의심 영역 | 실행 가능한 메모리와 주변 코드·모듈 맥락 |
| 교차 검증 | EDR·이벤트 로그·디스크와 네트워크 자료 |

## Windows 메모리 사본 분석 예시

```bash
python vol.py -f memory.raw windows.info
python vol.py -f memory.raw windows.pslist
python vol.py -f memory.raw windows.pstree
```

`vol.py` 실행 방식은 소스 체크아웃 예시입니다. 패키지 설치에서는 실행 명령이 달라질 수 있습니다. 분석한 OS가 Windows인지 확인한 뒤 해당 플러그인을 선택합니다.

## 결과의 의미

비정상적인 프로세스 이름이나 부모 관계는 조사 출발점입니다. 이름만으로 악성 여부를 확정하지 않습니다. 메모리에서 추출한 실행 가능 영역도 정상 런타임·JIT 코드와 비교하고, 다른 증거로 실제 악용을 확인합니다.

## 참고자료

- [Volatility 3 — Windows Tutorial](https://volatility3.readthedocs.io/en/latest/getting-started-windows-tutorial.html)
- [Volatility 3 프로젝트](https://github.com/volatilityfoundation/volatility3)
