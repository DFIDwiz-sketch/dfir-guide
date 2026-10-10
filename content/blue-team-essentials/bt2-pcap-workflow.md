---
title: "트래픽 수집 상세 2 · PCAP 보존·Wireshark 분석 절차"
description: "포맷·시각·품질을 확인하고 표시 필터와 스트림 분석으로 원문을 조사합니다."
category: "blue-team-essentials"
updated: "2026-10-10"
tags: ["2일차", "분할 학습", "블루팀 필수지식"]
order: "302.02"
level: "입문 · 상세 해설"
course_day: "2"
course_order: "2"
chapter_title: "Traffic Capture and Analysis"
textbook_page: "26"
lesson_type: "분할 학습"
chapter_parent: "bt2-traffic-capture"
part_order: "2"
textbook_range: "26–30"
---

## 내보내기 결과부터 확인하기

Arkime에서 세션을 찾은 뒤 캡처 파일을 내보낼 때 선택한 시간, 센서, 세션 범위와 포맷을 기록합니다. 페이로드만 추출한 파일에는 링크·IP·TCP 헤더가 없을 수 있습니다. 추출된 HTTP 객체는 파일 분석 대상으로, 실제 패킷 캡처는 Wireshark 대상으로 다룹니다. PCAPNG는 인터페이스 정보 등 추가 메타데이터를 담을 수 있으므로 불필요한 변환으로 정보를 잃지 않도록 원본도 보존합니다.

~~~bash
capinfos capture.pcapng
sha256sum capture.pcapng
~~~

위 명령은 조사 권한이 있는 실제 캡처 파일에 쓰는 예입니다. 자체 JSONL이나 HTTP 텍스트에는 적용하지 않습니다. capinfos에서 포맷, 시작·끝 시각, 패킷 수와 저장 길이를 검토합니다. 해시는 같은 바이트 파일인지 확인하는 수단이며 파일 내용의 진실성까지 보증하지 않습니다.

## 표시 필터와 캡처 필터

표시 필터는 이미 수집한 패킷을 화면에서 좁힙니다. 캡처 필터는 수집할 패킷 자체를 제한하므로 잘못 설정하면 이후에 필요한 자료가 남지 않습니다. 두 문법을 서로 바꿔 쓰지 않습니다.

| 목적 | Wireshark 표시 필터 예 | 캡처 필터 예 |
| --- | --- | --- |
| 한 단말의 통신 | ip.addr == 10.20.10.24 | host 10.20.10.24 |
| TCP/80 후보 | tcp.port == 80 | tcp port 80 |
| DNS로 해석된 패킷 | dns | udp port 53 or tcp port 53 |
| HTTP 요청 | http.request | 해당 조건과 같은 일반 BPF 표현은 없음 |
| 한 TCP 스트림 | tcp.stream eq 3 | 수집 뒤 부여되는 스트림 번호는 사용할 수 없음 |

IPv6는 ipv6.addr 등 적절한 필드를 사용합니다. 표시 필터 dns는 프로토콜 해석 결과를 대상으로 하고 포트 53 필터는 포트 조건입니다. 둘의 결과가 다를 수 있습니다. HTTPS를 http.request로 찾지 못했다고 HTTP 사용이 없었다고 단정하지 않습니다.

## 연결을 재조립해 읽기

관심 패킷에서 Follow TCP Stream 등 해당 프로토콜의 스트림 기능으로 요청과 응답을 함께 봅니다. 다른 연결의 응답을 섞지 않도록 시간·주소·포트·스트림 번호를 확인합니다. 스트림은 같은 파일 내 분석용 식별자이므로 다른 PCAP의 번호와 직접 같다고 연결하지 않습니다.

HTTP/1.1이 평문으로 관측되거나 적절히 복호화되었다면 메서드·Host·경로·응답·본문의 관계를 확인합니다. HTTP/2·3은 프레임·스트림과 복호화 상태에 맞는 해석이 필요합니다. Follow 기능의 출력만으로 파일 바이트가 완전하다고 가정하지 않습니다.

## 품질 문제를 공격 증거와 혼동하지 않기

응답이 없으면 비대칭 경로, 캡처 시작 시점, 드롭, 필터와 시간 범위를 확인합니다. 재전송은 혼잡·손실·서버 지연으로도 생깁니다. 호스트에서 수집한 패킷의 체크섬 경고는 오프로딩 영향일 수 있습니다. 이러한 현상 하나로 고의적인 회피나 공격을 판정하지 않습니다.

객체 추출 시에는 TCP 재조립, 전송 인코딩과 압축, 저장 길이 제한을 살핍니다. 일부 패킷만 남으면 완전한 해시와 파일 내용을 얻을 수 없습니다. 추출 파일은 실행하지 않고 형식·해시·문자열 같은 읽기 중심 분석부터 수행합니다.

## 조사 기록 예

“센서 A의 09:00~09:10 단말 업링크 자료를 분석했다. 포맷·해시를 기록했으며 일부 드롭이 있다. 선택 연결의 다운로드 응답을 확인했으나 단말 실행은 확인하지 않았다.” 범위, 관측, 한계와 후속 조사 항목이 함께 있어야 다른 분석자가 결과를 재검토할 수 있습니다.

## 공개 참고자료

- [Wireshark — Capture Filters](https://wiki.wireshark.org/CaptureFilters/)
- [Wireshark — Display Filters](https://wiki.wireshark.org/DisplayFilters/)
- [Wireshark — capinfos](https://www.wireshark.org/docs/man-pages/capinfos.html)
