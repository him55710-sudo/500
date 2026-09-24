"""Create the shared character in its own scene; never rewrite the open chapter."""
import bpy, os, math, json
from mathutils import Matrix

ROOT = r'C:\Users\user\Downloads\500일 방탈출'
source_scene = bpy.context.scene
source = source_scene.objects.get('JourneyHyunsu')
if not source:
    raise RuntimeError('Open the authored journey scene containing JourneyHyunsu first.')
if bpy.data.scenes.get('Hyunsu_Character_Master'):
    raise RuntimeError('Master scene already exists; inspect it before rebuilding.')
scene = bpy.data.scenes.new('Hyunsu_Character_Master')
copies = {}
for obj in [source, *source.children_recursive]:
    if obj.name.startswith('Head') or any(p.name.startswith('Head') for p in [obj.parent] if p):
        continue
    copy = obj.copy()
    if obj.data: copy.data = obj.data.copy()
    scene.collection.objects.link(copy)
    copies[obj] = copy
for obj, copy in copies.items():
    copy.parent = copies.get(obj.parent)
    copy.matrix_parent_inverse = obj.matrix_parent_inverse.copy()
    copy.matrix_basis = obj.matrix_basis.copy()
    copy.name = (obj.name.split('.')[0].replace('HyunsuQuake_CC0_', 'Face_') + '_Master')
    copy.hide_render = False
    copy.hide_viewport = False
master = copies[source]
master.name = 'HyunsuMaster'
master.matrix_world = Matrix.Identity(4)
master['character_id'] = 'hyunsu-v1'
master['source'] = 'Shared authored day-300/day-400 face and body'
master['height_m'] = 1.689

# Garment layers stay authored and independently addressable for the rescue puzzle.
materials = {}
for obj in copies.values():
    if obj.type != 'MESH': continue
    for slot in obj.material_slots:
        if not slot.material: continue
        old = slot.material
        if old not in materials:
            materials[old] = old.copy()
            materials[old].name = old.name.split('.')[0] + '_Hyunsu'
        slot.material = materials[old]

bpy.context.window.scene = scene
def material(name, color):
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value=(*color,1)
    shader.inputs['Roughness'].default_value=.72
    return mat
navy=material('Hyunsu collar navy',(.018,.046,.085))
seam=material('Hyunsu stitch',(.07,.11,.16))
button=material('Hyunsu button',(.15,.17,.20))
torso=next(o for o in copies.values() if o.name.startswith('Torso_') and o.type=='EMPTY')
# Ribbed collar and a narrow placket add readable scale cues to the existing knit.
bpy.ops.mesh.primitive_torus_add(major_radius=.086,minor_radius=.009,major_segments=24,minor_segments=6,location=(0,0,1.545))
collar=bpy.context.object;collar.name='Collar_Master';collar.data.materials.append(navy);collar.parent=torso
for z in [1.46,1.40,1.34]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=6,radius=.011,location=(0,-.164,z))
    obj=bpy.context.object;obj.name='ShirtButton_Master';obj.scale=(1,.3,1);obj.data.materials.append(button);obj.parent=torso
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,-.163,1.405))
obj=bpy.context.object;obj.name='ShirtPlacket_Master';obj.dimensions=(.028,.009,.235);obj.data.materials.append(navy);obj.parent=torso

scene['notes']='One source for all Hyunsu appearances. Outfit and pose may change; geometry and head do not.'
os.makedirs(os.path.join(ROOT,'public/assets/characters'),exist_ok=True)
for obj in scene.objects: obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/assets/characters/hyunsu.glb'),use_selection=True,use_active_scene=True,export_yup=True)
bpy.data.libraries.write(os.path.join(ROOT,'blender/hyunsu-character-master.blend'),{scene})
# Frame the new character, keeping the chapter scene intact in the same session.
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        from mathutils import Quaternion, Vector
        area.spaces.active.region_3d.view_location=Vector((0,0,1.05))
        area.spaces.active.region_3d.view_distance=3.4
        area.spaces.active.region_3d.view_rotation=Quaternion((1,0,0),math.pi/2)
        area.spaces.active.shading.type='MATERIAL'
print(json.dumps({'master_scene':scene.name,'objects':len(scene.objects),'source_scene_preserved':source_scene.name,'asset':'public/assets/characters/hyunsu.glb'}))
