import bpy,os
from mathutils import Vector
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p=os.path.join(root,'external/quaternius-base/Universal Base Characters[Standard]/Base Characters/Godot - UE/Superhero_Male_FullBody.gltf')
bpy.ops.import_scene.gltf(filepath=p)
for o in bpy.context.selected_objects:
 print('OBJ',o.name,o.type,'loc',tuple(o.location),'rot',tuple(o.rotation_euler),'scale',tuple(o.scale))
 if o.type=='MESH':
  pts=[o.matrix_world@Vector(c) for c in o.bound_box];print('BOUNDS',[(min(p[i] for p in pts),max(p[i] for p in pts)) for i in range(3)]);print('MATS',[m.name for m in o.data.materials])
 if o.type=='ARMATURE':print('BONES',[(b.name,tuple(b.head),tuple(b.tail)) for b in o.data.bones if b.name in ['Head','upperarm_l','upperarm_r','lowerarm_l','lowerarm_r','thigh_l','thigh_r']])
