"""Check that the relocated native scene can resolve all external textures."""
import bpy
import json
import os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
images = []
for image in bpy.data.images:
    if image.source != 'FILE':
        continue
    path = bpy.path.abspath(image.filepath)
    images.append({
        'name': image.name,
        'packed': bool(image.packed_file),
        'available': bool(image.packed_file) or os.path.isfile(path),
    })
report = {
    'file': bpy.data.filepath,
    'version': bpy.app.version_string,
    'scenes': [{'name': s.name, 'objects': len(s.objects)} for s in bpy.data.scenes],
    'images': images,
    'missing': [i['name'] for i in images if not i['available']],
}
os.makedirs(os.path.join(root, 'test-results'), exist_ok=True)
with open(os.path.join(root, 'test-results', 'blender-relocation.json'), 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)
print(json.dumps(report, ensure_ascii=False))
if report['missing']:
    raise RuntimeError('Missing textures after relocation')
