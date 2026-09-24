# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Read a copied Blender scene and record import-relevant facts without saving it.

Run: blender --background <copied.blend> --python audit_blend.py -- <report.json>
Uses Blender's bundled bpy runtime, not a standalone Python environment.
"""
import json
import sys
from pathlib import Path

import bpy

report_path = Path(sys.argv[sys.argv.index('--') + 1])
scenes = []
for scene in bpy.data.scenes:
    objects = []
    for obj in scene.objects:
        item = {
            'name': obj.name,
            'type': obj.type,
            'parent': obj.parent.name if obj.parent else None,
            'location': list(obj.location),
            'rotation': list(obj.rotation_euler),
            'scale': list(obj.scale),
            'dimensions': list(obj.dimensions),
            'matrix_world': [list(row) for row in obj.matrix_world],
            'materials': [slot.material.name if slot.material else None for slot in obj.material_slots],
            'modifiers': [{'name': mod.name, 'type': mod.type} for mod in obj.modifiers],
        }
        if obj.type == 'MESH':
            mesh = obj.data
            mesh.calc_loop_triangles()
            item['mesh'] = {
                'vertices': len(mesh.vertices),
                'triangles': len(mesh.loop_triangles),
                'uv_layers': [uv.name for uv in mesh.uv_layers],
                'color_attributes': [attribute.name for attribute in mesh.color_attributes],
            }
        objects.append(item)
    scenes.append({'name': scene.name, 'unit_system': scene.unit_settings.system,
                   'unit_scale': scene.unit_settings.scale_length, 'objects': objects})
images = [{'name': img.name, 'size': list(img.size), 'packed': bool(img.packed_file),
           'filepath': img.filepath, 'source': img.source} for img in bpy.data.images]
materials = []
for material in bpy.data.materials:
    nodes = []
    if material.use_nodes and material.node_tree:
        for node in material.node_tree.nodes:
            nodes.append({'name': node.name, 'type': node.type})
    materials.append({'name': material.name, 'nodes': nodes})
report = {'source': bpy.data.filepath, 'blender': bpy.app.version_string,
          'scenes': scenes, 'images': images, 'materials': materials}
report_path.write_text(json.dumps(report, indent=2), encoding='utf8')
print(json.dumps({'audit': str(report_path), 'scenes': len(scenes),
                  'objects': sum(len(scene['objects']) for scene in scenes), 'images': len(images)}))
