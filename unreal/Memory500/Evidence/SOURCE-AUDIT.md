# Source and setup audit

Original extracted source: `../500-main`, read-only throughout this task.
Complete web checkout: `../WebBaselineComplete`, commit `4f5c1dce0809930e6ed096ba1d64288998141086`.
The extracted source omitted src/public/tools/tests/dist; the complete checkout was retrieved separately.

## Verified source facts

- Blender 5.2.2 LTS d13f752e3b9c, official ZIP SHA256 verified.
- Scene `500_Memory_Room`: 146 objects, METRIC, unit scale 1.0, 740700 source mesh triangles.
- A separate default `Scene` with Cube/Light/Camera is excluded from export.
- Original room footprint: 12x12 metres; walls approximately 4.9m high.
- Game coordinates X right/Y up/-Z north become Blender (x,-z,y). Import must verify Unreal centimetres and orientation.
- Six packed image textures: four 512px maps, one 2048px rug and one 768x1024 sky. Two additional images are Blender viewer buffers.
- `Paint` vertex color drives the three dolls, carousel and source avatar. Losing it changes story objects visibly.
- Original generator writes over the original .blend. It was inspected but never run.
- Web runtime adds photographs, painting, safe, fresco, floor PBR, trim, signs and material/lighting changes. Raw .blend import is not an exact web screenshot recreation.

## Preserve these identifiers

Letter, LockBox, MemoryFrame0–3, FrameCover0–3, ExitDoor, MusicCabinet,
Doll_violinist, Doll_bear, Doll_dancer, ViolinKeyring, Carousel, Painting,
Tile1–9, Bench, CowChart, BeefToken, Steak0–1, Cloche0–1.
`Doll_bear` now represents a conductor; its identifier remains puzzle-relevant.

## Supplied target status at initial audit

No user-selected 3–5 target images found in either inspected source folder.
Existing source documentation references Garnier, Wendt & Kühn and ROKR as inspiration.
Those links do not establish the user's current minimum visual-quality target.
Target path/link requested. Aesthetic iteration and any quality-completion claim wait for that input.

Later in this task, the user supplied two reference screenshots through the task `Unreal 에셋 품질 향상`. They were inspected before material/asset iteration; the actionable 20-property analysis is in `REFERENCE-ANALYSIS.md`. The first three paragraphs above describe the initial audit, not a current blocker.

## Observations from actual web baseline

- Walls and ceiling show little fine surface variation.
- Books, frame covers and furniture elements have simplified silhouettes.
- Contact areas often have weak grounding and shallow shadow contrast.
- Wood has strong repeated color detail, while its highlight response remains broadly uniform.
- The auto-quality mode drops render pixel ratio to 0.65 under current concurrent workloads.
- Fixed comparison captures therefore use the game's high-quality setting, DPR1, 1920x1080 browser viewport and recorded pose/FOV.
- Two pre-existing Three.js PMREM sigmaRadians warnings were observed; no browser runtime error was reported during baseline entry.

These are current-scene observations, not a reference-gap certification or an artistic score.
