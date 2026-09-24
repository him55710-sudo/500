# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: Blender --background --python Tools/quality_audit_replacement_geometry.py
from __future__ import annotations

import json
from pathlib import Path

import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT / "SourceExports/salon-source.glb"))
report = []
for obj in bpy.context.scene.objects:
    if obj.type != "MESH" or obj.name not in {
        "Architecture_Aged_brass", "Architecture_Sage_foliage",
        "Architecture_Warm_bulb", "Architecture_Frame_green",
        "Architecture_Blue_rain_glass", "Architecture_Charcoal",
    }:
        continue
    coordinates = [obj.matrix_world @ v.co for v in obj.data.vertices]
    parent = list(range(len(coordinates)))

    def find(index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    positions = {}
    for index, co in enumerate(coordinates):
        key = tuple(round(axis, 5) for axis in co)
        if key in positions:
            parent[find(index)] = find(positions[key])
        else:
            positions[key] = index
    for edge in obj.data.edges:
        parent[find(edge.vertices[0])] = find(edge.vertices[1])
    groups = {}
    for index, co in enumerate(coordinates):
        groups.setdefault(find(index), []).append((co.x * 100, -co.y * 100, co.z * 100))
    parts = []
    for points in groups.values():
        low = [round(min(co[axis] for co in points), 3) for axis in range(3)]
        high = [round(max(co[axis] for co in points), 3) for axis in range(3)]
        if obj.name == "Architecture_Sage_foliage" or (low[0] < -350 and high[0] > -510 and low[1] < -300 and high[1] > -480 and high[2] < 210) or (low[0] < -450 and high[0] > -475 and low[1] < 45 and high[1] > -225 and low[2] > 168 and high[2] < 228):
            parts.append({"vertices": len(points), "min_cm": low, "max_cm": high})
    report.append({"name": obj.name, "total_vertices": len(coordinates), "parts": parts})
(ROOT / "Evidence/quality-replacement-geometry.json").write_text(json.dumps(report, indent=2), encoding="utf8")
print(json.dumps(report, indent=2))
residuals = []
for obj in bpy.context.scene.objects:
    if obj.type != "MESH":
        continue
    world = [obj.matrix_world @ vertex.co for vertex in obj.data.vertices]
    positions = [(co.x * 100, -co.y * 100, co.z * 100) for co in world]
    included = [(-501 <= p[0] <= -449 and -222 <= p[1] <= 42 and 168 <= p[2] <= 228) for p in positions]
    faces = [face for face in obj.data.polygons if all(included[i] for i in face.vertices)]
    if not faces:
        continue
    points = [positions[i] for face in faces for i in face.vertices]
    residuals.append({"name": obj.name, "faces": len(faces), "min_cm": [min(p[i] for p in points) for i in range(3)],
        "max_cm": [max(p[i] for p in points) for i in range(3)], "materials": [mat.name for mat in obj.data.materials]})
(ROOT / "Evidence/quality-book-residual-geometry.json").write_text(json.dumps(residuals, indent=2), encoding="utf8")
cabinet = bpy.data.objects["MusicCabinet_detail"]
tree = BVHTree.FromObject(cabinet, bpy.context.evaluated_depsgraph_get())
inverse = cabinet.matrix_world.inverted()
contacts = []
for x in (-4.65, -4.70, -4.75, -4.76, -4.80, -4.90):
    origin = inverse @ Vector((x, 1.0, 1.705))
    direction = (inverse.to_3x3() @ Vector((0, 0, -1))).normalized()
    location, normal, index, distance = tree.ray_cast(origin, direction, 0.5)
    contacts.append({"x_cm": x * 100, "hit_cm": list((cabinet.matrix_world @ location) * 100) if location else None})
(ROOT / "Evidence/quality-book-support.json").write_text(json.dumps(contacts, indent=2), encoding="utf8")
