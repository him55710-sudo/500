# 500 Memory — Unreal 음악 살롱

기존 Blender 음악실을 보존하면서 Unreal Engine 5.8에서 재질·조명·일반 소품을 개선하는 독립 시각 프로토타입입니다. 방과 고유한 퍼즐 물체를 유지하고, 걸어 다니며 가까이 살펴볼 수 있습니다.

**웹 게임의 퍼즐·진행·저장·음악·여러 챕터는 기존 Three.js 버전에 그대로 있습니다.** 이 Unreal 프로젝트에 전체 게임을 이식한 것은 아닙니다. 참고 사진과의 남은 차이는 [시각 제작 기준](VISUAL-BIBLE.md)과 [검증 결과](VERIFICATION.md)에 기록합니다.

![Unreal 최종 음악 살롱](Evidence/unreal-final-CAM_A.png)

| 고정 시점 | 기존 웹 | 원본 Unreal 임포트 | 개선 결과 |
| --- | --- | --- | --- |
| A — 방 전체 | [보기](Evidence/web-fixed-CAM_A.png) | [보기](Evidence/unreal-source-clean-CAM_A.png) | [보기](Evidence/unreal-final-CAM_A.png) |
| B — 책상과 퍼즐 | [보기](Evidence/web-fixed-CAM_B.png) | [보기](Evidence/unreal-source-clean-CAM_B.png) | [보기](Evidence/unreal-final-CAM_B.png) |
| C — 진열장 근접 | [보기](Evidence/web-fixed-CAM_C.png) | [보기](Evidence/unreal-source-clean-CAM_C.png) | [보기](Evidence/unreal-final-CAM_C.png) |

세 시점 모두 1920×1080과 동일 위치·화각을 유지했습니다. 추가 근접 화면: [램프·병](Evidence/lamp-detail.png), [편지·다이얼](Evidence/desk-detail.png), [식물](Evidence/plant-detail.png).

## 처음 실행

Windows, Unreal Engine **5.8**, Epic 설치 옵션의 **Templates and Feature Packs**, Git LFS가 필요합니다. C++ 개발 도구는 필요하지 않습니다.

```powershell
git lfs install
git lfs pull
cd unreal/Memory500
.\Open-Unreal.ps1
```

이미 이 폴더에 있다면 마지막 명령만 실행합니다. 설치 경로가 다르면 `-EngineRoot 'D:\Epic\UE_5.8'`처럼 지정합니다. 첫 실행의 셰이더 컴파일을 기다린 뒤 Play를 누르고 게임 화면을 클릭합니다. WASD로 이동하고 마우스로 둘러봅니다. Esc는 에디터 플레이를 종료합니다.

`Open-Unreal.ps1`은 설치된 Unreal의 1인칭 템플릿 의존성을 로컬에 복사하고, 220cm/s 이동 속도와 비교용 카메라 화각을 설정합니다. Epic 템플릿 원본 바이너리는 이 저장소에 중복 포함하지 않았습니다. 원본 웹 파일을 덮어쓰지 않습니다.

에디터를 거치지 않고 이미 준비된 방을 실행하려면:

```powershell
.\Play-Salon.ps1
# 내부 해상도 100% 비교
.\Play-Salon.ps1 -ScreenPercentage 100
```

이는 설치된 Unreal을 이용하는 독립 실행이며, 배포용 패키지 EXE는 아닙니다. 출력 목표는 1920×1080, 기본 내부 렌더는 TSR 85%입니다. Alt+F4로 닫습니다. 에디터를 닫고 실행하면 메모리 경쟁을 줄일 수 있습니다.

## 맵과 자동화

- `/Game/Maps/MemorySalon_VisualSlice`: 개선 장면과 기본 시작 맵.
- `/Game/Maps/MemorySalon_SourceBaseline`: 원본 Blender를 가져온 기준 장면. 웹이 런타임에 붙이는 사진/프레스코 등과 차이가 있습니다.
- `Tools/run_unreal.py`: 로컬 Python remote execution. `Tools/editor-session.json`의 실행 PID를 확인해 다른 에디터를 수정하지 않습니다.
- `Tools/mcp.mjs`: Unreal의 공식 ModelContextProtocol/EditorToolset을 호출하는 Node 도구.
- `Config/codex-mcp.example.toml`: Codex 연결 예시. 주소는 `http://127.0.0.1:8000/mcp`이며 이 컴퓨터 안에서 사용합니다.

MCP 플러그인과 Python 연결은 프로젝트에서 활성화되어 있습니다. 에디터를 하나만 연결해 사용합니다. Codex 사용자의 전역 설정이나 인증 정보는 저장소에 포함하지 않습니다.

## 동일 카메라 캡처

```powershell
.\Capture-Fixed.ps1 -Prefix comparison
```

실행 중인 이 프로젝트의 에디터가 필요합니다. 출력은 `Evidence/comparison-CAM_A.png`, B, C입니다. `Evidence/fixed-cameras.json`의 위치·회전·FOV를 검사하며 1920×1080, 내부 렌더 100%로 저장합니다. 이 카메라를 결과에 유리하게 옮기지 않습니다. `desk-detail.png` 등 별도 상세 화면은 고정 비교와 구분합니다.

## 보존·출처·재현

`Content`의 Unreal 에셋과 GLB/HDR/텍스처는 Git LFS로 관리합니다. `Saved`, `Intermediate`, `DerivedDataCache`, 실행 PID, 개발 컴퓨터의 경로/토큰은 커밋하지 않습니다. 웹 배포는 이 `unreal` 폴더를 제외합니다.

Poly Haven 에셋은 CC0이며 `SourceAssets` 하위 manifest에 원문 주소·다운로드 파일·해시가 있습니다. 생성한 악보·노트·연필과 추가 세부 모델은 `Tools/quality_*` 및 `Tools/export_*`에 제작 과정이 있습니다. 웹의 기존 사진과 천장 이미지는 원래 프로젝트 자산입니다. 사용자 참고 사진은 분석에 사용했고 배포 파일에 추가하지 않았습니다.

최초 Blender 내보내기는 원본을 직접 다시 생성하는 대신 복사본에서 `Tools/export_source.py`를 사용했습니다. 후속 작업에서도 원본 생성 스크립트가 기존 `.blend`를 덮어쓰는 점에 주의합니다. 새로운 방은 작은 부분부터 좌표·색·재질·충돌을 검증하고 가져옵니다.

대형 메시의 Interchange 임포트 직후 충돌 상태를 바꾸는 방식에서 에디터 충돌이 한 번 발생했습니다. 장식 소품은 임포트 파이프라인에서 충돌 생성을 먼저 끄고, 메시 교체는 임포트 완료 후 별도 단계로 실행합니다. 관련 스크립트가 이 방식으로 수정되었습니다.
