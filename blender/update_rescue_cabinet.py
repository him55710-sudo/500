"""Update only cabinet objects in the existing native scene and export that subset."""
import bpy, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'blender'))
from rescue_cabinet import build_glass_cabinet
path = os.path.join(ROOT, 'blender', 'day-300-save-hyunsu.blend')
bpy.ops.wm.open_mainfile(filepath=path)
scene = bpy.context.scene
cabinet, door = scene.objects.get('Cabinet'), scene.objects.get('CabinetDoor')
if not cabinet or not door:
    raise RuntimeError('Expected existing Cabinet and CabinetDoor hinge')
build_glass_cabinet(scene, cabinet, door)
bpy.ops.wm.save_as_mainfile(filepath=path)
bpy.ops.object.select_all(action='DESELECT')
for root in (cabinet, door):
    root.select_set(True)
    for obj in root.children_recursive:
        obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/assets/rescue/trophy-cabinet.glb'),
    export_format='GLB',use_selection=True,export_cameras=False,export_lights=False,export_animations=False)
print('GLASS_CABINET_UPDATED')
