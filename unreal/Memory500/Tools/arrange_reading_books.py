import math
from pathlib import Path

import bpy
from mathutils import Vector

root = Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root / 'SourceAssets/BookUpgrade/books.gltf'))
sources = sorted([obj for obj in bpy.context.scene.objects if obj.type == 'MESH'], key=lambda obj: obj.name)
selected = []
placements = [(-2.55, 0.49, 0.751, -12, 0), (-2.56, 0.50, 0.791, 13, 3), (-4.85, -1.50, 0.126, -5, 6), (-4.86, -1.49, 0.155, 8, 7), (-4.85, -1.50, 0.184, -3, 8)]
for index, (x, game_z, bottom, yaw, source_index) in enumerate(placements):
    source = sources[source_index]
    obj = source.copy()
    obj.data = source.data.copy()
    bpy.context.scene.collection.objects.link(obj)
    obj.name = f'Salon_ReadingBook_{index}'
    obj.rotation_euler = (0, math.pi / 2, math.radians(yaw))
    obj.location = (0, 0, 0)
    bpy.context.view_layer.update()
    corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector([min(corner[axis] for corner in corners) for axis in range(3)])
    maximum = Vector([max(corner[axis] for corner in corners) for axis in range(3)])
    center = (minimum + maximum) / 2
    obj.location = Vector((x - center.x, -game_z - center.y, bottom - minimum.z))
    selected.append(obj)
for obj in sources:
    bpy.data.objects.remove(obj, do_unlink=True)
bpy.ops.object.select_all(action='DESELECT')
for obj in selected:
    obj.select_set(True)
bpy.context.view_layer.objects.active = selected[0]
bpy.ops.export_scene.gltf(filepath=str(root / 'SourceExports/reading-books.glb'), export_format='GLB', use_selection=True)
