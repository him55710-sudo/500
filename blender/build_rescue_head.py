"""Re-use Quaternius' CC0 authored face, eyes, eyebrows and side-parted hairstyle."""
import bpy,bmesh,os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE=os.path.join(ROOT,'external/quaternius-base/Universal Base Characters[Standard]')
scene=bpy.data.scenes.new('Hyunsu_Quaternius_CC0_Head');bpy.context.window.scene=scene
source=os.path.join(BASE,'Base Characters/Godot - UE/Superhero_Male_FullBody.gltf')
bpy.ops.import_scene.gltf(filepath=source)
parts=[]
for o in list(scene.objects):
 if o.type!='MESH':continue
 if o.name=='SuperHero_Male':
  bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<1.56 or (v.co.z<1.60 and abs(v.co.x)>.085)],context='VERTS');bm.to_mesh(o.data);bm.free()
 o.parent=None;o.modifiers.clear();parts.append(o)
bpy.ops.import_scene.gltf(filepath=os.path.join(BASE,'Hairstyles/Origin at 0/glTF (Godot)/Hair_SimpleParted.gltf'))
for o in bpy.context.selected_objects:
 if o.type=='MESH':
  o.parent=None;o.modifiers.clear();print('HAIR_BOUNDS',[(min(v.co[i] for v in o.data.vertices),max(v.co[i] for v in o.data.vertices)) for i in range(3)]);parts.append(o)
head=bpy.data.objects.new('RealHyunsuHead',None);scene.collection.objects.link(head)
for o in parts:
 o.parent=head
 if 'Hair' in o.name:
  # The origin-at-zero hairstyle is authored around the same head coordinates.
  zs=[v.co.z for v in o.data.vertices]
  if max(zs)<.8:
   for vert in o.data.vertices:vert.co.z+=1.71
 for vert in o.data.vertices:
  vert.co.x*=1.4;vert.co.y*=1.4;vert.co.z=(vert.co.z-1.68)*1.4+1.90
 for m in o.data.materials:
  if not m:continue
  for node in m.node_tree.nodes:
   if node.type=='TEX_IMAGE' and node.image and node.image.size[0]==0:
    candidate=os.path.join(BASE,'Base Characters/Textures',node.image.name.replace('_png.png','.png'))
    if os.path.isfile(candidate):node.image=bpy.data.images.load(candidate,check_existing=True)
 for poly in o.data.polygons:poly.use_smooth=True
# Only prepared meshes are exported; the original armature stays out of the asset.
for img in bpy.data.images:
 if img.size[0]>1024 or img.size[1]>1024:
  factor=1024/max(img.size);img.scale(max(1,int(img.size[0]*factor)),max(1,int(img.size[1]*factor)))
for o in scene.objects:o.select_set(o in parts or o==head)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/assets/rescue/hyunsu-head.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/hyunsu-rescue-head.blend'))
print('AUTHORED_HEAD_READY')
