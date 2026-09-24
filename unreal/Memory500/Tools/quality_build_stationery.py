# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: portable blender.exe --background --python Tools/quality_build_stationery.py.

from pathlib import Path
import json
import math

import bpy
from mathutils import Vector

root = Path(__file__).resolve().parents[1]
out = root / "SourceAssets/Quality/Stationery"
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0


def material(name: str, color: tuple[float, float, float], roughness: float, image: str = "", metal: float = 0.0) -> bpy.types.Material:
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1.0)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metal
    shader.inputs["Specular IOR Level"].default_value = 0.18
    if image:
        sample = result.node_tree.nodes.new("ShaderNodeTexImage")
        sample.image = bpy.data.images.load(str(out / image), check_existing=True)
        result.node_tree.links.new(sample.outputs["Color"], shader.inputs["Base Color"])
    return result


score = material("Stationery_OriginalScore", (1.0, 1.0, 1.0), 0.94, "original-score.png")
notes = material("Stationery_PracticeNotes", (1.0, 1.0, 1.0), 0.94, "practice-notes.png")
paper = material("Stationery_PaperEdges", (1.0, 1.0, 1.0), 0.97, "paper-plain.png")
cover = material("Stationery_OxbloodCover", (0.09, 0.018, 0.012), 0.8)
green = material("Stationery_GreenLacquer", (0.025, 0.10, 0.055), 0.48)
ochre = material("Stationery_OchreLacquer", (0.43, 0.23, 0.035), 0.5)
wood = material("Stationery_ExposedCedar", (0.56, 0.36, 0.19), 0.85)
graphite = material("Stationery_Graphite", (0.012, 0.014, 0.016), 0.5)
brass = material("Stationery_Ferrule", (0.4, 0.28, 0.09), 0.45, metal=1.0)
eraser = material("Stationery_UsedEraser", (0.25, 0.11, 0.09), 0.95)


def box(name: str, size: tuple[float, float, float], center: tuple[float, float, float], surface: bpy.types.Material, bevel: float) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=center)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(surface)
    edge = obj.modifiers.new("PhysicalEdgeRadius", "BEVEL")
    edge.width = bevel
    edge.segments = 3
    bpy.ops.object.modifier_apply(modifier=edge.name)
    return obj


def sheet(name: str, size: tuple[float, float], surface: bpy.types.Material, curl: float) -> bpy.types.Object:
    nx, ny = 16, 24
    vertices = []
    for j in range(ny + 1):
        v = j / ny
        for i in range(nx + 1):
            u = i / nx
            z = curl * (0.22 * math.sin(math.pi * u) ** 2 + 0.65 * u ** 10 * v ** 7 + 0.13 * math.sin(7.0 * u + 4.0 * v) ** 2)
            vertices.append(((u - 0.5) * size[0], (v - 0.5) * size[1], z))
    faces = []
    for j in range(ny):
        for i in range(nx):
            a = j * (nx + 1) + i
            faces.append((a, a + 1, a + nx + 2, a + nx + 1))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:
        index = loop.vertex_index
        mesh.uv_layers.active.data[loop.index].uv = ((index % (nx + 1)) / nx, (index // (nx + 1)) / ny)
    mesh.materials.append(surface)
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    thickness = obj.modifiers.new("PaperThickness", "SOLIDIFY")
    thickness.thickness = 0.00018
    thickness.offset = 1.0
    bpy.ops.object.modifier_apply(modifier=thickness.name)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    return obj


def pose(obj: bpy.types.Object, centimeters: tuple[float, float, float], yaw: float = 0.0) -> None:
    obj.location = (centimeters[0] / 100, -centimeters[1] / 100, centimeters[2] / 100)
    obj.rotation_euler.z = -math.radians(yaw)


assets = []
for index in range(3):
    obj = sheet(f"Quality_Stationery_Score_{index}", (0.21, 0.297), score if index == 2 else paper, 0.0025 if index == 2 else 0.0004)
    pose(obj, (-421.0 + index * 0.13, -350.0 + index * 0.2, 108.56 + index * 0.025), -7.0 + index * 1.3)
    assets.append(obj)

book_center = (-359.0, -376.0, 108.5)
binding = box("Quality_Stationery_NotebookCover", (0.310, 0.220, 0.0024), (0.0, 0.0, 0.0012), cover, 0.0010)
pose(binding, (book_center[0], book_center[1], book_center[2] + 0.12))
assets.append(binding)
for side in (-1, 1):
    center_x = book_center[0] + side * 7.45
    side_name = "Left" if side < 0 else "Right"
    block = box(f"Quality_Stationery_PageBlock_{side_name}", (0.143, 0.205, 0.006), (0.0, 0.0, 0.0), paper, 0.0006)
    pose(block, (center_x, book_center[1], book_center[2] + 0.55))
    assets.append(block)
    leaf = sheet(f"Quality_Stationery_OpenPage_{side_name}", (0.143, 0.205), score if side == -1 else notes, 0.004)
    pose(leaf, (center_x, book_center[1], book_center[2] + 0.86))
    assets.append(leaf)


def pencil(name: str, lacquer: bpy.types.Material, length: float) -> bpy.types.Object:
    pieces = []
    for title, radius1, radius2, start, stop, sides, surface in (
        ("Lead", 0.0001, 0.0011, 0.0, 0.004, 12, graphite),
        ("Cedar", 0.0011, 0.0035, 0.004, 0.021, 12, wood),
        ("Body", 0.0035, 0.0035, 0.021, length - 0.017, 6, lacquer),
        ("Ferrule", 0.0037, 0.0037, length - 0.017, length - 0.006, 16, brass),
        ("Eraser", 0.0035, 0.0030, length - 0.006, length, 16, eraser),
    ):
        bpy.ops.mesh.primitive_cone_add(vertices=sides, radius1=radius1, radius2=radius2, depth=stop - start, location=(0.0, 0.0, (start + stop) / 2.0))
        obj = bpy.context.object
        obj.name = name + title
        obj.data.materials.append(surface)
        pieces.append(obj)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in pieces:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = pieces[2]
    bpy.ops.object.join()
    result = bpy.context.object
    result.name = name
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    result.rotation_euler.y = math.pi / 2
    return result


for index, (center, yaw, surface, length) in enumerate((
    ((-396.0, -362.0, 108.9), 68.0, green, 0.178),
    ((-357.0, -375.0, 109.9), -18.0, ochre, 0.159),
)):
    obj = pencil(f"Quality_Stationery_Pencil_{index}", surface, length)
    pose(obj, center, yaw)
    assets.append(obj)

bpy.context.view_layer.update()
report = []
for obj in assets:
    corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    points = [(point.x * 100, -point.y * 100, point.z * 100) for point in corners]
    report.append({"name": obj.name, "min_cm": [min(point[i] for point in points) for i in range(3)], "max_cm": [max(point[i] for point in points) for i in range(3)], "vertices": len(obj.data.vertices), "uv_layers": len(obj.data.uv_layers)})
bpy.ops.object.select_all(action="DESELECT")
for obj in assets:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out / "salon-stationery.glb"), export_format="GLB", use_selection=True, export_yup=True, export_apply=True)
bpy.ops.wm.save_as_mainfile(filepath=str(out / "salon-stationery.blend"))
(root / "Evidence/quality-stationery-build.json").write_text(json.dumps(report, indent=2), encoding="utf8")

backdrop = box("PreviewOnly_Desktop", (1.16, 0.75, 0.025), (-3.91, 3.67, 1.072), wood, 0.002)
bpy.ops.object.camera_add(location=(-3.76, 3.18, 1.78))
camera = bpy.context.object
camera.rotation_euler = (Vector((-3.91, 3.67, 1.10)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 1.12
scene.camera = camera
bpy.ops.object.light_add(type="AREA", location=(-4.25, 3.4, 1.95))
light = bpy.context.object
light.data.energy = 45.0
light.data.shape = "DISK"
light.data.size = 0.7
light.rotation_euler = (Vector((-3.91, 3.67, 1.1)) - light.location).to_track_quat("-Z", "Y").to_euler()
scene.world = bpy.data.worlds.new("StationeryPreviewWorld")
scene.world.color = (0.18, 0.18, 0.18)
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x = 960
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(root / "Evidence/quality-stationery-preview.png")
bpy.ops.render.render(write_still=True)
print(f"STATIONERY_BUILD_COMPLETE: {len(assets)} meshes")
