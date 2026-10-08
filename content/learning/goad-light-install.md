---
title: "GOAD-Light 01 · Windows/VirtualBox 설치"
description: "사전 점검, WSL 1·Vagrant·VirtualBox 설치, GOAD-Light 프로비저닝, IP 검증과 스냅샷까지 단계별 안내."
category: "learning"
updated: "2026-10-08"
tags: ["GOAD-Light", "VirtualBox", "Vagrant", "설치"]
order: "41"
level: "입문"
---

## 출발점

[전체 과정 지도](goad-light-overview.html)를 읽고 Windows 호스트의 RAM·디스크·가상화 지원을 확인합니다. 아래 명령은 **Windows PowerShell**, **WSL Debian**, **GOAD VM 내부** 중 어디서 실행하는지 구분했습니다. 설치 파일의 최신 요구 버전은 실행일에 [GOAD Windows 안내](https://orange-cyberdefense.github.io/GOAD/installation/windows/)와 [VirtualBox 안내](https://orange-cyberdefense.github.io/GOAD/providers/virtualbox/)를 다시 확인합니다.

### 0. 작업표 만들기

| 기록 | 예시/확인 방법 |
| --- | --- |
| 호스트 RAM·남은 디스크 | Windows 작업 관리자 → 성능, 탐색기 → 드라이브 속성 |
| 가상화 활성화 | 작업 관리자 → 성능 → CPU → 가상화 |
| 기존 VirtualBox 호스트 전용 대역 | VirtualBox → Tools → Network → Host-only Networks |
| 랩 대역 | 기본 예시 `192.168.56.0/24`; 집/회사 VPN·다른 가상 네트워크와 중복되면 변경 |
| 설치 시각·시간대 | Windows와 VM의 시간 동기 확인; 이후 로그 비교에 사용 |

> 설치/프로비저닝용 인터넷과 **취약 VM에 외부에서 들어오는 경로**는 다른 문제입니다. GOAD VM의 호스트 전용 NIC를 가정용 라우터의 브리지 NIC로 바꾸지 않습니다. 교육용 계정과 암호를 다른 시스템에 재사용하지 않습니다.

## 1. 호스트에 필수 도구 설치

1. [VirtualBox 다운로드](https://www.virtualbox.org/wiki/Downloads)에서 설치하고 재부팅합니다. GOAD의 Windows 문서는 작성 시점에 VirtualBox **7.1.x 이하**와 Vagrant의 호환성을 안내합니다. 최신 VirtualBox가 자동으로 호환된다고 가정하지 마세요.
2. [Vagrant 설치](https://developer.hashicorp.com/vagrant/install)와 공식 안내에서 링크한 Visual C++ 재배포 패키지를 설치합니다. 터미널을 닫고 다시 열어 `vagrant --version`, `VBoxManage --version`으로 확인합니다.
3. 관리자 PowerShell에서 WSL을 설치합니다. Windows의 재부팅 안내를 따르고 Microsoft Store에서 Debian을 설치합니다.

```powershell
wsl --install
wsl --list --verbose
```

4. 공식 GOAD Windows 경로는 **WSL 1**에서 시험됐다고 명시합니다. Debian 배포 이름을 `wsl --list --verbose`에서 확인한 뒤 바꿉니다. 전환이 끝나면 버전 열이 `1`인지 재확인합니다.

```powershell
wsl --set-version Debian 1
wsl --list --verbose
vagrant plugin install vagrant-reload vagrant-vbguest winrm winrm-fs winrm-elevated
vagrant plugin list
```

WSL 전환 명령이 실패하면 Microsoft의 [WSL 설치·버전 안내](https://learn.microsoft.com/windows/wsl/install)를 먼저 해결합니다. WSL 2와 Windows 호스트의 Vagrant/VirtualBox를 섞은 구성에서 오류가 났다면 같은 명령을 반복하기보다 현재 WSL 버전과 실행 경로를 기록합니다.

## 2. Debian에서 GOAD 받아 준비

**WSL Debian 터미널**에서 Python을 확인하고 필요한 기본 도구를 설치합니다. `C:` 대신 공간이 충분한 Windows 드라이브를 골라도 됩니다. 공식 Windows 문서는 WSL에서 프로젝트를 **`/mnt/c/...` 같은 Windows 드라이브 아래** 두도록 안내합니다.

```bash
python3 --version
sudo apt update
sudo apt install python3 python3-pip python3-venv libpython3-dev git
cd /mnt/c/Users
```

`cd /mnt/c/Users`는 위치 확인 예시입니다. 탐색기에서 미리 만든 `C:\Labs`를 쓴다면 다음과 같이 이동합니다. 디스크 공간이 모자라면 `D:\Labs`를 만들고 `/mnt/d/Labs`로 바꿉니다.

```bash
cd /mnt/c/Labs
git clone https://github.com/Orange-Cyberdefense/GOAD.git
cd GOAD
git rev-parse --short HEAD
./goad.sh -t check -l GOAD-Light -p virtualbox
```

마지막 명령이 필수 의존성을 누락했다고 하면 출력을 보관하고 [GOAD 설치 도움말](https://orange-cyberdefense.github.io/GOAD/installation/)의 해당 항목을 설치합니다. 버전 차이에 따라 GOAD 관리 스크립트와 옵션이 바뀔 수 있습니다. `goad.sh` 실행 권한이 없다면 `ls -l goad.sh`와 저장 위치를 확인하세요. 임의의 블로그 설치 명령을 우선하지 않습니다.

## 3. GOAD-Light 만들기

WSL Debian의 `GOAD` 디렉터리에서 실행합니다. `192.168.56`은 **세 옥텟**으로 지정하는 공식 예시입니다. 기존 네트워크와 겹치면 본인 환경에 맞는 미사용 사설 대역으로 바꾸고 작업표에 남깁니다.

```bash
./goad.sh -t install -p virtualbox -l GOAD-Light -ip 192.168.56
```

처음에는 이미지 다운로드 → VM 생성 → Ansible 설정 순으로 진행되므로 오래 걸릴 수 있습니다. 실패 메시지가 나면 **세 단계 중 어디서** 실패했는지 확인합니다. 끝난 후 GOAD 콘솔도 열 수 있습니다.

```bash
./goad.sh
```

콘솔에서 `?`를 입력하면 설치된 버전의 명령을 확인할 수 있습니다. 버전별 명령어를 확인하지 않고 `destroy`, `reset` 같은 동작을 실행하지 마세요.

## 4. 대상·네트워크 검증

VirtualBox 관리자에 세 대상 VM이 보이는지 확인합니다. 공식 GOAD-Light 문서 기준 도메인/역할은 다음과 같습니다. 공식 페이지 일부 본문에는 오래된 전체 GOAD 설명이 섞인 문장이 있으므로 **실제 VM 이름과 GOAD 버전의 인벤토리**를 최종 기준으로 삼습니다.

| VM | 역할 | 도메인 |
| --- | --- | --- |
| kingslanding | DC01 | `sevenkingdoms.local` |
| winterfell | DC02 | `north.sevenkingdoms.local` |
| castelblack | SRV02 | `north.sevenkingdoms.local` |

1. 각 VM의 **Settings → Network**에서 어떤 NIC가 호스트 전용 네트워크인지, 어떤 NIC가 NAT인지 기록합니다. 어댑터를 함부로 지우면 Vagrant/Ansible 재실행에 영향을 줄 수 있습니다.
2. VM 화면에 로그인할 수 있으면 Windows PowerShell에서 `hostname`, `ipconfig /all`, `Get-Date`를 실행합니다. IP는 공식 예제 값을 외우지 말고 출력으로 확인합니다.
3. PC의 PowerShell에서 `ipconfig`로 VirtualBox Host-Only 어댑터를 확인합니다. 실제 대상 IP로 `Test-NetConnection <대상IP> -Port 445`를 실행해 네트워크만 검사합니다. 해당 포트 실패만으로 GOAD 프로비저닝 실패라고 단정하지 않습니다.
4. 이름 해석은 대상 VM에서 `Resolve-DnsName kingslanding.sevenkingdoms.local`로 확인하고 DNS 서버 주소를 기록합니다. 시계가 크게 다르면 Kerberos 실습이 실패하므로 Windows 시간과 `w32tm /query /status`를 확인합니다.

```powershell
hostname
ipconfig /all
Get-Date
w32tm /query /status
```

**완료 기준:** 세 VM의 역할·주소·DNS와 호스트 전용 NIC, 설치한 GOAD 커밋, 설치 완료 화면 또는 오류 없는 콘솔 상태를 노트에 적었습니다.

## 5. 공격자 VM 연결과 복구 지점

Kali/Ubuntu VM을 따로 만들고 **VirtualBox → 해당 VM → Settings → Network**에서 랩에 접속할 NIC를 GOAD가 쓰는 **같은 Host-only Network**에 연결합니다. 설치용 NAT NIC를 추가했다면 업데이트를 마친 뒤 랩 작업 중 네트워크 경로를 확인합니다. 공격 VM에서 `ip addr` 또는 `ipconfig`로 IP를 기록하고, 앞 단계에서 확인한 **실제 대상 IP**에만 연결 시험을 합니다.

```bash
ip addr
ping -c 2 <확인한_GOAD_IP>
```

ICMP 차단으로 ping이 실패해도 TCP가 통할 수 있습니다. 공격자 VM과 GOAD VM의 NIC 이름/대역을 비교하세요. **VirtualBox promiscuous mode만 켠다고 모든 VM 패킷이 센서에 복제되지는 않습니다.** 네트워크 수집은 [02 · 텔레메트리](goad-light-telemetry.html)에서 별도로 다룹니다.

프로비저닝이 끝나고 세 VM이 안정적으로 부팅되면 동일한 이름(예: `baseline-clean-2026-10-08`)으로 대상 VM들의 스냅샷을 만듭니다. 나중에 분석 VM과 공격 VM도 별도 스냅샷을 만듭니다. **도메인 컨트롤러를 서로 다른 시점으로 따로 복원하면 AD 상태가 어긋날 수 있으므로**, 실습 전 세 VM을 같은 기준 시점으로 맞추고 일괄 복원 계획을 적습니다. 복원 후 인증/DNS/시간을 다시 확인합니다.

## 막혔을 때

| 증상 | 먼저 볼 곳 | 다음 조치 |
| --- | --- | --- |
| `vagrant` 명령이 없음 | 새 PowerShell의 `vagrant --version`; PATH | 설치 후 터미널 재시작 |
| WSL에서 Vagrant/VirtualBox 호출 실패 | `wsl --list --verbose`, 프로젝트 경로 | WSL 1과 Windows 드라이브 경로 확인 |
| VM 부팅 중 메모리 부족 | 작업 관리자의 사용량·동시 VM 수 | 분석/센서는 잠시 끄고 GOAD부터 검증 |
| 이름 해석 불가 | 대상의 DNS 서버, `ipconfig /all` | 올바른 랩 DNS 지정 여부 확인 |
| 3대 중 하나만 실패 | 설치 출력의 제공/설정 단계, VM 콘솔 | 원인 수정 후 공식 GOAD 콘솔의 도움말로 해당 단계 재실행 |
| 로그인/티켓 오류 | `Get-Date`, `w32tm`, DNS, 도메인 | 시간·DNS·계정 범위를 먼저 확인 |

다음: [02 · 블루팀 수집 환경](goad-light-telemetry.html).

## 공식 자료

- [GOAD 설치와 스크립트 인자](https://orange-cyberdefense.github.io/GOAD/installation/)
- [GOAD Windows 호스트 준비](https://orange-cyberdefense.github.io/GOAD/installation/windows/)
- [GOAD VirtualBox 공급자](https://orange-cyberdefense.github.io/GOAD/providers/virtualbox/)
- [GOAD-Light 구성](https://orange-cyberdefense.github.io/GOAD/labs/GOAD-Light/)
