# Realistic salon asset source

Powered by [Poly Haven](https://polyhaven.com).
Assets are [CC0](https://polyhaven.com/license). The two user reference images in
`../../visual_refs/quality-*.png` are visual targets, not licensed game assets.

Run `node Tools/quality_download.mjs` from the Unreal project directory to acquire
the curated files. `manifest.json` records source URLs, sizes, upstream MD5 and
local SHA-256 for every downloaded file. Model texture dependencies retain their
original relative paths. Do not move a glTF away from its `.bin` and `textures/`.

The 2K armchair and turned wooden table establish believable furniture silhouettes.
The 1K ceramic vase and candleholders provide controlled environmental detail.
The 2K walnut, plaster and jacquard sets include base color, DirectX normal and
roughness. Material images use centimeters in Unreal; texture catalogs describe
physical dimensions in millimeters. Normal and roughness maps must use linear
sampling, and normals must use normal-map compression.

Keep story objects, puzzle roots and traversal routes. Use these models in a
small, coherent seating cluster; do not replace puzzle actors with decorations.
Only the editor-owning session runs import/apply scripts to avoid overlapping
Unreal game-thread operations.

Application order in the open `/Game/Maps/MemorySalon_VisualSlice` level:

1. `Tools/quality_materials.py`: world aligned surface maps and component overrides.
2. `Tools/quality_import.py`: real furniture and small props with bounds-based grounding.
3. `Tools/quality_rug.py`: preserve the original rug image with textile shading.
4. `Tools/quality_flame.py`: correct black flame cards with additive unlit shading.

All four reject other level names. Their results are written to
`Evidence/quality-*-application.json`. `Tools/run_unreal.py <script> <run-result>`
is the existing live editor bridge. The scripts must finish in the actual editor;
compiling them outside Unreal only validates Python syntax.

Surface schema version 3 adds `ColorVariation`; plaster uses 0.25 for a maintained
warm ivory finish. A component's direct child material instance is preserved on
later apply runs, so lighting/art passes can retain their floor roughness tuning.

The supplemental [Stationery](Stationery/README.md) package contains original
authored desk props and its own manifest. Its import pipeline disables collision
generation and Nanite before loading the tiny meshes; no post-import collision
state mutation is required.

The additional [Realism](Realism/README.md) package replaces the simplified
banker lamp, blue vessel, floor plants and shelf books. It includes original
physical construction details plus three CC0 real plant models and the existing
twenty-model encyclopedia set. Its stage/apply operations are separate so the
editor can complete import preparation before the visual replacement is applied.
