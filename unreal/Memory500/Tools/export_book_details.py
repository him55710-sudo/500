import math
from pathlib import Path

import bpy

root = Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
material = bpy.data.materials.new('Soft_aged_foil')
material.use_nodes = True
shader = material.node_tree.nodes.get('Principled BSDF')
shader.inputs['Base Color'].default_value = (0.48, 0.33, 0.13, 1)
shader.inputs['Metallic'].default_value = 0.55
shader.inputs['Roughness'].default_value = 0.52
titles = ['SONATAS', 'ETUDES', 'NOCTURNES', 'PRELUDES', 'WALTZES', 'CHAMBER']
for index in range(24):
    text = bpy.data.curves.new(f'Spine_{index}', 'FONT')
    text.body = f'{titles[index % len(titles)]}\n\nVOL. {index % 4 + 1}'
    text.align_x = 'CENTER'
    text.align_y = 'CENTER'
    text.size = 0.01
    text.space_line = 1.05
    text.extrude = 0.00008
    text.resolution_u = 3
    obj = bpy.data.objects.new(f'BookFoil_{index}', text)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = (-4.6045, -(-2.03 + index * 0.097), 1.88)
    obj.rotation_euler = (math.pi / 2, 0, math.pi / 2)
    text.materials.append(material)
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = obj
bpy.ops.object.convert(target='MESH')
bpy.ops.object.join()
bpy.context.object.name = 'Salon_BookSpineFoil'
bpy.ops.export_scene.gltf(filepath=str(root / 'SourceExports/book-details.glb'), export_format='GLB', use_selection=True)
