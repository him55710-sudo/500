# Additional realistic object replacements

This package replaces the simplified green banker lamp, blue vessel, two floor
plants and generic shelf books while retaining their established scene identity.
It also adds a small real succulent at the back corner of the desk.

The lamp and vessel are original project models. The lamp has a hollow 3 mm opal
shade, separate lining, swivel fittings, turned brass, pull chain and power lead.
The 51.4 cm vessel has a continuous outer/inner profile and an open rolled mouth.
Nine original 1K maps provide subtle brass, glass and glaze surface variation.

Plants are [Poly Haven CC0 assets](https://polyhaven.com/license):
[Potted Plant 01](https://polyhaven.com/a/potted_plant_01),
[Potted Plant 02](https://polyhaven.com/a/potted_plant_02), and
[Potted Plant 04](https://polyhaven.com/a/potted_plant_04).
The shelf reuses the existing [Book Encyclopedia Set 01](https://polyhaven.com/a/book_encyclopedia_set_01)
download in `../../BookUpgrade`. Twenty distinct book models are arranged into
53 volumes with varied sizes and gaps. Source hashes are in the parent manifest
and BookUpgrade manifest; derived package hashes are in `manifest.json`.

## Build

From the Unreal project directory, use `uv run Tools/quality_realism_textures.py`.
Then run each of these with the project's Blender 5.2.2 runtime, `--background`,
`--threads 4`, `--python-exit-code 1`, and `--python <script>`:

1. `Tools/quality_trim_architecture.py`
2. `Tools/quality_build_realism.py`
3. `Tools/quality_build_real_scans.py` (append `-- --preview` for the book preview)

The original salon GLB and original Blender project remain untouched.
`trim-plan.json` identifies exact source visuals and the preserved replacement
geometry. Every retained face's coordinate signature matches its source after
removing only the measured lamp/vessel/plant regions. Book actors contain only
the original shelf books and are replaced as complete visuals.

Revision 2 also removes the original 48 brass book bands (5,184 faces) from
the merged architecture. `trimmed-architecture-v2.glb` replaces revision 1;
the old derived visuals are disabled during apply. Source cabinet ray casts
showed the old book placement protruded beyond its supporting shelf. The new
book fronts are at approximately -478.05 cm X, and the bottoms are 0.01 cm above
the shelf at 169.5 cm. `placement.json` records these corrected target bounds.

## Apply

Only the editor-owning task runs these in `/Game/Maps/MemorySalon_VisualSlice`:

1. Execute `Tools/quality_stage_realism.py` through `Tools/run_unreal.py`.
2. Let the editor complete asset and shader preparation after that call returns.
3. In a separate call, execute `Tools/quality_apply_realism.py`.

The complete Interchange pipeline stack is preserved; simple collision and
Nanite generation are disabled before import. There is no immediate collision
state mutation after import. The apply step copies the current original material
overrides onto three preserved architecture meshes before hiding replaced visual
components. Original actors, source assets, story roots and existing collision
remain. The source blueprint and reference level are not modified.

Expected new meshes: 3 preserved architecture meshes, 2 authored objects, and
12 real plant/book meshes. The authored objects have 53,800 triangles; plants and
books have 433,331 triangles. The texture resolution is 2K for the two floor
plants and 1K for the succulent, books and authored surface maps. These are mesh
counts and source resolutions, not a runtime performance certification.

The final source lamp includes a 0.95 cm brass link between the last pull-chain
bead and its handle. The current saved level uses the previously imported lamp
plus `Quality_LampChainLink`, created by `Tools/repair_lamp_chain.py`. If the final
authored GLB is reimported over that lamp, remove or hide the separate connector
to avoid duplicate geometry. A fresh import of the final GLB needs no repair.

Actual Unreal close views and the three fixed comparison views were inspected
on 2026-09-25. They confirm the chain connection, vessel mouth, plant detail,
shelf support and removal of the old floating brass book bands. Fourteen object
bounds match their authored targets within 0.000031 cm; all seventeen imported
meshes have zero simple collision shapes. See the project's
`Evidence/quality-realism-ko.md` and `Evidence/quality-realism-bound-validation.json`.
The editor owner separately validates final runtime performance and main integration.
