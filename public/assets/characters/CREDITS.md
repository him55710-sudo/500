# 현수 공통 캐릭터

`hyunsu.glb`는 구출방과 여행방이 함께 사용하는 캐릭터 원본입니다.

- 얼굴·눈·눈썹·머리카락: 프로젝트에 포함되어 있던 [Quaternius Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html), CC0.
- 몸, 의복 레이어, 칼라와 단추: 이 게임용 Blender 모델. 실제 인물 사진으로 재구성한 얼굴은 아닙니다.
- 기존 얼굴 원본: `blender/hyunsu-rescue-head.blend`.
- 공통 원본: `blender/hyunsu-character-master.blend`.
- 재현: `blender/build_hyunsu_master.py`로 공통 모델을 내보낸 뒤 `node tools/optimize-hyunsu.mjs`로 웹용 압축.

기존 구출방 재질 출처는 `docs/300일-현수를-구해라.md`에 있습니다.
