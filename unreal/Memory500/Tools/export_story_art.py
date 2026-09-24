import json
import math
from pathlib import Path

import bpy

root = Path(__file__).resolve().parents[1]
candidates = [parent / 'public/assets' for parent in root.parents]
candidates.append(root.parent / 'WebBaselineComplete/public/assets')
sources = next((candidate for candidate in candidates if (candidate / 'memories').is_dir()), None)
if sources is None:
    raise FileNotFoundError('Place this Unreal project inside the original repository so public/assets/memories is available')
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = 'Preserved_Web_Artwork'


def material(name, image_path=None):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (0.89, 0.855, 0.78, 1)
    shader.inputs['Roughness'].default_value = 0.86
    shader.inputs['Specular IOR Level'].default_value = 0.18
    if image_path:
        texture = result.node_tree.nodes.new('ShaderNodeTexImage')
        texture.image = bpy.data.images.load(str(image_path))
        result.node_tree.links.new(texture.outputs['Color'], shader.inputs['Base Color'])
        return result, texture.image.size[:]
    return result


def mesh(name, vertices, faces, uvs, surface):
    data = bpy.data.meshes.new(name)
    data.from_pydata([(x, -z, y) for x, y, z in vertices], [], faces)
    data.uv_layers.new(name='UVMap')
    for loop in data.loops:
        data.uv_layers.active.data[loop.index].uv = uvs[loop.vertex_index]
    data.materials.append(surface)
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)


def plane(name, center, width, height, right, surface):
    vertices = []
    for x, y in [(-0.5, -0.5), (0.5, -0.5), (0.5, 0.5), (-0.5, 0.5)]:
        vertices.append((center[0] + right[0] * x * width, center[1] + y * height, center[2] + right[2] * x * width))
    mesh(name, vertices, [(0, 1, 2), (0, 2, 3)], [(0, 0), (1, 0), (1, 1), (0, 1)], surface)


ivory = material('MemoryPhoto_Matboard')
files = ['day100.jpg', 'park.jpg', 'hyunsu-birthday.png', 'philippines.jpg', 'hayoung-painting.png']
for index, filename in enumerate(files):
    surface, size = material('MemoryPhoto_' + str(index), sources / 'memories' / filename)
    width, height = (0.97, 1.24) if index < 4 else (2.15, 1.48)
    center = (-4.65 + index * 1.6, 2.85, -5.655) if index < 4 else (5.655, 2.48, -1.75)
    right = (1, 0, 0) if index < 4 else (0, 0, 1)
    plane('StoryMatboard_' + str(index), center, width, height, right, ivory)
    fit = min(width / size[0], height / size[1])
    front = (center[0], center[1], center[2] + 0.001) if index < 4 else (center[0] - 0.001, center[1], center[2])
    plane('StoryPhoto_' + str(index), front, size[0] * fit, size[1] * fit, right, surface)
fresco, _ = material('OriginalSalonFresco', sources / 'salon-fresco.png')
vertices = [(0, 4.565, -0.7)]
uvs = [(0.5, 0.5)]
for index in range(80):
    angle = math.tau * index / 80
    vertices.append((math.cos(angle) * 2.02 * 1.3, 4.565, -0.7 + math.sin(angle) * 2.02))
    uvs.append((0.5 + math.cos(angle) * 0.5, 0.5 + math.sin(angle) * 0.5))
mesh('StoryCeilingFresco', vertices, [(0, index + 1, (index + 1) % 80 + 1) for index in range(80)], uvs, fresco)
bpy.ops.export_scene.gltf(filepath=str(root / 'SourceExports/story-art.glb'), export_format='GLB', use_active_scene=True, export_yup=True)
(root / 'Evidence/story-art-sources.json').write_text(json.dumps({'source': 'Existing web runtime world.js addArt and personal-memories.js', 'files': files + ['salon-fresco.png'], 'new_gameplay': False}, indent=2), encoding='utf8')
