# Reference analysis — supplied by user through Unreal 에셋 품질 향상

Targets: visual_refs/quality-interior.png (primary material/light reference), visual_refs/quality-bunker.png (object density and use marks only). Both inspected directly. The salon retains its dimensions, palette families and story objects.

| Property | Observed target | Action for the salon |
|---|---|---|
| Light direction | Interior: broad daylight enters tall windows from the right/rear | Key light belongs at the existing arched window |
| Dominant sources | Windows dominate; localized cabinet/practical light is secondary | Reduce chandelier dominance relative to window |
| Exposure | White curtains retain folds; bright window exterior loses some detail | Keep interior whites below clipping; fixed exposure for comparisons |
| Shadow softness | Broad penumbra, close-contact darkening under furniture | Large area source, grounded asset bases, verify actual shadow render |
| Indirect light | Walls and sofa remain readable away from windows | Lumen bounce, avoid arbitrary fill lights |
| Roughness | Sofa/rug matte; wood soft highlights, glass sharper | Separate textile/wood/brass response |
| Imperfections | Table boards vary; wall paint subtly uneven | PBR roughness and normal variation at physical scale |
| Geometry detail | Rounded sofa edges, seams, sagging cushions, thick boards | Licensed armchair and turned wood table; preserve puzzle props |
| Prop density | Intentional table ornament/pillows; bunker has work papers and tools | Small coherent seating group and desk objects, no random scatter |
| Scale | Furniture heights and textile weave read as familiar objects | Keep centimeter bounds audit on every imported object |
| Foreground | Rug fibers and tabletop joinery dominate close views | Rug material and real wood assets before post-process |
| Midground | Upholstery silhouette and uneven cushions | Use scanned/modelled furniture instead of primitive replacement |
| Background | Tall curtains, trim and coherent wall divisions | Retain salon architecture; restore existing artwork |
| Palette | Interior warm-neutral cream/wood with restrained accents | Keep salon ivory/brass, original colored story dolls |
| Contrast | Clear light direction without blacking out primary seating | Inspect bookshelf readability, especially CAM_C |
| Reflections | Limited broad wood sheen; little specular energy from fabric | Audit imported material parameters and actual surface response |
| Storytelling | Lived-in arrangement; bunker organized around a workstation | Preserve letters/photos/music objects and access routes |
| Wear | Bunker aged/chipped; interior only light material variation | Do not make the salon abandoned; subtle touch/use wear only |
| Texture sharpness | Fine fabric detail at close range without oversized noise | 1K minor assets, 2K normal assets; correct real-world tiling |
| Composition | Architectural frame around meaningful furniture grouping | Preserve CAM_A/B/C and room footprint; add detail within layout |

## Baseline gaps

1. Plain source materials, overly reflective-looking wool, simple books/furniture, missing web-added artwork.
2. Imported light commissioning has excessive bright patches and dark shelving; noisy shadow/indirect render requires investigation.
3. Source scene lacks the reference's secondary detail and textile surface variation.

No quality score or AAA completion claim. Each meaningful iteration requires new fixed camera images plus performance/playability evidence.
