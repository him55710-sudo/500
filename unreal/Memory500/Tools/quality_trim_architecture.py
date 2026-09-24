# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: Blender --background --python Tools/quality_trim_architecture.py
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Final

import bmesh
import bpy

ROOT: Final = Path(__file__).resolve().parents[1]
OUT: Final = ROOT / "SourceAssets/Quality/Realism"
REGIONS: Final = (
    ((-425.5, -422.0, 108.4), (-364.5, -378.0, 176.5)),
    ((-423.5, -398.5, 108.4), (-406.5, -381.5, 164.0)),
    ((-534.0, -526.0, -0.1), (-426.0, -432.0, 164.0)),
    ((440.0, 440.0, -0.1), (550.0, 528.0, 159.0)),
)


def inside(point: tuple[float, float, float], remove_book_bands: bool) -> bool:
    in_original_regions = any(all(low[axis] <= point[axis] <= high[axis] for axis in range(3)) for low, high in REGIONS)
    in_book_bands = -460.4 <= point[0] <= -459.0 and -206.7 <= point[1] <= 23.8 and 176.2 <= point[2] <= 218.5
    return in_original_regions or (remove_book_bands and in_book_bands)


def signature(polygons: list[bpy.types.MeshPolygon], mesh: bpy.types.Mesh) -> str:
    values = sorted(tuple(sorted(tuple(round(c, 7) for c in mesh.vertices[i].co) for i in polygon.vertices)) for polygon in polygons)
    return hashlib.sha256(json.dumps(values, separators=(",", ":")).encode()).hexdigest()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(ROOT / "SourceExports/salon-source.glb"))
    bpy.ops.object.select_all(action="DESELECT")
    report = []
    for obj in list(bpy.context.scene.objects):
        if obj.type != "MESH" or not obj.name.startswith("Architecture_") or "Walnut_plank" in obj.name:
            continue
        positions = [obj.matrix_world @ vertex.co for vertex in obj.data.vertices]
        marked = [inside((co.x * 100, -co.y * 100, co.z * 100), obj.name == "Architecture_Aged_brass") for co in positions]
        removed = [face.index for face in obj.data.polygons if all(marked[index] for index in face.vertices)]
        if not removed:
            continue
        if "Book_" in obj.name or "Aubusson" in obj.name:
            raise RuntimeError(f"Protected surface intersects replacement region: {obj.name}")
        original_name = obj.name.replace("|", "_").replace(" ", "_")
        before_count = len(obj.data.polygons)
        removed_indices = set(removed)
        kept = [face for face in obj.data.polygons if face.index not in removed_indices]
        digest = signature(kept, obj.data)
        original_materials = [material.name for material in obj.data.materials]
        if kept:
            model = bmesh.new()
            model.from_mesh(obj.data)
            model.faces.ensure_lookup_table()
            bmesh.ops.delete(model, geom=[model.faces[index] for index in removed], context="FACES")
            model.to_mesh(obj.data)
            model.free()
            obj.data.update()
            if signature(list(obj.data.polygons), obj.data) != digest:
                raise RuntimeError(f"Geometry outside removal region changed: {original_name}")
            obj.name = f"Quality_TrimV2_{original_name}"
            obj.select_set(True)
        report.append({"original_actor": original_name, "replacement_actor": obj.name if kept else None,
                       "original_faces": before_count, "removed_faces": len(removed),
                       "remaining_faces": len(kept), "unchanged_geometry_sha256": digest,
                       "materials": original_materials})
    if not report or not bpy.context.selected_objects:
        raise RuntimeError("No targeted architecture geometry was found")
    bpy.ops.export_scene.gltf(filepath=str(OUT / "trimmed-architecture-v2.glb"), export_format="GLB", use_selection=True,
                              export_apply=True, export_cameras=False, export_lights=False)
    (OUT / "trim-plan.json").write_text(json.dumps(report, indent=2), encoding="utf8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
