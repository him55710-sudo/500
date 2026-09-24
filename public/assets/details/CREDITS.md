# 공간 디테일

`interiors.glb`의 창틀·벤치·머리판·가구 손잡이·벽등·조명·패널·좌석 소품은 이 게임을 위해 Blender에서 제작했습니다. 건축 자료의 사진이나 3D 모델을 추출한 자산이 아닙니다.

- 설계 자료와 적용 내용: `docs/공간-조작-리디자인.md`.
- 원본: `blender/interior-detail-library.blend`.
- 제작: `blender/build_interior_details.py`.
- 압축: `node tools/optimize-interiors.mjs`.
- 런타임의 목재 법선: 기존 [Poly Haven Wood Floor Deck](https://polyhaven.com/a/wood_floor_deck), CC0.
- 하늘과 직물 법선·거칠기: 프로젝트의 `tools/generate-salon-textiles.py`가 생성한 자체 패턴을 재사용합니다.
