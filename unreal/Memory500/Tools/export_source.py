import sys
from pathlib import Path

import bpy

output = Path(sys.argv[sys.argv.index('--') + 1])
mode = sys.argv[sys.argv.index('--') + 2]
scene = bpy.data.scenes['500_Memory_Room']
bpy.context.window.scene = scene
bpy.ops.object.select_all(action='DESELECT')
subset_roots = {'MemoryFrame0', 'Doll_violinist', 'ArchedWindow',
                'Architecture_Aubusson_handwoven_floral_wool', 'Tile1'}
selected = []
for obj in scene.objects:
    root = obj
    while root.parent:
        root = root.parent
    if obj.type in {'MESH', 'EMPTY', 'FONT', 'CURVE'} and root.name != 'Hayoung':
        if mode == 'full' or root.name in subset_roots:
            obj.hide_set(False)
            obj.select_set(True)
            selected.append(obj.name)
bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB',
                          use_selection=True, use_active_scene=True,
                          export_yup=True, export_apply=True,
                          export_cameras=False, export_lights=False)
print(f'EXPORTED {len(selected)} original objects to {output}')
