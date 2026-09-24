# Original music-room stationery

The mesh geometry, study melody, practice notes and paper textures were authored
for this project by the `quality_*` scripts. No third-party score, book scan or
photograph is embedded. Windows fonts are used to render the text; font files are
not redistributed.

- Three A4 sheets: 210 × 297 mm, 0.18 mm physical sheet thickness, small corner curl.
- Open notebook: 310 × 220 mm cover, two page blocks, two curved printed leaves.
- Two hexagonal pencils: 178 mm and 159 mm, exposed cedar/graphite tips, ferrules and erasers.
- Ten mesh actors, 9,500 exported triangles, three embedded 1024 × 1448 textures.
- Source GLB: 2,469,556 bytes; Blender source retained for revision.

Coordinates use meters in Blender and centimeters in Unreal, with Y reversed
between Blender and Unreal. The layout is authored for the existing salon desk;
do not auto-center or uniformly resize the imported scene. Offline bounds checks
confirm every prop is inside the desktop and no prop overlaps the original Letter
or LockBox footprints. See `Evidence/quality-stationery-validation.json`.

Rebuild from the Unreal project directory:

1. `uv run Tools/quality_stationery_textures.py`
2. `../Tooling/blender-5.2.2-windows-x64/blender.exe --background --threads 4 --python-exit-code 1 --python Tools/quality_build_stationery.py`
3. The editor-owning session runs `Tools/quality_import_stationery.py` in `MemorySalon_VisualSlice`. The script retains the full Assets/GLTF/Level pipeline stack while disabling mesh collision generation and Nanite before import.

`Evidence/quality-stationery-preview.png` is an offline Blender preview. Its plain
desk and lights are preview-only and are excluded from the exported GLB. Actual
The live import succeeded on 2026-09-25 at 00:31 KST. All ten meshes report zero
simple collision shapes; the largest imported-versus-authored bounding-box
difference is 0.000013 cm. Actual Unreal render inspection remains required after
any later authoring changes.
