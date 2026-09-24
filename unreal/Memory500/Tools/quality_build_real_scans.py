# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: Blender --background --threads 4 --python Tools/quality_build_real_scans.py
from __future__ import annotations

import json
import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "SourceAssets/Quality/Realism"
bpy.ops.wm.read_factory_settings(use_empty=True)
rng = random.Random(500)


def bounds(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    bpy.context.view_layer.update()
    points = [obj.matrix_world @ Vector(corner) for obj in objects for corner in obj.bound_box]
    return Vector(tuple(min(point[i] for point in points) for i in range(3))), Vector(tuple(max(point[i] for point in points) for i in range(3)))


def import_model(path: Path) -> list[bpy.types.Object]:
    previous = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    return [obj for obj in bpy.context.scene.objects if obj not in previous and obj.type == "MESH"]


def plant(asset: str, position: tuple[float, float, float], height: float) -> list[bpy.types.Object]:
    resolution = "1k" if asset == "potted_plant_04" else "2k"
    objects = import_model(ROOT / f"SourceAssets/Quality/{asset}/{asset}_{resolution}.gltf")
    low, high = bounds(objects)
    scale = height / (high.z - low.z)
    for obj in objects:
        obj.scale *= scale
        obj.location *= scale
    low, high = bounds(objects)
    offset = Vector(position) - Vector(((low.x + high.x) / 2, (low.y + high.y) / 2, low.z))
    for index, obj in enumerate(objects):
        obj.location += offset
        obj.name = f"Quality_RealPlant_{asset}_{index}"
    return objects


all_plants = []
for asset, location, height in (
    ("potted_plant_01", (-4.8, 4.8, 0.02), 1.53),
    ("potted_plant_02", (4.95, -4.85, 0.02), 1.22),
    ("potted_plant_04", (-4.48, 4.01, 1.086), 0.268),
):
    all_plants.extend(plant(asset, location, height))
templates = sorted(import_model(ROOT / "SourceAssets/BookUpgrade/books.gltf"), key=lambda obj: obj.name)
books = []
cursor = -2.095
index = 0
while cursor < 0.145:
    template = templates[index % len(templates)]
    book = template.copy()
    book.data = template.data
    bpy.context.collection.objects.link(book)
    book.matrix_world = Matrix.Rotation(math.pi / 2, 4, "Z") @ template.matrix_world
    book.location = (0, 0, 0)
    factor = rng.uniform(1.38, 1.70)
    book.scale *= factor
    low, high = bounds([book])
    width = high.y - low.y
    if cursor + width > 0.26:
        bpy.data.objects.remove(book, do_unlink=True)
        break
    target_front = -4.780 - rng.uniform(0, 0.028)
    book.location += Vector((target_front - high.x, -cursor - high.y, 1.6951 - low.z))
    book.name = f"Quality_RealShelfBook_{index:02}"
    books.append(book)
    cursor += width + rng.uniform(0.002, 0.006)
    index += 1
for obj in templates:
    bpy.data.objects.remove(obj, do_unlink=True)
book_report = []
for obj in books:
    low, high = bounds([obj])
    book_report.append({"name": obj.name, "min_cm": [low.x * 100, -high.y * 100, low.z * 100],
        "max_cm": [high.x * 100, -low.y * 100, high.z * 100]})
bpy.ops.object.select_all(action="DESELECT")
for obj in books:
    obj.select_set(True)
bpy.context.view_layer.objects.active = books[0]
bpy.ops.object.join()
shelf = bpy.context.object
shelf.name = "Quality_RealShelfBooks"
report = []
for obj in all_plants + [shelf]:
    low, high = bounds([obj])
    report.append({"name": obj.name, "vertices": len(obj.data.vertices),
        "triangles": sum(len(p.vertices) - 2 for p in obj.data.polygons), "uv_layers": len(obj.data.uv_layers),
        "min_cm": [low.x * 100, -high.y * 100, low.z * 100],
        "max_cm": [high.x * 100, -low.y * 100, high.z * 100]})
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=str(OUT / "real-plants-books.glb"), export_format="GLB", use_selection=True,
    export_apply=True, export_cameras=False, export_lights=False)
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "real-plants-books.blend"))
(ROOT / "Evidence/quality-real-scans.json").write_text(json.dumps({"objects": report, "books": book_report}, indent=2), encoding="utf8")
(OUT / "placement.json").write_text(json.dumps({"objects": report, "books": book_report}, indent=2), encoding="utf8")
print(json.dumps({"objects": len(report), "books": len(book_report), "triangles": sum(obj["triangles"] for obj in report)}))
if "--preview" in sys.argv:
    for obj in all_plants:
        obj.hide_render = True
    bpy.ops.mesh.primitive_plane_add(size=20, location=(-4.8, 1.0, 1.699))
    world = bpy.data.worlds.new("BookPreviewWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.3
    bpy.ops.object.light_add(type="AREA", location=(-3.0, 1.0, 3.8))
    light = bpy.context.object
    light.data.energy = 180
    light.data.size = 2.5
    light.rotation_euler = (Vector((-4.75, 1.0, 1.9)) - light.location).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.object.camera_add(location=(-2.1, 1.0, 2.60))
    camera = bpy.context.object
    camera.rotation_euler = (Vector((-4.75, 1.0, 1.9)) - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = 42
    scene = bpy.context.scene
    scene.camera = camera
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 16
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = 1200, 550
    scene.render.resolution_percentage = 100
    scene.render.filepath = str(ROOT / "Evidence/quality-real-books-preview.png")
    bpy.ops.render.render(write_still=True)
