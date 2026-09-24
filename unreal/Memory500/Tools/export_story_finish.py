import math
from pathlib import Path

import bpy
from mathutils import Vector

root = Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)

def material(name, color, metallic=0, roughness=0.7):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    return mat

ink = material('Lock_engraving_charcoal', (0.025, 0.017, 0.009), 0.15, 0.58)
paper_fold = material('Envelope_fold_shadow', (0.48, 0.43, 0.33), 0, 0.92)
wax = material('Wax_pressed_edge', (0.46, 0.105, 0.15), 0, 0.64)
thread = material('Wool_edge_binding', (0.29, 0.25, 0.16), 0, 0.96)

def ribbon(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 1
    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for point, xyz in zip(spline.points, points):
        point.co = (xyz[0], -xyz[1], xyz[2], 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj

for wheel in range(7):
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' if wheel < 4 else '0123456789'
    for row, char in [(-1, alphabet[-1]), (0, alphabet[0]), (1, alphabet[1])]:
        angle = row * math.radians(31)
        curve = bpy.data.curves.new(f'Dial_{wheel}_{row}', 'FONT')
        curve.body = char
        curve.align_x = 'CENTER'
        curve.align_y = 'CENTER'
        curve.size = 0.027
        curve.extrude = 0.00003
        curve.resolution_u = 3
        obj = bpy.data.objects.new(curve.name, curve)
        bpy.context.scene.collection.objects.link(obj)
        obj.location = (-2.89 + wheel * 0.08, -(-3.308 + 0.0604 * math.cos(angle)), 1.2653 + 0.0604 * math.sin(angle))
        obj.rotation_euler = (math.pi / 2 - angle, 0, 0)
        obj.data.materials.append(ink)

for side in [-1, 1]:
    ribbon('Envelope_flap_fold', [(-3.70 + side * 0.278, -3.474, 1.0945), (-3.70 + side * 0.02, -3.299, 1.0945)], 0.00028, paper_fold)
    ribbon('Envelope_side_fold', [(-3.70 + side * 0.278, -3.126, 1.0945), (-3.70 + side * 0.1, -3.27, 1.0945)], 0.0002, paper_fold)
ribbon('Wax_stamp_impression', [(-3.70 + .029 * math.cos(i * math.tau / 96), -3.30 + .029 * math.sin(i * math.tau / 96), 1.1041) for i in range(97)], .00048, wax)

for side in [-1, 1]:
    for offset in [0, .005]:
        ribbon('Rug_sewn_binding', [(side * (2.084 - offset), -3 + i * 4.6 / 460, .0655 + .00035 * math.sin(i * 2.2)) for i in range(461)], .00085, thread)
    for offset in [0, .005]:
        ribbon('Rug_sewn_end', [(-2.10 + i * 4.20 / 420, -.7 + side * (2.284 - offset), .0655 + .00035 * math.sin(i * 2.2)) for i in range(421)], .00085, thread)

bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = obj
bpy.ops.object.convert(target='MESH')
bpy.ops.object.join()
bpy.context.object.name = 'Salon_StoryFinish'
bpy.ops.export_scene.gltf(filepath=str(root / 'SourceExports/story-finish.glb'), export_format='GLB', use_selection=True)
