# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: Blender --background --threads 4 --python Tools/quality_build_realism.py
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
from quality_geometry import cylinder, finalize, lathe, mesh, sphere, surface, textured, tube

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "SourceAssets/Quality/Realism"
bpy.ops.wm.read_factory_settings(use_empty=True)
brass = textured("Brass", (0.88, 0.29, 0.12))
green = textured("GreenGlass", (0.0, 0.16, 0.75))
blue = textured("BlueGlaze", (0.0, 0.19, 0.72))
rubber = surface("Realism_WovenCable", (0.016, 0.012, 0.008, 1), (0.0, 0.63, 0.0))
ivory = surface("Realism_OpalLiner", (0.75, 0.78, 0.67, 1), (0.0, 0.23, 0.2))
bulb = surface("Realism_OpalBulb", (0.8, 0.68, 0.43, 1), (0.0, 0.32, 0.0))
bulb.node_tree.nodes.get("Principled BSDF").inputs["Emission Color"].default_value = (1, 0.72, 0.37, 1)
bulb.node_tree.nodes.get("Principled BSDF").inputs["Emission Strength"].default_value = 2.5

base = lathe("Cast_oval_foot", ((0.001, 0.001), (0.135, 0.001), (0.145, 0.004), (0.147, 0.010),
    (0.145, 0.015), (0.14, 0.019), (0.137, 0.02), (0.129, 0.022), (0.125, 0.028),
    (0.117, 0.031), (0.108, 0.034), (0.08, 0.038), (0.052, 0.043), (0.032, 0.047), (0.001, 0.047)), brass)
base.scale.y = 0.84
lathe("Stand_socket", ((0.001, 0.045), (0.029, 0.045), (0.032, 0.048), (0.032, 0.054),
    (0.027, 0.058), (0.025, 0.074), (0.019, 0.084), (0.015, 0.087), (0.015, 0.44),
    (0.017, 0.442), (0.017, 0.451), (0.019, 0.454), (0.02, 0.462), (0.02, 0.476), (0.01, 0.482)), brass)
for z in (0.10, 0.115, 0.422, 0.438):
    lathe(f"Collar_{z}", ((0.015, z), (0.0172, z + 0.001), (0.0172, z + 0.004), (0.015, z + 0.005)), brass)
for side in (-1, 1):
    tube(f"Yoke_{side}", ((0, 0.012, 0.476), (side * 0.055, 0.065, 0.487),
        (side * 0.20, 0.075, 0.496), (side * 0.309, 0.05, 0.519), (side * 0.311, 0.0, 0.545)), (0.007, brass))
    cylinder(f"Swivel_{side}", ((side * 0.284, 0, 0.545), (side * 0.326, 0, 0.545)), (0.017, brass))
    tube(f"Screw_slot_{side}", ((side * 0.3268, -0.007, 0.545), (side * 0.3268, 0.007, 0.545)), (0.00065, rubber))

vertices = []
faces = []
nx, nt = 48, 32
for ix in range(nx + 1):
    a = -math.pi / 2 + math.pi * ix / nx
    x = 0.292 * math.sin(a)
    factor = max(0.009, math.cos(a)) ** 0.36
    for it in range(nt + 1):
        angle = math.pi * it / nt
        vertices.append((x, 0.144 * factor * math.cos(angle), 0.535 + 0.12 * factor * math.sin(angle)))
for ix in range(nx):
    for it in range(nt):
        a = ix * (nt + 1) + it
        faces.append((a, a + 1, a + nt + 2, a + nt + 1))
shade = mesh("Hollow_opal_green_shade", (vertices, faces), green)
shade.data.materials.append(ivory)
solid = shade.modifiers.new("Glass_wall_3mm", "SOLIDIFY")
solid.thickness = 0.003
solid.material_offset = 1
solid.material_offset_rim = 1
for side in (-1, 1):
    tube(f"Shade_rolled_lip_{side}", tuple((vertices[ix * (nt + 1) + (0 if side == 1 else nt)][0],
        vertices[ix * (nt + 1) + (0 if side == 1 else nt)][1], 0.535) for ix in range(nx + 1)), (0.0018, green))
cylinder("Opal_light_tube", ((-0.232, 0, 0.539), (0.232, 0, 0.539)), (0.012, bulb))
for side in (-1, 1):
    cylinder(f"Porcelain_socket_{side}", ((side * 0.231, 0, 0.539), (side * 0.256, 0, 0.539)), (0.014, ivory))
for i in range(37):
    sphere(f"Pull_chain_{i:02}", (0.223, -0.058 + 0.006 * math.sin(i / 23), 0.529 - i * 0.004), (0.0017, brass))
weight = lathe("Pull_chain_drop", ((0.001, 0), (0.004, 0.003), (0.0055, 0.014), (0.005, 0.021), (0.002, 0.025)), brass)
weight.location = (0.223, -0.052, 0.351)
cylinder("Pull_chain_end_link", ((0.223, -0.052, 0.375), (0.223, -0.052, 0.3845)), (0.00055, brass))
tube("Cloth_power_lead", ((0, 0.12, 0.012), (-0.045, 0.19, 0.004), (-0.11, 0.215, 0.004),
    (-0.065, 0.245, 0.004), (-0.012, 0.263, 0.003), (0.015, 0.272, -0.035)), (0.003, rubber))
lamp = finalize(list(bpy.context.scene.objects), "Quality_RealLamp")
lamp.location += Vector((-3.95, 4.0, 1.085))

before = set(bpy.context.scene.objects)
profile = ((0.001, 0.001), (0.065, 0.001), (0.071, 0.004), (0.073, 0.009), (0.074, 0.022),
    (0.0745, 0.055), (0.075, 0.12), (0.0755, 0.23), (0.0748, 0.28), (0.073, 0.31),
    (0.068, 0.332), (0.057, 0.356), (0.044, 0.376), (0.034, 0.394), (0.031, 0.416),
    (0.030, 0.47), (0.031, 0.491), (0.037, 0.499), (0.038, 0.506), (0.036, 0.512),
    (0.031, 0.514), (0.027, 0.51), (0.026, 0.501), (0.026, 0.47), (0.027, 0.418),
    (0.031, 0.39), (0.041, 0.37), (0.054, 0.35), (0.065, 0.328), (0.069, 0.3),
    (0.07, 0.12), (0.069, 0.026), (0.063, 0.012), (0.001, 0.012), (0.001, 0.001))
lathe("Thrown_blue_vessel_wall", profile, blue)
for z, radius in ((0.018, 0.0742), (0.024, 0.0743), (0.486, 0.0315)):
    lathe(f"Vessel_gilt_band_{z}", ((radius, z), (radius + 0.0008, z + 0.001),
        (radius + 0.0008, z + 0.0025), (radius, z + 0.0035)), brass)
vessel = finalize([obj for obj in bpy.context.scene.objects if obj not in before], "Quality_RealBlueVessel")
vessel.location += Vector((-4.15, 3.9, 1.085))
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=str(OUT / "authored-props.glb"), export_format="GLB", use_selection=True,
    export_apply=True, export_cameras=False, export_lights=False)
report = []
for obj in (lamp, vessel):
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    report.append({"name": obj.name, "vertices": len(obj.data.vertices), "triangles": sum(len(p.vertices) - 2 for p in obj.data.polygons),
        "uv_layers": len(obj.data.uv_layers), "min_blender_m": [min(p[i] for p in points) for i in range(3)],
        "max_blender_m": [max(p[i] for p in points) for i in range(3)]})
(ROOT / "Evidence/quality-authored-realism.json").write_text(json.dumps(report, indent=2), encoding="utf8")
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "authored-props.blend"))

desk = surface("Preview_surface", (0.13, 0.085, 0.04, 1), (0.0, 0.6, 0.0))
bpy.ops.mesh.primitive_plane_add(size=200, location=(-3.95, 4.0, 1.084))
bpy.context.object.data.materials.append(desk)
world = bpy.data.worlds.new("PreviewWorld")
bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes.get("Background").inputs["Color"].default_value = (0.34, 0.37, 0.42, 1)
world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.45
for location, energy, size in (((-4.8, 3.0, 3.0), 180, 1.8), ((-2.5, 4.5, 2.5), 140, 1.2)):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.data.energy = energy
    light.data.shape = "DISK"
    light.data.size = size
    light.rotation_euler = (Vector((-4.0, 4.0, 1.4)) - light.location).to_track_quat("-Z", "Y").to_euler()
bpy.ops.object.camera_add(location=(-2.82, 2.56, 2.13))
camera = bpy.context.object
camera.rotation_euler = (Vector((-4.025, 4.0, 1.41)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.lens = 58
scene = bpy.context.scene
scene.camera = camera
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 20
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = 1000, 750
scene.render.resolution_percentage = 100
scene.render.filepath = str(ROOT / "Evidence/quality-authored-realism-preview.png")
bpy.ops.render.render(write_still=True)
print(json.dumps(report))
