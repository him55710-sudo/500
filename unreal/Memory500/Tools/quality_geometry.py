# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: imported by quality_build_realism.py inside Blender.
from __future__ import annotations

import math
from pathlib import Path
from typing import Final

import bmesh
import bpy
from mathutils import Vector

ROOT: Final = Path(__file__).resolve().parents[1]


def surface(name: str, color: tuple[float, float, float, float], response: tuple[float, float, float]) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    node = material.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = color
    node.inputs["Metallic"].default_value = response[0]
    node.inputs["Roughness"].default_value = response[1]
    node.inputs["Coat Weight"].default_value = response[2]
    node.inputs["Coat Roughness"].default_value = 0.15
    return material


def textured(name: str, response: tuple[float, float, float]) -> bpy.types.Material:
    material = surface(f"Realism_{name}", (1, 1, 1, 1), response)
    tree = material.node_tree
    shader = tree.nodes.get("Principled BSDF")
    for channel, socket in (("Color", "Base Color"), ("Rough", "Roughness")):
        tex = tree.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(str(ROOT / f"SourceAssets/Quality/Realism/Textures/{name}_{channel}.png"))
        if channel == "Rough":
            tex.image.colorspace_settings.name = "Non-Color"
        tree.links.new(tex.outputs["Color"], shader.inputs[socket])
    texture = tree.nodes.new("ShaderNodeTexImage")
    texture.image = bpy.data.images.load(str(ROOT / f"SourceAssets/Quality/Realism/Textures/{name}_Normal.png"))
    texture.image.colorspace_settings.name = "Non-Color"
    normal = tree.nodes.new("ShaderNodeNormalMap")
    normal.inputs["Strength"].default_value = 0.3
    tree.links.new(texture.outputs["Color"], normal.inputs["Color"])
    tree.links.new(normal.outputs["Normal"], shader.inputs["Normal"])
    return material


def mesh(name: str, geometry: tuple[list[tuple[float, float, float]], list[tuple[int, ...]]], material: bpy.types.Material) -> bpy.types.Object:
    data = bpy.data.meshes.new(name)
    data.from_pydata(geometry[0], [], geometry[1])
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    data.materials.append(material)
    model = bmesh.new()
    model.from_mesh(data)
    bmesh.ops.recalc_face_normals(model, faces=list(model.faces))
    model.to_mesh(data)
    model.free()
    for polygon in data.polygons:
        polygon.use_smooth = True
    return obj


def lathe(name: str, profile: tuple[tuple[float, float], ...], material: bpy.types.Material) -> bpy.types.Object:
    vertices = [(radius * math.cos(i * math.tau / 96), radius * math.sin(i * math.tau / 96), z) for radius, z in profile for i in range(96)]
    faces = [(j * 96 + i, j * 96 + (i + 1) % 96, (j + 1) * 96 + (i + 1) % 96, (j + 1) * 96 + i) for j in range(len(profile) - 1) for i in range(96)]
    return mesh(name, (vertices, faces), material)


def tube(name: str, points: tuple[tuple[float, float, float], ...], spec: tuple[float, bpy.types.Material]) -> bpy.types.Object:
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = spec[0]
    curve.bevel_resolution = 3
    curve.resolution_u = 8
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, coordinate in zip(spline.bezier_points, points, strict=True):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    curve.materials.append(spec[1])
    return obj


def cylinder(name: str, endpoints: tuple[tuple[float, float, float], tuple[float, float, float]], spec: tuple[float, bpy.types.Material]) -> bpy.types.Object:
    start, end = map(Vector, endpoints)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=spec[0], depth=(end - start).length, location=(start + end) * 0.5)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = (end - start).to_track_quat("Z", "Y").to_euler()
    obj.data.materials.append(spec[1])
    bevel = obj.modifiers.new("Machined_edge", "BEVEL")
    bevel.width = min(spec[0] * 0.15, 0.0008)
    bevel.segments = 3
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def sphere(name: str, position: tuple[float, float, float], spec: tuple[float, bpy.types.Material]) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=spec[0], location=position)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(spec[1])
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def finalize(objects: list[bpy.types.Object], name: str) -> bpy.types.Object:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=1.15192, island_margin=0.004)
    bpy.ops.object.mode_set(mode="OBJECT")
    return obj
